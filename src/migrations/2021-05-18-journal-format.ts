import moduleConfig from '../../public/module.json';
import api from '../module/api';
import { getCurrentCampaign } from '../module/currentCampaign';
import getGame from '../module/getGame';
import getMessage from '../module/getMessage';
import { showInfo, showWarning } from '../module/notifications';
import syncEntities from '../module/syncEntities';
import { KankaApiEntity } from '../types/kanka';
import createJournalLink from '../util/createJournalLink';

async function migrateAll(): Promise<void> {
    const campaignId = getCurrentCampaign()?.id;

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

    await Promise.all(getGame().folders
        ?.filter(folder => !!folder.getFlag(moduleConfig.name, 'folderType'))
        .map(async (folder) => {
            const folderType = folder.getFlag(moduleConfig.name, 'folderType');
            if (folderType !== 'type') {
                await folder.unsetFlag(moduleConfig.name, 'type');
            }
            await folder.unsetFlag(moduleConfig.name, 'folderType');
            await folder.unsetFlag(moduleConfig.name, 'id');
        }) ?? []);

    const updateEntities = getGame().journal
        ?.filter(e => !!e.getFlag(moduleConfig.name, 'id') && !e.getFlag(moduleConfig.name, 'snapshot'))
        .map(entry => entities.find(e => e.id === entry.getFlag(moduleConfig.name, 'entityId')))
        .filter((entity): entity is KankaApiEntity => !!entity) ?? [];

    if (!updateEntities.length) {
        showWarning('migration.nothingToDo');
        return;
    }

    await Promise.all(getGame().journal
        ?.filter(e => !!e.getFlag(moduleConfig.name, 'id') && !e.getFlag(moduleConfig.name, 'snapshot'))
        .map(async (entry) => {
            const entity = entities.find(e => e.id === entry.getFlag(moduleConfig.name, 'entityId'));
            if (!entity) return;
            await entry.setFlag(moduleConfig.name, 'id', entity.id);
            await entry.unsetFlag(moduleConfig.name, 'entityId');
            await entry.unsetFlag(moduleConfig.name, 'updatedAt');
            await entry.unsetFlag(moduleConfig.name, 'campaignId');
        }) ?? []);

    const stats = await syncEntities(campaignId, updateEntities, entities);

    showInfo('migration.success', { success: stats.all.success, expected: stats.all.total });
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

export default async function migrate(): Promise<void> {
    const outdatedJournals = getGame().journal
        ?.filter(e => !!e.getFlag(moduleConfig.name, 'id') && !e.getFlag(moduleConfig.name, 'snapshot')) ?? [];
    const outdatedFolders = getGame().folders
        ?.filter(folder => !!folder.getFlag(moduleConfig.name, 'folderType')) ?? [];

    if (outdatedFolders.length === 0 && outdatedJournals.length === 0) {
        return;
    }

    const dialog = new Dialog({
        title: getMessage('migration.dialog.header'),
        content: getMessage('migration.dialog.text', {
            documentCount: outdatedJournals.length,
            folderCount: outdatedFolders.length,
            campaignName: getCurrentCampaign()?.name,
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
                    await migrateAll();
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
