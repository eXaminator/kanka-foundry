import moduleConfig from '../../public/module.json';
import type Reference from '../types/Reference';
import type { KankaApiEntityType } from '../types/kanka';
import getGame from './getGame';
import getMessage from './getMessage';
import { getSetting } from './settings';

const MAX_FOLDER_DEPTH = 3;

function getFolders(): Folders {
    const folders = getGame()?.folders;

    if (!(folders instanceof Folders)) {
        throw new Error('Folders have not been initialized yet.');
    }

    return folders;
}

function getFolderFlag(entry: Folder | undefined, name: string): unknown {
    if (!entry) return undefined;

    return entry.getFlag(moduleConfig.name, name as never);
}

async function createFolder(
    name: string,
    parent: Folder | undefined,
    flags: Record<string, unknown> = {},
): Promise<Folder | undefined> {
    const data: Record<`flags.${string}.${string}`, unknown> = {};

    for (const [flag, value] of Object.entries(flags)) {
        data[`flags.${moduleConfig.name}.${flag}`] = value;
    }

    return Folder.create({
        name,
        parent: parent?.id ?? null, // TODO: Remove after v11 support is removed
        folder: parent?.id ?? null,
        type: 'JournalEntry',
        ...data,
    });
}

export function findFolderByFlags(flags: Record<string, unknown>): Folder | undefined {
    const entries = Object.entries(flags);

    if (entries.length === 0) return undefined;

    return getFolders().find((folder) => {
        if (folder.type !== 'JournalEntry') return false;
        return entries.every(([flag, value]) => getFolderFlag(folder, flag) === value);
    });
}

export async function ensureFolderByFlags(
    name: string,
    parent: Folder | undefined,
    flags: Record<string, unknown>,
): Promise<Folder | undefined> {
    const folder = findFolderByFlags(flags);

    if (folder) return folder;

    return createFolder(name, parent, flags);
}

export async function ensureTypeFolder(type: KankaApiEntityType): Promise<Folder | undefined> {
    return ensureFolderByFlags(`[KANKA] ${getMessage('entityType', type)}`, undefined, {
        type,
    });
}

export async function ensureFolderPath(type: KankaApiEntityType, path: Reference[]): Promise<Folder | undefined> {
    let parent = await ensureTypeFolder(type);

    if (!getSetting('keepTreeStructure')) return parent;

    for (let i = 0; i < Math.min(path.length, MAX_FOLDER_DEPTH - 1); i += 1) {
        const { name, entityId } = path[i];
        parent = await ensureFolderByFlags(name, parent, { entityId });
    }

    return parent;
}
