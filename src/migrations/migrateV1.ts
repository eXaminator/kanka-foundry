import type KankaFoundry from '../KankaFoundry';
import api from '../module/api';
import getMessage from '../module/getMessage';
import { showInfo, showWarning } from '../module/notifications';
import { KankaApiEntity } from '../types/kanka';
import createJournalLink from '../util/createJournalLink';

async function migrateAll(module: KankaFoundry): Promise<void> {
    const campaignId = module.currentCampaign?.id;

    if (!campaignId) {
        return;
    }

    const entities = await api.getAllEntities(
        campaignId,
        [
            'ability',
            'character',
            'location',
            'race',
            'organisation',
            'family',
            'item',
            'journal',
            'note',
            'quest',
        ],
    );

    await Promise.all(module.game.folders
        ?.filter(folder => !!folder.getFlag(module.name, 'folderType'))
        .map(async (folder) => {
            const folderType = folder.getFlag(module.name, 'folderType');
            if (folderType !== 'type') {
                await folder.unsetFlag(module.name, 'type');
            }
            await folder.unsetFlag(module.name, 'folderType');
            await folder.unsetFlag(module.name, 'id');
        }) ?? []);

    const updateEntities = module.game.journal
        ?.filter(e => !!e.getFlag(module.name, 'id') && !e.getFlag(module.name, 'snapshot'))
        .map(entry => entities.find(e => e.id === entry.getFlag(module.name, 'entityId')))
        .filter((entity): entity is KankaApiEntity => !!entity) ?? [];

    if (!updateEntities.length) {
        showWarning('migration.nothingToDo');
        return;
    }

    await Promise.all(module.game.journal
        ?.filter(e => !!e.getFlag(module.name, 'id') && !e.getFlag(module.name, 'snapshot'))
        .map(async (entry) => {
            const entity = entities.find(e => e.id === entry.getFlag(module.name, 'entityId'));
            if (!entity) return;
            await entry.setFlag(module.name, 'id', entity.id);
            await entry.unsetFlag(module.name, 'entityId');
            await entry.unsetFlag(module.name, 'updatedAt');
            await entry.unsetFlag(module.name, 'campaignId');
        }) ?? []);

    const successCount = await module.journals.write(campaignId, updateEntities, entities);

    showInfo('migration.success', { success: successCount, expected: updateEntities.length });
}

function createEntryList(label: string, entries: JournalEntry[]): string {
    if (entries.length === 0) return '';

    const listItems = entries
        .map(entry => createJournalLink(entry))
        .join(', ');

    return `<details><summary><strong>${label}</strong></summary><p>${listItems}</p></details>`;
}

function createFolderList(label: string, folders: Folder[]): string {
    if (folders.length === 0) return '';

    const listItems = folders
        .map((folder) => {
            const path = [folder];
            while (path[0].parentFolder) {
                path.unshift(path[0].parentFolder);
            }

            return path
                .map((folder, idx) => (idx === path.length - 1 ? `<strong>${folder.name}</strong>` : folder.name))
                .join(' › ');
        })
        .map(path => `<li>${path}</li>`)
        .join('');

    return `<details><summary><strong>${label}</strong></summary><ul>${listItems}</ul></details>`;
}

export default function migrateV1(module: KankaFoundry): void {
    const outdatedJournals = module.game.journal
        ?.filter(e => !!e.getFlag(module.name, 'id') && !e.getFlag(module.name, 'snapshot')) ?? [];
    const outdatedFolders = module.game.folders
        ?.filter(folder => !!folder.getFlag(module.name, 'folderType')) ?? [];

    if (outdatedFolders.length === 0 && outdatedJournals.length === 0) {
        return;
    }

    const dialog = new Dialog({
        title: getMessage('migration.dialog.header'),
        content: getMessage('migration.dialog.text', {
            documentCount: outdatedJournals.length,
            folderCount: outdatedFolders.length,
            campaignName: module.currentCampaign?.name,
            journalList: createEntryList(
                getMessage('migration.dialog.listHeader.journals', { count: outdatedJournals.length }),
                outdatedJournals,
            ),
            folderList: createFolderList(
                getMessage('migration.dialog.listHeader.folders', { count: outdatedFolders.length }),
                outdatedFolders,
            ),
        }),
        buttons: {
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: getMessage('migration.dialog.action.yes'),
                async callback() {
                    await migrateAll(module);
                    await dialog.close();
                },
            },
            no: {
                icon: '<i class="fas fa-times"></i>',
                label: getMessage('migration.dialog.action.no'),
                async callback() {
                    await dialog.close();
                },
            },
        },
        default: 'no',
    }, { width: 720 });
    dialog.render(true);
}
