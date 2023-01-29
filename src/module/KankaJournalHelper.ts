/* eslint-disable no-restricted-syntax,no-continue,no-await-in-loop */
import type KankaFoundry from '../KankaFoundry';
import { logError } from '../logger';
import { KankaApiChildEntity, KankaApiEntity, KankaApiEntityId, KankaApiEntityType, KankaApiId } from '../types/kanka';
import { ProgressFn } from '../types/progress';
import Reference from '../types/Reference';
import api from './api';
import createTypeLoaders from './createTypeLoaders';
import getMessage from './getMessage';
import ReferenceCollection from './ReferenceCollection';
import { getSetting } from './settings';
import AbstractTypeLoader from './TypeLoaders/AbstractTypeLoader';

type FlagTypes = {
    id: KankaApiEntityId;
    campaign: KankaApiId;
    snapshot: KankaApiChildEntity;
    type: KankaApiEntityType;
    version: string;
};

type WritableEntity = Pick<KankaApiEntity, 'child_id' | 'type'>;

export default class KankaJournalHelper {
    readonly #maxFolderDepth = 3;
    #loaders: Map<KankaApiEntityType, AbstractTypeLoader>;

    constructor(protected module: KankaFoundry) {
        this.#loaders = createTypeLoaders(api);
    }

    public findAllKankaEntries(): JournalEntry[] {
        return this.journal.filter(e => !!this.getFlag(e, 'id')) ?? undefined;
    }

    public findByEntityId(id: KankaApiEntityId): JournalEntry | undefined {
        return this.journal.find(e => this.getFlag(e, 'id') === id) ?? undefined;
    }

    public findByTypeAndId(type: KankaApiEntityType, id: KankaApiId): JournalEntry | undefined {
        return this.journal
            .find(e => this.getFlag(e, 'type') === type && this.getFlag(e, 'snapshot')?.id === id) ?? undefined;
    }

    public findAllByType(type: KankaApiEntityType): JournalEntry[] {
        return this.journal.filter(e => this.getFlag(e, 'type') === type);
    }

    public findFolderByFlags(flags: Record<string, unknown>): Folder | undefined {
        const entries = Object.entries(flags);

        return this.folders.find((folder) => {
            if (folder.data.type !== 'JournalEntry') return false;
            return entries.every(([flag, value]) => folder.getFlag(this.module.name, flag) === value);
        });
    }

    public getFlag<FlagName extends keyof FlagTypes>(
        entry: JournalEntry | undefined,
        name: FlagName,
    ): FlagTypes[FlagName] | undefined {
        if (!entry) return undefined;
        return entry.getFlag(this.module.name, name) as FlagTypes[typeof name];
    }

    public hasOutdatedEntryByEntityId(entity: KankaApiEntity): boolean {
        const entry = this.findByEntityId(entity.id);

        if (!entry) return false; // No entry means it cannot be outdated

        const currentVersion = this.getFlag(entry, 'version');
        if (!currentVersion) return true; // Should be updated!

        return this.buildVersionString(entity) > currentVersion;
    }

    public async write(
        campaignId: KankaApiId,
        writableEntities: WritableEntity[],
        entityLookup: KankaApiEntity[] = [],
        onProgress: ProgressFn | undefined = undefined,
    ): Promise<number> {
        const grouped = new Map<KankaApiEntityType, WritableEntity[]>();
        writableEntities.forEach((entity) => {
            if (!grouped.has(entity.type)) {
                grouped.set(entity.type, []);
            }

            grouped.get(entity.type)?.push(entity);
        });

        const total = writableEntities.length;
        let progress = 0;

        const promises = Array
            .from(grouped.entries())
            .map(async ([type, entities]) => {
                const loader = this.#loaders.get(type);
                if (!loader) {
                    progress += entities.length;
                    logError(new Error(`Cannot find TypeLoader for "${String(type)}".`));
                    return 0;
                }

                let children: KankaApiChildEntity[];
                const ids = entities.map(e => e.child_id);

                if (ids.length === 1) {
                    children = [await loader.load(campaignId, ids[0])];
                } else {
                    children = (await loader.loadAll(campaignId)).filter(child => ids.includes(child.id));
                }

                let successCount = 0;
                for (const child of children) {
                    try {
                        const references = await loader.createReferenceCollection(campaignId, child, entityLookup);
                        await this.writeJournal(campaignId, type, child, references);
                        successCount += 1;
                    } catch (error) {
                        logError(error);
                    } finally {
                        progress += 1;
                        onProgress?.(progress, total);
                    }
                }

                return successCount;
            });

        const successCounts = await Promise.all(promises);
        return successCounts.reduce((total, count) => total + count, 0);
    }

    protected async writeJournal(
        campaignId: KankaApiId,
        type: KankaApiEntityType,
        entity: KankaApiChildEntity & { ancestors?: number[] },
        references: ReferenceCollection,
    ): Promise<JournalEntry> {
        const journalData = {
            name: entity.name,
            img: entity.has_custom_image ? entity.image_full : undefined,
            content: entity.entry_parsed,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'flags.core.sheetClass': `${this.module.name}.KankaJournalApplication`,
            [`flags.${this.module.name}.campaign`]: campaignId,
            [`flags.${this.module.name}.type`]: type,
            [`flags.${this.module.name}.id`]: entity.entity_id,
            [`flags.${this.module.name}.version`]: this.buildVersionString(entity),
            [`flags.${this.module.name}.snapshot`]: entity,
            [`flags.${this.module.name}.references`]: references.getRecord(),
        };

        let entry = this.module.journals.findByEntityId(entity.entity_id);

        if (entry) {
            await entry.update({
                [`flags.${this.module.name}.snapshot`]: null,
                [`flags.${this.module.name}.references`]: null,
                permission: { default: this.getExpectedPermission(entity, true) },
            });
            await entry.update(journalData);
        } else {
            const path = entity?.ancestors
                ?.map(id => references.findByEntityId(id))
                .filter((ref): ref is Reference => !!ref) ?? [];
            const folder = await this.ensureFolderPath(type, path);

            entry = await JournalEntry.create({
                ...journalData,
                permission: { default: this.getExpectedPermission(entity, false) },
                folder: folder?.id,
            }) as JournalEntry;
        }

        entry.sheet?.render();

        return entry;
    }

    protected getExpectedPermission(
        entity: KankaApiChildEntity,
        isUpdate: boolean,
    ): foundry.CONST.DOCUMENT_PERMISSION_LEVELS | undefined {
        const setting = getSetting('automaticPermissions');

        if (setting === 'never') return undefined;
        if (setting === 'initial' && isUpdate) return undefined;

        if (entity.is_private) return CONST.DOCUMENT_PERMISSION_LEVELS.NONE;
        return CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER;
    }

    protected async createFolder(
        name: string,
        parent: Folder | undefined,
        flags: Record<string, unknown> = {},
    ): Promise<Folder | undefined> {
        const data: Record<`flags.${string}.${string}`, unknown> = {};

        Object
            .entries(flags)
            .forEach(([flag, value]) => {
                data[`flags.${this.module.name}.${flag}`] = value;
            });

        return Folder.create({
            name,
            parent: parent?.id ?? null,
            type: 'JournalEntry',
            ...data,
        });
    }

    async ensureFolderByFlags(
        name: string,
        parent: Folder | undefined,
        flags: Record<string, unknown>,
    ): Promise<Folder | undefined> {
        const folder = this.findFolderByFlags(flags);

        if (folder) return folder;

        return this.createFolder(name, parent, flags);
    }

    async ensureTypeFolder(type: KankaApiEntityType): Promise<Folder | undefined> {
        return this.ensureFolderByFlags(`[KANKA] ${getMessage('entityType', type)}`, undefined, { type });
    }

    async ensureFolderPath(type: KankaApiEntityType, path: Reference[]): Promise<Folder | undefined> {
        let parent = await this.ensureTypeFolder(type);

        if (!getSetting('keepTreeStructure')) return parent;
        if (!path.length) return parent;

        for (let i = 0; i < Math.min(path.length, this.#maxFolderDepth - 1); i += 1) {
            const { name, entityId } = path[i];
            parent = await this.ensureFolderByFlags(name, parent, { entityId });
        }

        return parent;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected buildVersionString(entity: { updated_at: string }): string {
        const version = String(this.module.currentVersion).padStart(6, '0');
        return `${version}-${entity.updated_at}`;
    }

    protected get journal(): Journal {
        if (!(this.module.game.journal instanceof Journal)) throw new Error('Journal has not been initialized yet.');
        return this.module.game.journal;
    }

    protected get folders(): Folders {
        if (!(this.module.game.folders instanceof Folders)) throw new Error('Folders have not been initialized yet.');
        return this.module.game.folders;
    }
}
