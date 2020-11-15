import KankaEntity from '../kanka/KankaEntity';
import moduleConfig from '../module.json';

interface JournalData {
    name: string;
    content: string;
    img?: string;
}

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
        folder = await Folder.create({
            name: `[Kanka] ${type}`, // use translation
            type: 'JournalEntry',
            parent: null,
            [`flags.${moduleConfig.name}.type`]: type,
        });
    }

    return folder;
}

export async function writeJournalEntry(
    entity: KankaEntity,
    data: JournalData,
    options: { renderSheet?: boolean, notification?: boolean } = {},
): Promise<JournalEntry> {
    const { renderSheet = false, notification = true } = options;
    let entry = findEntryByEntity(entity);

    if (entry) {
        await entry.update(data);
        if (notification) {
            ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationRefreshed', { type: entity.entityType, name: data.name }));
        }
    } else {
        const folder = await ensureJournalFolder(entity.entityType);
        entry = await JournalEntry.create({
            ...data,
            folder: folder?.id,
            [`flags.${moduleConfig.name}.id`]: entity.id,
            [`flags.${moduleConfig.name}.entityId`]: entity.entityId,
            [`flags.${moduleConfig.name}.type`]: entity.entityType,
        }, { renderSheet }) as JournalEntry;
        if (notification) {
            ui.notifications.info(game.i18n.format('KANKA.BrowserNotificationSynced', { type: entity.entityType, name: data.name }));
        }
    }

    return entry;
}
