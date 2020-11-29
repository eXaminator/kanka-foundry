import EntityAttribute from '../kanka/entities/EntityAttribute';
import EntityMetaData from '../kanka/entities/EntityMetaData';
import InventoryItem from '../kanka/entities/InventoryItem';
import PrimaryEntity from '../kanka/entities/PrimaryEntity';
import QuestReference from '../kanka/entities/QuestReference';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { CharacterTrait, Visibility } from '../types/kanka';
import {
    KankaSettings,
    MetaDataAttributeVisibility,
    MetaDataBasicVisibility,
    MetaDataCharacterTraitVisibility,
    MetaDataInventoryVisibility,
    MetaDataQuestReferenceVisibility,
    MetaDataType,
} from '../types/KankaSettings';
import getSettings from './getSettings';

interface MetaData {
    label: string;
    value: string;
    linkTo?: PrimaryEntity;
}

interface MetaDataSection {
    label: string;
    data: MetaData[];
}

export function findEntriesByType(type: string): JournalEntry[] {
    return game.journal.filter(e => e.getFlag(moduleConfig.name, 'type') === type);
}

export function findEntryByEntityId(id: number): JournalEntry | undefined {
    return game.journal.find(e => e.getFlag(moduleConfig.name, 'entityId') === id);
}

export function findEntryByEntity(entity: PrimaryEntity): JournalEntry | undefined {
    return findEntryByEntityId(entity.entityId);
}

export function findEntryByTypeAndId(type: string, id: number): JournalEntry | undefined {
    return game.journal
        .find(e => e.getFlag(moduleConfig.name, 'type') === type && e.getFlag(moduleConfig.name, 'id') === id);
}

export function findFolderByType(type: string): Folder | undefined {
    return game.folders
        .find((f: Folder) => f.data.type === 'JournalEntry' && f.getFlag(moduleConfig.name, 'type') === type);
}

export function findFolderByFlags(flags: Record<string, unknown>): Folder | undefined {
    const entries = Object.entries(flags);

    return game.folders
        .find((f: Folder) => f.data.type === 'JournalEntry'
            && entries.every(([flag, value]) => f.getFlag(moduleConfig.name, flag) === value));
}

export function hasOutdatedEntry(entity: PrimaryEntity): boolean {
    const entry = findEntryByEntity(entity);
    if (!entry) return false;

    const updatedAt = entry.getFlag(moduleConfig.name, 'updatedAt');
    if (!updatedAt) return true;

    return updatedAt < entity.updatedAt;
}

function createJournalFolder(name: string, parent?: Folder, flags: Record<string, unknown> = {}): Promise<Folder> {
    const data = {
        name,
        parent: parent ?? null,
        type: 'JournalEntry',
    };

    Object
        .entries(flags)
        .forEach(([flag, value]) => {
            data[`flags.${moduleConfig.name}.${flag}`] = value;
        });

    logInfo('createJournalFolder()', data);

    return Folder.create(data);
}

async function ensureTypeJournalFolder(type: string): Promise<Folder> {
    const folder = findFolderByFlags({ folderType: 'type', type });
    logInfo('ensureTypeJournalFolder()', folder?.name);
    if (folder) return folder;

    const nameKey = `KANKA.EntityType.${type}`;
    const name = game.i18n.localize(nameKey);
    const folderName = name === nameKey ? type : name;

    return createJournalFolder(`[KANKA] ${folderName}`, undefined, { folderType: 'type', type });
}

async function ensureEntityJournalFolder(entity: PrimaryEntity, parent?: Folder): Promise<Folder> {
    const folder = findFolderByFlags({ folderType: 'entity', id: entity.id, type: entity.entityType });
    logInfo('ensureEntityJournalFolder() – create', entity.name, folder?.name, parent?.name);
    if (folder) return folder;

    return createJournalFolder(
        entity.name,
        parent,
        { folderType: 'entity', id: entity.id, type: entity.entityType, entityId: entity.entityId },
    );
}

async function ensureEntityJournalFolderPath(entity: PrimaryEntity): Promise<Folder> {
    if (!getSettings(KankaSettings.keepTreeStructure)) {
        return ensureTypeJournalFolder(entity.entityType);
    }

    const parent = await entity.treeParent();

    if (!parent) {
        return ensureTypeJournalFolder(entity.entityType);
    }

    const parentFolder = findFolderByFlags({ entityFolder: true, id: parent.id, type: parent.entityType });
    if (parentFolder) return parentFolder;
    const grandParentFolder = await ensureEntityJournalFolderPath(parent);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (grandParentFolder.depth === 3) return grandParentFolder;
    return ensureEntityJournalFolder(parent, grandParentFolder);
}

async function renderTemplate(path: string, params: Record<string, unknown>): Promise<string> {
    if (module.hot) {
        delete _templateCache[path];
    }

    return window.renderTemplate(path, params) as unknown as string;
}

function translateMetaDataLabel(key: string): string {
    if (!key) return key;

    const labelKey = `KANKA.MetaData.${key}`;
    const label = game.i18n.localize(labelKey);

    return label === labelKey ? key : label;
}

function translateMetaDataValue(value: unknown): string {
    if (value === true) {
        return game.i18n.localize('KANKA.MetaData.boolean.true');
    }

    if (value === false) {
        return game.i18n.localize('KANKA.MetaData.boolean.false');
    }

    return String(value).replace('\n', '<br/>');
}

function checkSetting<T>(
    data: EntityMetaData<T>,
    setting: KankaSettings,
    results: Record<string, boolean | ((data: T) => boolean)>,
): boolean {
    const settingValue = getSettings(setting) as string;
    const result = results[settingValue];

    if (result === undefined) {
        return true;
    }

    if (result === true || result === false) {
        return result;
    }

    if (data.originalData === undefined) {
        return true;
    }

    return result(data.originalData);
}

function byMetaDataConfiguration(data: EntityMetaData): boolean {
    if (data.type === MetaDataType.basic) {
        return checkSetting(
            data,
            KankaSettings.metaDataBasicVisibility,
            {
                [MetaDataBasicVisibility.all]: true,
                [MetaDataBasicVisibility.none]: false,
            },
        );
    }

    if (data.type === MetaDataType.attribute) {
        return checkSetting(
            data as EntityMetaData<EntityAttribute>,
            KankaSettings.metaDataAttributeVisibility,
            {
                [MetaDataAttributeVisibility.all]: true,
                [MetaDataAttributeVisibility.none]: false,
                [MetaDataAttributeVisibility.public]: original => original.isPublic(),
                [MetaDataAttributeVisibility.allStarred]: original => original.isStarred(),
                [MetaDataAttributeVisibility.publicStarred]: original => original.isPublic() && original.isStarred(),
            },
        );
    }

    if (data.type === MetaDataType.characterTrait) {
        return checkSetting(
            data as EntityMetaData<CharacterTrait>,
            KankaSettings.metaDataCharacterTraitVisibility,
            {
                [MetaDataCharacterTraitVisibility.all]: true,
                [MetaDataCharacterTraitVisibility.personality]: original => original.section === 'personality',
                [MetaDataCharacterTraitVisibility.appearance]: original => original.section === 'appearance',
                [MetaDataCharacterTraitVisibility.none]: false,
            },
        );
    }

    if (data.type === MetaDataType.questReference) {
        return checkSetting(
            data as EntityMetaData<QuestReference>,
            KankaSettings.metaDataQuestReferenceVisibility,
            {
                [MetaDataQuestReferenceVisibility.all]: true,
                [MetaDataQuestReferenceVisibility.public]: original => !original.isPrivate,
                [MetaDataQuestReferenceVisibility.none]: false,
            },
        );
    }

    if (data.type === MetaDataType.inventory) {
        return checkSetting(
            data as EntityMetaData<InventoryItem>,
            KankaSettings.metaDataInventoryVisibility,
            {
                [MetaDataInventoryVisibility.all]: true,
                [MetaDataInventoryVisibility.public]: ({ visibility }) => visibility === Visibility.all,
                [MetaDataInventoryVisibility.none]: false,
            },
        );
    }

    return true;
}

async function buildMetaDataForSection(entity: PrimaryEntity, section?: string): Promise<MetaData[]> {
    const metaData = await entity.getMetaDataBySection(section);

    return metaData
        .filter(byMetaDataConfiguration)
        .map(data => ({
            label: translateMetaDataLabel(data.label),
            value: translateMetaDataValue(data.value),
            linkTo: data.linkTo,
        }));
}

async function buildMetaData(entity: PrimaryEntity): Promise<MetaDataSection[]> {
    const sections = await entity.metaDataSections();

    const metaData = await Promise.all(sections.map(section => buildMetaDataForSection(entity, section)));

    return sections
        .map((section, index) => ({
            label: translateMetaDataLabel(section),
            data: metaData[index],
        }))
        .filter(section => section.data.length > 0)
        .sort(a => (!a.label ? -1 : 0));
}

export async function writeJournalEntry(
    entity: PrimaryEntity,
    options: { renderSheet?: boolean, notification?: boolean } = {},
): Promise<JournalEntry> {
    const { renderSheet = false, notification = true } = options;
    let entry = findEntryByEntity(entity);

    const content = await renderTemplate(
        `modules/${moduleConfig.name}/templates/journalEntry.html`,
        {
            entity,
            metaData: await buildMetaData(entity),
            includeImage: entity.image && getSettings(KankaSettings.imageInText),
        },
    );

    const journalData = {
        name: entity.name,
        img: entity.image,
        content,
    };

    if (entry) {
        await entry.update({
            ...journalData,
            [`flags.${moduleConfig.name}.updatedAt`]: entity.updatedAt,
        });

        if (notification) {
            ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationRefreshed', { type: entity.entityType, name: entity.name }));
        }
    } else {
        const folder = await ensureEntityJournalFolderPath(entity);
        entry = await JournalEntry.create({
            ...journalData,
            folder: folder?.id,
            [`flags.${moduleConfig.name}.id`]: entity.id,
            [`flags.${moduleConfig.name}.entityId`]: entity.entityId,
            [`flags.${moduleConfig.name}.type`]: entity.entityType,
            [`flags.${moduleConfig.name}.updatedAt`]: entity.updatedAt,
        }) as JournalEntry;

        if (notification) {
            ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationSynced', { type: entity.entityType, name: entity.name }));
        }
    }

    entry.sheet.render(renderSheet);
    return entry;
}
