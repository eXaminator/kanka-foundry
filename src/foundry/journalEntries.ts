import moduleConfig from '../../public/module.json';
import type ReferenceCollection from '../api/ReferenceCollection';
import Reference from '../types/Reference';
import {
    AnyConstrainable,
    KankaApiCharacter,
    KankaApiChildEntity,
    KankaApiId,
    KankaApiEntity,
    KankaApiEntityAsset,
    KankaApiEntityId,
    KankaApiEntityType,
    KankaApiFamily,
    KankaApiOrganisation,
    KankaApiQuest,
    KankaApiChildEntityWithChildren,
} from '../types/kanka';
import groupBy from '../util/groupBy';
import isEntityPrivate from '../util/isEntityPrivate';
import getGame from './getGame';
import { ensureFolderPath } from './journalFolders';
import { getSetting } from './settings';

const CURRENT_JOURNAL_VERSION = '000002';

type FlagTypes = {
    id: KankaApiEntityId,
    campaign: KankaApiId,
    snapshot: KankaApiChildEntity,
    type: KankaApiEntityType,
    version: string,
    references: Record<number, Reference>,
    [key: string]: unknown,
};

type OwnershipKeys = keyof typeof foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS;
type Ownership = typeof foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS[OwnershipKeys];

type NullableFlagTypes = {
    [Key in keyof FlagTypes]: FlagTypes[Key] | null
};

type FlagDataObject = {
    [Key in keyof NullableFlagTypes as Key extends string ? `flags.${typeof moduleConfig.name}.${Key}` : never]: NullableFlagTypes[Key]
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

function getOwnership(
    entities: AnyConstrainable[],
    currentOwnership?: Record<string, Ownership>,
    forPage = true,
): Record<string, Ownership> | undefined {
    const setting = getSetting('automaticPermissions');

    if (setting === 'never' && (!forPage || currentOwnership)) return currentOwnership ?? { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE };
    if (setting === 'initial' && currentOwnership) return currentOwnership;

    const allPrivate = entities.every(entity => isEntityPrivate(entity));

    if (allPrivate) return { ...currentOwnership ?? {}, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE };
    return forPage
        ? { ...currentOwnership ?? {}, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT }
        : { ...currentOwnership ?? {}, default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
}

function buildKankaFlags(flags: Partial<NullableFlagTypes>): Partial<FlagDataObject> {
    const flagData: Partial<FlagDataObject> = {};

    Object.entries(flags).forEach(([key, value]) => {
        flagData[`flags.${moduleConfig.name}.${key}`] = value;
    });

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

export function findEntryByTypeAndChildId(
    type: KankaApiEntityType,
    id: KankaApiId,
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

function createPage(
    type: string,
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: { snapshot: any },
    journal?: JournalEntry,
    { show = true, level = 1 } = {},
) {
    const entities = (Array.isArray(model.snapshot?.list) ? model.snapshot.list : [model.snapshot]).filter(e => !!e);

    if (!entities.length) {
        return null;
    }

    const existingPage = journal?.pages.getName(name);

    let counts: { publicCount?: number, totalCount?: number } = {};

    if (model.snapshot?.list) {
        counts = {
            publicCount: entities.filter(e => !isEntityPrivate(e)).length,
            totalCount: entities.length,
        };
    }

    return {
        type: `${moduleConfig.name}.${type}`,
        name,
        title: { show, level },
        system: { ...model, ...counts },
        ownership: getOwnership(entities, existingPage?.ownership),
    };
}

function createCharacterProfilePage(
    name: string,
    model: { snapshot: unknown },
    journal?: JournalEntry,
    { show = false, level = 2 } = {},
) {
    const character = model.snapshot as KankaApiCharacter;

    if (!character.traits) {
        return null;
    }

    const groupedTraits = groupBy(character.traits, 'section');
    const appearance = groupedTraits.get('appearance') ?? [];
    const personality = groupedTraits.get('personality') ?? [];
    const existingPage = journal?.pages.getName(name);

    if (appearance.length === 0 && personality.length === 0) {
        return null;
    }

    const ownership = getOwnership([
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...appearance.map(() => ({ is_private: false })),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ...personality.map(() => ({ is_private: !character.is_personality_visible })),
    ], existingPage?.ownership);

    return {
        type: `${moduleConfig.name}.character-profile`,
        name,
        title: { show, level },
        system: {
            ...model,
            snapshot: {
                appearance,
                personality,
                isPersonalityVisible: character.is_personality_visible,
            },
        },
        ownership,
    };
}

function createImagePage(
    name: string,
    entity: KankaApiChildEntity,
    journal?: JournalEntry,
    { show = false, level = 1 } = {},
) {
    if (!entity.has_custom_image) return null;

    const existingPage = journal?.pages.getName(name);
    const ownership = getOwnership([entity], existingPage?.ownership);

    return {
        type: 'image',
        name,
        title: { show, level },
        src: entity.image_full,
        image: { caption: null },
        ownership,
    };
}

function createPostPage(
    name: string,
    content: string | null | undefined,
    ownership?: Record<string, Ownership>,
    { show = true, level = 2 } = {},
) {
    if (!content) return null;

    return {
        type: `${moduleConfig.name}.post`,
        name,
        title: { show, level },
        text: { content },
        ownership,
    };
}

function createAssetFilePages(
    assets: KankaApiEntityAsset[],
    journal?: JournalEntry,
    { show = false, level = 2 } = {},
) {
    return assets
        .map((asset) => {
            const existingPage = journal?.pages.getName(asset.name);
            const ownership = getOwnership([asset], existingPage?.ownership);

            if (asset._file && /^image\/.*/.test(asset.metadata.type)) {
                return {
                    type: 'image',
                    name: asset.name,
                    title: { show, level },
                    src: asset._url,
                    image: { caption: asset.name },
                    ownership,
                };
            }

            if (asset._file && asset.metadata.type === 'application/pdf') {
                return {
                    type: 'pdf',
                    name: asset.name,
                    title: { show, level },
                    src: asset._url,
                    ownership,
                };
            }

            if (asset._file && /^audio\/.*/.test(asset.metadata.type)) {
                return {
                    type: 'video',
                    name: asset.name,
                    title: { show, level },
                    src: asset._url,
                    video: { controls: true, autoplay: false, loop: false },
                    ownership,
                };
            }

            if (asset._link && /^https:\/\/(www\.)?youtube\.com/.test(asset.metadata.url)) {
                return {
                    type: 'video',
                    name: asset.name,
                    title: { show, level },
                    src: asset.metadata.url,
                    video: { controls: true, autoplay: false, loop: false },
                    ownership,
                };
            }

            return null;
        });
}

function mergeModel(base: Record<string, unknown>, snapshot: unknown) {
    return {
        ...base,
        snapshot: Array.isArray(snapshot) ? { list: snapshot } : snapshot,
    };
}

function unzip<T>(array: T[], splitter: (item: T, index: number) => boolean): [T[], T[]] {
    return array.reduce<[T[], T[]]>(
        (entries, entry, index) => {
            if (splitter(entry, index)) {
                entries[0].push(entry);
            } else {
                entries[1].push(entry);
            }

            return entries;
        },
        [[], []],
    );
}

function createAllPages(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    entity: KankaApiChildEntity & { ancestors?: number[] },
    references: ReferenceCollection,
    journal?: JournalEntry,
) {
    const model = {
        type,
        campaignId,
        kankaId: entity.id,
        kankaEntityId: entity.entity_id,
        name: entity.name,
        img: entity.has_custom_image ? entity.image_full : undefined,
        version: buildVersionString(entity),
        references: references.getRecord(),
    };

    const [prePosts, postPosts] = unzip(
        entity.posts.sort((a, b) => ((a.position ?? 0) - (b.position ?? 0))),
        (post, index) => (post.position ?? index) < 0,
    );

    return [
        createImagePage('KANKA.journal.shared.pages.image', entity, journal),
        createPage('overview', 'KANKA.journal.shared.pages.story', mergeModel(model, entity), journal, { show: false }),
        createCharacterProfilePage('KANKA.journal.character.pages.profile', mergeModel(model, entity), journal),
        ...prePosts.map(note => createPostPage(
            note.name,
            note.entry_parsed,
            getOwnership([note], journal?.pages.getName(note.name)?.ownership),
        )),
        createPostPage('KANKA.journal.shared.pages.entry', entity.entry_parsed),
        ...postPosts.map(note => createPostPage(
            note.name,
            note.entry_parsed,
            getOwnership([note], journal?.pages.getName(note.name)?.ownership),
        )),
        createPage('relations', 'KANKA.journal.shared.pages.relations', mergeModel(model, entity.relations), journal),

        createPage('character-organisations', 'KANKA.journal.character.pages.organisations', mergeModel(model, (entity as KankaApiCharacter).organisations?.data), journal),

        type === 'family' ? createPage('family-members', 'KANKA.journal.family.pages.members', mergeModel(model, (entity as KankaApiFamily).members?.map(id => references.findByIdAndType(id, 'character'))), journal) : null,
        type === 'organisation' ? createPage('organisation-members', 'KANKA.journal.organisation.pages.members', mergeModel(model, (entity as KankaApiOrganisation).members), journal) : null,
        createPage('quest-elements', 'KANKA.journal.quest.pages.elements', mergeModel(model, (entity as KankaApiQuest).elements), journal),

        createPage('assets', 'KANKA.journal.shared.pages.assets', mergeModel(model, entity.entity_assets), journal),
        ...createAssetFilePages(entity.entity_assets, journal),
        createPage('attributes', 'KANKA.journal.shared.pages.attributes', mergeModel(model, entity.attributes), journal),
        createPage('abilities', 'KANKA.journal.shared.pages.abilities', mergeModel(model, entity.entity_abilities), journal),
        createPage('inventory', 'KANKA.journal.shared.pages.inventory', mergeModel(model, entity.inventory), journal),
        createPage('events', 'KANKA.journal.shared.pages.events', mergeModel(model, entity.entity_events), journal),

        createPage('children', `KANKA.entityType.${type}`, mergeModel(model, (entity as KankaApiChildEntityWithChildren).children?.map(child => ({ ref: references.findByEntityId(child.entity_id), type: child.type }))), journal),
    ].filter(page => !!page);
}

export async function createJournalEntry(
    campaignId: KankaApiId,
    type: KankaApiEntityType,
    entity: KankaApiChildEntity & { ancestors?: number[] },
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const journalData = {
        name: entity.name,
        pages: createAllPages(campaignId, type, entity, references),
        // eslint-disable-next-line @typescript-eslint/naming-convention
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

    const path = entity?.ancestors
        ?.map(id => references.findByEntityId(id))
        .filter((ref): ref is Reference => !!ref) ?? [];
    const folder = await ensureFolderPath(type, path);

    return await JournalEntry.create({
        ...journalData,
        ownership: getOwnership([entity], undefined, false),
        folder: folder?.id,
    }) as JournalEntry;
}

export async function updateJournalEntry(
    entry: JournalEntry,
    entity: KankaApiChildEntity & { ancestors?: number[] },
    references: ReferenceCollection,
): Promise<JournalEntry> {
    const campaignId = getEntryFlag(entry, 'campaign');
    const type = getEntryFlag(entry, 'type');
    const oldName = getEntryFlag(entry, 'snapshot')?.name;

    if (!campaignId || !type) throw new Error('Missing flags on journal entry');

    const journalData = {
        name: entry.name === oldName ? entity.name : oldName, // Keep existing journal name if it was renamed by user
        pages: createAllPages(campaignId, type, entity, references, entry),
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
        ownership: getOwnership([entity], entry.ownership, false),
    });

    return entry;
}
