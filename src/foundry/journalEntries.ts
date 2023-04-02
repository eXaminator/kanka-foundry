import moduleConfig from '../../public/module.json';
import type ReferenceCollection from '../api/ReferenceCollection';
import Reference from '../types/Reference';
import { KankaApiChildEntity, KankaApiId as KankaApiChildId, KankaApiEntity, KankaApiEntityId, KankaApiEntityType } from '../types/kanka';
import getGame from './getGame';
import { ensureFolderPath } from './journalFolders';
import { getSetting } from './settings';

const CURRENT_JOURNAL_VERSION = '000001';

type FlagTypes = {
    id: KankaApiEntityId,
    campaign: KankaApiChildId,
    snapshot: KankaApiChildEntity,
    type: KankaApiEntityType,
    version: string,
    references: Record<number, Reference>,
    [key: string]: unknown,
};

function getJournal(): Journal {
    const { journal } = getGame();

    if (!journal) {
        throw new Error('Journal has not been initialized yet.');
    }

    return journal;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function buildVersionString(entity: { updated_at: string }): string {
    return `${CURRENT_JOURNAL_VERSION}-${entity.updated_at}`;
}

function getExpectedPermission(
    entity: KankaApiChildEntity,
    isUpdate: boolean,
): foundry.CONST.DOCUMENT_PERMISSION_LEVELS | undefined {
    const setting = getSetting('automaticPermissions');

    if (setting === 'never') return undefined;
    if (setting === 'initial' && isUpdate) return undefined;

    if (entity.is_private) return CONST.DOCUMENT_PERMISSION_LEVELS.NONE;
    return CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER;
}

export function getEntryFlag<FlagName extends keyof FlagTypes>(
    entry: JournalEntry,
    name: FlagName,
): FlagTypes[FlagName] | undefined {
    return entry.getFlag(moduleConfig.name, name as never) as FlagTypes[typeof name];
}

export function findAllKankaEntries(): JournalEntry[] {
    return getJournal().filter((e) => !!getEntryFlag(e, 'id')) ?? undefined;
}

export function findEntryByEntityId(id: KankaApiEntityId): JournalEntry | undefined {
    return getJournal().find((e) => getEntryFlag(e, 'id') === id) ?? undefined;
}

export function findEntryByTypeAndChildId(
    type: KankaApiEntityType,
    id: KankaApiChildId,
): JournalEntry | undefined {
    return getJournal().find(
        (e) => getEntryFlag(e, 'type') === type && getEntryFlag(e, 'snapshot')?.id === id,
    ) ?? undefined;
}

export function findEntriesByType(type: KankaApiEntityType): JournalEntry[] {
    return getJournal().filter((e) => getEntryFlag(e, 'type') === type);
}

export function hasOutdatedEntryByEntity(entity: KankaApiEntity): boolean {
    const entry = findEntryByEntityId(entity.id);

    if (!entry) return false; // No entry means it cannot be outdated

    const currentVersion = getEntryFlag(entry, 'version');
    if (!currentVersion) return true; // Should be updated!

    return buildVersionString(entity) > currentVersion;
}

export async function createOrUpdateJournalEntry(
    campaignId: KankaApiChildId,
    type: KankaApiEntityType,
    entity: KankaApiChildEntity & { ancestors?: number[] },
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const journalData = {
        name: entity.name,
        img: entity.has_custom_image ? entity.image_full : undefined,
        content: entity.entry_parsed,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'flags.core.sheetClass': `${moduleConfig.name}.KankaJournalApplication`,
        [`flags.${moduleConfig.name}.campaign`]: campaignId,
        [`flags.${moduleConfig.name}.type`]: type,
        [`flags.${moduleConfig.name}.id`]: entity.entity_id,
        [`flags.${moduleConfig.name}.version`]: buildVersionString(entity),
        [`flags.${moduleConfig.name}.snapshot`]: entity,
        [`flags.${moduleConfig.name}.references`]: references.getRecord(),
    };

    let entry = findEntryByEntityId(entity.entity_id);

    if (entry) {
        await entry.update({
            [`flags.${moduleConfig.name}.snapshot`]: null,
            [`flags.${moduleConfig.name}.references`]: null,
            permission: { default: getExpectedPermission(entity, true) },
        });
        await entry.update(journalData);
    } else {
        const path = entity?.ancestors
            ?.map(id => references.findByEntityId(id))
            .filter((ref): ref is Reference => !!ref) ?? [];
        const folder = await ensureFolderPath(type, path);

        entry = await JournalEntry.create({
            ...journalData,
            permission: { default: getExpectedPermission(entity, false) },
            folder: folder?.id,
        }) as JournalEntry;
    }

    return entry;
}
