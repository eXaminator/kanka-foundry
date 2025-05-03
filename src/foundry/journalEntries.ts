import moduleConfig from '../../public/module.json';
import type ReferenceCollection from '../api/ReferenceCollection';
import type Reference from '../types/Reference';
import type {
    AnyConstrainable,
    KankaApiChildEntity,
    KankaApiChildEntityWithChildren,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiModuleType,
    KankaApiId,
} from '../types/kanka';
import isSecret from '../util/isSecret';
import { ensureFolderPath } from './journalFolders';
import PageFactory from './PageFactory';

const CURRENT_JOURNAL_VERSION = '000002';

function buildVersionString(entity: { updated_at: string }): string {
    return `${CURRENT_JOURNAL_VERSION}-${entity.updated_at}`;
}

function getOwnership(
    entities: AnyConstrainable[],
    currentOwnership?: Record<string, CONST.DOCUMENT_OWNERSHIP_LEVELS>,
): Record<string, CONST.DOCUMENT_OWNERSHIP_LEVELS> | undefined {
    const setting = game.settings?.get('kanka-foundry', 'automaticPermissions');

    if (setting === 'never' && currentOwnership)
        return currentOwnership ?? { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE };
    if (setting === 'initial' && currentOwnership) return currentOwnership;

    if (entities.every((entity) => isSecret(entity))) {
        return {
            ...(currentOwnership ?? {}),
            default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
        };
    }

    return { ...(currentOwnership ?? {}), default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
}

export function findAllKankaEntries(): JournalEntry[] {
    return game.journal?.filter((e) => !!e.getFlag('kanka-foundry', 'id')) ?? [];
}

export function findEntryByEntityId(id: KankaApiEntityId): JournalEntry | undefined {
    return game.journal?.find((e) => e.getFlag('kanka-foundry', 'id') === id) ?? undefined;
}

export function findEntryByTypeAndChildId(type: KankaApiModuleType, id: KankaApiId): JournalEntry | undefined {
    return (
        game.journal?.find((e) => e.getFlag('kanka-foundry', 'type') === type && e.getFlag('kanka-foundry', 'snapshot')?.id === id) ??
        undefined
    );
}

export function findEntriesByType(type: KankaApiModuleType): JournalEntry[] {
    return game.journal?.filter((e) => e.getFlag('kanka-foundry', 'type') === type) ?? [];
}

export function hasOutdatedEntryByEntity(entity: KankaApiEntity): boolean {
    const entry = findEntryByEntityId(entity.id);

    if (!entry) return false; // No entry means it cannot be outdated

    const currentVersion = entry.getFlag('kanka-foundry', 'version');
    if (!currentVersion) return true; // Should be updated!


    return buildVersionString(entity) > currentVersion;
}

function createAllPages(
    campaignId: KankaApiId,
    type: KankaApiModuleType,
    entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
    references: ReferenceCollection,
    journal?: JournalEntry,
): JournalEntry.CreateData['pages'] {
    const pageFactory = new PageFactory(
        campaignId,
        type,
        entity,
        references,
        journal,
    );

    return [
        pageFactory.createEntityImagePage(),
        pageFactory.createOverviewPage(),
        pageFactory.createCharacterProfilePage(),
        ...pageFactory.createPostPages(),
        pageFactory.createRelationsPage(),
        pageFactory.createCharacterOrganisationsPage(),
        pageFactory.createFamilyMembersPage(),
        pageFactory.createOrganisationMembersPage(),
        pageFactory.createQuestElementsPage(),
        pageFactory.createAssetsPage(),
        ...pageFactory.createAssetFilePages(),
        pageFactory.createAttributesPage(),
        pageFactory.createAbilitiesPage(),
        pageFactory.createInventoryPage(),
        pageFactory.createEventsPage(),
        pageFactory.createChildrenPage(),
    ].filter((page) => !!page);
}

export async function createJournalEntry(
    campaignId: KankaApiId,
    type: KankaApiModuleType,
    entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const path =
        [...((entity as KankaApiChildEntityWithChildren)?.parents ?? [])]
            .reverse()
            .map((id) => references.findByIdAndType(id, type))
            .filter((ref): ref is Reference => !!ref) ?? [];

    const folder = await ensureFolderPath(type, path);


    return (await JournalEntry.create({
        name: entity.name,
        pages: createAllPages(campaignId, type, entity, references),
        flags: {
            core: {
                sheetClass: `${moduleConfig.name}.KankaJournalApplication`,
            },
            'kanka-foundry': {
                campaign: campaignId,
                type,
                id: entity.entity_id,
                version: buildVersionString(entity),
                snapshot: entity,
                references: references.getRecord(),
            },
        },
        ownership: getOwnership([entity], undefined),
        folder: folder?.id,
    })) as JournalEntry;
}

export async function updateJournalEntry(
    entry: JournalEntry,
    entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const campaignId = entry.getFlag('kanka-foundry', 'campaign');
    const type = entry.getFlag('kanka-foundry', 'type');
    const oldName = entry.getFlag('kanka-foundry', 'snapshot')?.name;

    if (!campaignId || !type) throw new Error('Missing flags on journal entry');

    await entry.deleteEmbeddedDocuments('JournalEntryPage', [], { deleteAll: true });
    await entry.update({
        name: entry.name === oldName ? entity.name : oldName, // Keep existing journal name if it was renamed by user
        pages: createAllPages(campaignId, type, entity, references, entry),
        flags: {
            core: {
                sheetClass: `${moduleConfig.name}.KankaJournalApplication`,
            },
            'kanka-foundry': {
                version: buildVersionString(entity),
                snapshot: entity,
                references: references.getRecord(),
            },
        },
        ownership: getOwnership([entity], entry.ownership),
    });

    return entry;
}
