import EntityAttribute from '../kanka/EntityAttribute';
import KankaEntity from '../kanka/KankaEntity';
import moduleConfig from '../module.json';
import { IncludeAttributeSelection, KankaSettings } from '../types/KankaSettings';
import getSetting from './getSettings';

export function findEntriesByType(type: string): JournalEntry[] {
    return game.journal.filter(e => e.getFlag(moduleConfig.name, 'type') === type);
}

export function findEntryByEntityId(id: number): JournalEntry | undefined {
    return game.journal.find(e => e.getFlag(moduleConfig.name, 'entityId') === id);
}

export function findEntryByEntity(entity: KankaEntity): JournalEntry | undefined {
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

export async function ensureJournalFolder(type: string): Promise<Folder | undefined> {
    let folder = findFolderByType(type);

    if (!folder) {
        const nameKey = `KANKA.EntityType.${type}`;
        const name = game.i18n.localize(nameKey);

        folder = await Folder.create({
            name: `[KANKA] ${name === nameKey ? type : name}`,
            type: 'JournalEntry',
            parent: null,
            [`flags.${moduleConfig.name}.type`]: type,
        });
    }

    return folder;
}

async function renderTemplate(path: string, params: Record<string, unknown>): Promise<string> {
    if (module.hot) {
        delete _templateCache[path];
    }

    return window.renderTemplate(path, params) as unknown as string;
}

function getMetaDataLabel(key: string): string {
    const labelKey = `KANKA.MetaData.${key}`;
    const label = game.i18n.localize(labelKey);

    return label === labelKey ? key : label;
}

function getAttributeValue(attribute: EntityAttribute): string {
    if (attribute.isText()) {
        return attribute.value.replace('\n', '<br/>');
    }

    if (attribute.isCheckbox()) {
        return attribute.value
            ? game.i18n.localize('KANKA.MetaData.boolean.true')
            : game.i18n.localize('KANKA.MetaData.boolean.false');
    }
    return String(attribute.value);
}

function buildMetaData(entity: KankaEntity): { label: string, value: string }[] {
    const metaData = Object
        .entries(entity.metaData)
        .filter(([, value]) => !!value)
        .map(([key, value]) => ({
            label: getMetaDataLabel(key),
            value,
        }));

    const includeAttributes = getSetting(KankaSettings.metaDataAttributes) as IncludeAttributeSelection;

    if (includeAttributes === IncludeAttributeSelection.none) {
        return metaData;
    }

    const attributes = entity.attributes
        .filter(attr => !attr.isSection())
        .filter(attr => includeAttributes !== IncludeAttributeSelection.public || attr.isPublic())
        .map(attr => ({
            label: attr.name,
            value: getAttributeValue(attr),
        }));

    return [...metaData, ...attributes];
}

export async function writeJournalEntry(
    entity: KankaEntity,
    options: { renderSheet?: boolean, notification?: boolean } = {},
): Promise<JournalEntry> {
    const { renderSheet = false, notification = true } = options;
    let entry = findEntryByEntity(entity);

    const content = await renderTemplate(
        `modules/${moduleConfig.name}/templates/journalEntry.html`,
        {
            entity,
            metaData: buildMetaData(entity),
            includeImage: entity.image && getSetting(KankaSettings.imageInText),
        },
    );

    const journalData = {
        name: entity.name,
        img: entity.image,
        content,
    };

    if (entry) {
        await entry.update(journalData);

        if (notification) {
            ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationRefreshed', { type: entity.entityType, name: entity.name }));
        }
    } else {
        const folder = await ensureJournalFolder(entity.entityType);
        entry = await JournalEntry.create({
            ...journalData,
            folder: folder?.id,
            [`flags.${moduleConfig.name}.id`]: entity.id,
            [`flags.${moduleConfig.name}.entityId`]: entity.entityId,
            [`flags.${moduleConfig.name}.type`]: entity.entityType,
        }) as JournalEntry;

        if (notification) {
            ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationSynced', { type: entity.entityType, name: entity.name }));
        }
    }

    entry.sheet.render(renderSheet);
    return entry;
}
