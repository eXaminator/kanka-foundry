import PrimaryEntity from '../kanka/entities/PrimaryEntity';
import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { KankaApiEntityId } from '../types/kanka';
import { EntityNotesVisibility, KankaSettings } from '../types/KankaSettings';
import { getSetting } from './accessSettings';
import buildMetaData from './buildMetaData';

export function findEntriesByType(type: string): JournalEntry[] {
    return game.journal.filter(e => e.getFlag(moduleConfig.name, 'type') === type);
}

export function findEntryByEntityId(id: KankaApiEntityId): JournalEntry | undefined {
    return game.journal.find(e => e.getFlag(moduleConfig.name, 'entityId') === id);
}

export function findEntryByEntity(entity: PrimaryEntity): JournalEntry | undefined {
    return findEntryByEntityId(entity.entityId);
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
    if (!getSetting(KankaSettings.keepTreeStructure)) {
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

export async function writeJournalEntry(entity: PrimaryEntity, localization: Localization): Promise<JournalEntry> {
    const noteVisibility = getSetting(KankaSettings.entityNotesVisibility) as EntityNotesVisibility;
    const publicNotes = entity.entityNotes.filter(note => !note.isSecret);
    const secretNotes = entity.entityNotes.filter(note => note.isSecret);

    const content = await renderTemplate(
        `modules/${moduleConfig.name}/templates/journalEntry.html`,
        {
            entity,
            metaData: await buildMetaData(entity, localization),
            includeImage: entity.image && getSetting(KankaSettings.imageInText),
            publicNotes: noteVisibility !== EntityNotesVisibility.none ? publicNotes : [],
            secretNotes: noteVisibility === EntityNotesVisibility.all ? secretNotes : [],
        },
    );

    const journalData = {
        name: entity.name,
        img: entity.image,
        content,
        [`flags.${moduleConfig.name}.id`]: entity.id,
        [`flags.${moduleConfig.name}.entityId`]: entity.entityId,
        [`flags.${moduleConfig.name}.type`]: entity.entityType,
        [`flags.${moduleConfig.name}.updatedAt`]: entity.updatedAt,
        [`flags.${moduleConfig.name}.campaignId`]: entity.campaign.id,
    };

    let entry = findEntryByEntity(entity);

    if (entry) {
        await entry.update(journalData);
    } else {
        const folder = await ensureEntityJournalFolderPath(entity);
        entry = await JournalEntry.create({
            ...journalData,
            folder: folder?.id,
        }) as JournalEntry;
    }

    entry.sheet.render();
    return entry;
}
