import moduleConfig from '../../public/module.json';
import type ReferenceCollection from '../api/ReferenceCollection';
import type Reference from '../types/Reference';
import type {
    AnyConstrainable,
    KankaApiChildEntity,
    KankaApiChildEntityWithChildren,
    KankaApiEntity,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiId,
} from '../types/kanka';
import isSecret from '../util/isSecret';
import getGame from './getGame';
import { ensureFolderPath } from './journalFolders';
import PageFactory from './PageFactory';
import { getSetting } from './settings';

const CURRENT_JOURNAL_VERSION = '000002';

type FlagTypes = {
    id: KankaApiEntityId;
    campaign: KankaApiId;
    snapshot: KankaApiChildEntity;
    type: KankaApiEntityType;
    version: string;
    references: Record<number, Reference>;
    [key: string]: unknown;
};

type OwnershipKeys = keyof typeof foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS;
type Ownership = (typeof foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS)[OwnershipKeys];

type NullableFlagTypes = {
    [Key in keyof FlagTypes]: FlagTypes[Key] | null;
};

type FlagDataObject = {
    [Key in keyof NullableFlagTypes as Key extends string
    ? `flags.${typeof moduleConfig.name}.${Key}`
    : never]: NullableFlagTypes[Key];
};

function getJournal(): Journal {
    const { journal } = getGame();

    if (!journal) {
        throw new Error('Journal has not been initialized yet.');
    }

    return journal;
}

function buildVersionString(entity: { updated_at: string }): string {
    return `${CURRENT_JOURNAL_VERSION}-${entity.updated_at}`;
}

function getOwnership(
    entities: AnyConstrainable[],
    currentOwnership?: Record<string, Ownership>,
): Record<string, Ownership> | undefined {
    const setting = getSetting('automaticPermissions');

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

function buildKankaFlags(flags: Partial<NullableFlagTypes>): Partial<FlagDataObject> {
    const flagData: Partial<FlagDataObject> = {};

    for (const [key, value] of Object.entries(flags)) {
        flagData[`flags.${moduleConfig.name}.${key}`] = value;
    }

    return flagData;
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

export function findEntryByTypeAndChildId(type: KankaApiEntityType, id: KankaApiId): JournalEntry | undefined {
    return (
        getJournal().find((e) => getEntryFlag(e, 'type') === type && getEntryFlag(e, 'snapshot')?.id === id) ??
        undefined
    );
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

function createAllPages(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
    references: ReferenceCollection,
    journal?: JournalEntry,
) {
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
    type: KankaApiEntityType,
    entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const journalData = {
        name: entity.name,
        pages: createAllPages(campaignId, type, entity, references),
        'flags.core.sheetClass': `${moduleConfig.name}.KankaJournalApplication`,
        ...buildKankaFlags({
            campaign: campaignId,
            type,
            id: entity.entity_id,
            version: buildVersionString(entity),
            snapshot: entity,
            references: references.getRecord(),
        }),
    };

    const path =
        [...((entity as KankaApiChildEntityWithChildren)?.parents ?? [])]
            .reverse()
            .map((id) => references.findByIdAndType(id, type))
            .filter((ref): ref is Reference => !!ref) ?? [];

    const folder = await ensureFolderPath(type, path);


    return (await JournalEntry.create({
        ...journalData,
        ownership: getOwnership([entity], undefined),
        folder: folder?.id,
    })) as JournalEntry;
}

export async function updateJournalEntry(
    entry: JournalEntry,
    entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const campaignId = getEntryFlag(entry, 'campaign');
    const type = getEntryFlag(entry, 'type');
    const oldName = getEntryFlag(entry, 'snapshot')?.name;

    if (!campaignId || !type) throw new Error('Missing flags on journal entry');

    const journalData = {
        name: entry.name === oldName ? entity.name : oldName, // Keep existing journal name if it was renamed by user
        pages: createAllPages(campaignId, type, entity, references, entry),
        'flags.core.sheetClass': `${moduleConfig.name}.KankaJournalApplication`,
        ...buildKankaFlags({
            version: buildVersionString(entity),
            snapshot: entity,
            references: references.getRecord(),
        }),
    };

    await entry.deleteEmbeddedDocuments('JournalEntryPage', [], { deleteAll: true });
    await entry.update({
        ...journalData,
        ownership: getOwnership([entity], entry.ownership),
    });

    return entry;
}
