import type ReferenceCollection from '../api/ReferenceCollection';
import type { KankaApiId, KankaApiEntityType, KankaApiChildEntity, KankaApiChildEntityWithChildren, KankaApiEntityId, KankaApiAnyId } from "../types/kanka";
import type Reference from '../types/Reference';
import moduleConfig from '../../public/module.json';
import { hasChildren, isCharacter, isFamily, isOrganisation, isQuest } from '../util/kankaTypeGuards';
import isSecret from '../util/isSecret';
import groupBy from '../util/groupBy';
import unzip from '../util/unzip';
import { getSetting } from './settings';

type PageModel = {
    type: KankaApiEntityType;
    campaignId: KankaApiId;
    kankaId: KankaApiId;
    kankaEntityId: KankaApiEntityId;
    name: string;
    img?: string;
    version: string;
    references: Record<number, Reference>;
    snapshot: Record<string, unknown>;
};

type KeysOfValue<T, TCondition> = {
    [K in keyof T]: T[K] extends TCondition
    ? K
    : never;
}[keyof T];

type OwnershipKeys = keyof typeof foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS;
type Ownership = (typeof foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS)[OwnershipKeys];

export default class PageFactory {
    static readonly CURRENT_PAGE_FACTORY_VERSION = '000001';

    private readonly model: PageModel;
    private readonly permissionSetting = getSetting('automaticPermissions');

    constructor(
        campaignId: KankaApiId,
        private readonly type: KankaApiEntityType,
        private readonly entity: KankaApiChildEntity | KankaApiChildEntityWithChildren,
        private readonly references: ReferenceCollection,
        private readonly journal?: JournalEntry,
    ) {
        this.model = {
            type: type,
            campaignId: campaignId,
            kankaId: entity.id,
            kankaEntityId: entity.entity_id,
            name: entity.name,
            img: entity.has_custom_image ? entity.image_full : undefined,
            version: `${PageFactory.CURRENT_PAGE_FACTORY_VERSION}-${entity.updated_at}`,
            references: references.getRecord(),
            snapshot: {},
        };
    }

    private getCounts<T>(list: T[], refProp?: KeysOfValue<T, KankaApiAnyId>, type?: KankaApiEntityType) {
        return {
            publicCount: list
                .map(item => {
                    let ref: Reference | undefined = undefined;

                    if (refProp) {
                        ref = type ? this.references.findByIdAndType(item[refProp] as KankaApiId, type) : this.references.findByEntityId(item[refProp] as KankaApiEntityId)
                    }

                    return {
                        item,
                        ref,
                    };
                })
                .filter(({ item, ref }) => !isSecret(item, ref))
                .length,
            totalCount: list.length,
        };
    }

    private getOwnership(name: string, publicCount: number | undefined): Record<string, Ownership> {
        const currentOwnership = this.journal?.pages.getName(name)?.ownership;

        if (this.permissionSetting === 'initial' && currentOwnership) {
            return currentOwnership;
        }

        if (publicCount === 0) {
            return { ...(currentOwnership ?? {}), default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE };
        }

        return { ...(currentOwnership ?? {}), default: CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT };
    }

    private createPage(
        pageType: string,
        name: string,
        snapshot: any,
        { publicCount, totalCount }: { publicCount?: number, totalCount?: number } = {},
        { show = true, level = 1 } = {},
        other: Record<string, unknown> = {},
        sheet: string | null = 'kanka-foundry.DefaultPageSheet',
    ) {
        if (Array.isArray(snapshot?.list) && snapshot?.list.length === 0) {
            return null;
        }

        return {
            type: `${moduleConfig.name}.${pageType}`,
            name,
            title: { show, level },
            system: { ...this.model, snapshot, publicCount, totalCount },
            ownership: this.getOwnership(name, publicCount),
            flags: sheet ? { core: { sheetClass: sheet } } : {},
            ...other,
        };
    }

    createEntityImagePage() {
        if (!this.entity.has_custom_image) {
            return null;
        }

        return {
            type: 'image',
            name: 'KANKA.journal.shared.pages.image',
            title: { show: false, level: 1 },
            ownership: this.getOwnership('KANKA.journal.shared.pages.image', undefined),
            src: this.entity.image_full,
            image: { caption: null },
        };
    }

    createCharacterProfilePage() {
        if (!isCharacter(this.entity, this.type)) {
            return null;
        }

        if (!this.entity.traits) {
            return null;
        }

        const groupedTraits = groupBy(this.entity.traits, 'section');
        const appearance = groupedTraits.get('appearance') ?? [];
        const personality = groupedTraits.get('personality') ?? [];
        const isPersonalityVisible = !this.entity.is_personality_visible;

        if (appearance.length === 0 && personality.length === 0) {
            return null;
        }

        const countObjects = [
            ...appearance.map(() => ({ is_private: false })),
            ...personality.map(() => ({ is_private: !isPersonalityVisible })),
        ];

        return this.createPage(
            'character-profile',
            'KANKA.journal.character.pages.profile',
            { appearance, personality, isPersonalityVisible },
            this.getCounts(countObjects),
            { show: false, level: 2 },
        );
    }

    createOverviewPage() {
        return this.createPage(
            'overview',
            'KANKA.journal.shared.pages.story',
            this.entity,
            undefined,
            { show: false },
        );
    }

    private createPostPage(name: string, content: string | null | undefined) {
        if (!content) {
            return null;
        }

        return this.createPage(
            'post',
            name,
            this.entity,
            undefined,
            { show: true, level: 2 },
            { text: { content } },
            'kanka-foundry.PostPageSheet',
        );
    }

    createPostPages() {
        if (!this.entity.posts.length) {
            return [];
        }

        const [prePosts, postPosts] = unzip(
            this.entity.posts.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
            (post, index) => (post.position ?? index) < 0,
        );

        return [
            ...prePosts.map((note) =>
                this.createPostPage(note.name, note.entry_parsed)
            ),
            this.createPostPage('KANKA.journal.shared.pages.entry', this.entity.entry_parsed),
            ...postPosts.map((note) =>
                this.createPostPage(note.name, note.entry_parsed)
            ),
        ];
    }

    createRelationsPage() {
        return this.createPage(
            'relations',
            'KANKA.journal.shared.pages.relations',
            { list: this.entity.relations },
            this.getCounts(this.entity.relations, 'target_id'),
        );
    }

    createCharacterOrganisationsPage() {
        if (!isCharacter(this.entity, this.type)) {
            return null;
        }

        return this.createPage(
            'character-organisations',
            'KANKA.journal.character.pages.organisations',
            { list: this.entity.organisations.data },
            this.getCounts(this.entity.organisations.data, 'organisation_id', 'organisation'),
        );
    }

    createFamilyMembersPage() {
        if (!isFamily(this.entity, this.type)) {
            return null;
        }

        return this.createPage(
            'family-members',
            'KANKA.journal.family.pages.members',
            { list: this.entity.members },
            this.getCounts(this.entity.members.map(m => ({ id: m })), 'id', 'character'),
        );
    }

    createOrganisationMembersPage() {
        if (!isOrganisation(this.entity, this.type)) {
            return null;
        }

        return this.createPage(
            'organisation-members',
            'KANKA.journal.organisation.pages.members',
            { list: this.entity.members },
            this.getCounts(this.entity.members, 'character_id', 'character'),
        );
    }

    createQuestElementsPage() {
        if (!isQuest(this.entity, this.type)) {
            return null;
        }

        return this.createPage(
            'quest-elements',
            'KANKA.journal.quest.pages.elements',
            { list: this.entity.elements },
            this.getCounts(this.entity.elements, 'entity_id'),
        );
    }

    createAssetsPage() {
        return this.createPage(
            'assets',
            'KANKA.journal.shared.pages.assets',
            { list: this.entity.entity_assets },
            this.getCounts(this.entity.entity_assets),
        );
    }

    createAssetFilePages() {
        if (!this.entity.entity_assets) {
            return [];
        }

        return this.entity.entity_assets
            .map(asset => {
                if (asset._file && /^image\/.*/.test(asset.metadata.type)) {
                    return {
                        type: 'image',
                        name: asset.name,
                        title: { show: false, level: 2 },
                        ownership: this.getOwnership(asset.name, this.getCounts([asset], 'id').publicCount),
                        src: asset._url,
                        image: { caption: asset.name },
                    };
                }

                if (asset._file && /^audio\/.*/.test(asset.metadata.type)) {
                    return {
                        type: 'video',
                        name: asset.name,
                        title: { show: false, level: 2 },
                        ownership: this.getOwnership(asset.name, this.getCounts([asset], 'id').publicCount),
                        src: asset._url,
                        video: { controls: true, autoplay: false, loop: false },
                    };
                }

                if (asset._link && /^https:\/\/(www\.)?youtube\.com/.test(asset.metadata.url)) {
                    return {
                        type: 'video',
                        name: asset.name,
                        title: { show: false, level: 2 },
                        ownership: this.getOwnership(asset.name, this.getCounts([asset], 'id').publicCount),
                        src: asset.metadata.url,
                        video: { controls: true, autoplay: false, loop: false },
                    };
                }

                return null;
            });
    }

    createAttributesPage() {
        return this.createPage(
            'attributes',
            'KANKA.journal.shared.pages.attributes',
            { list: this.entity.attributes },
            this.getCounts(this.entity.attributes),
        );
    }

    createAbilitiesPage() {
        return this.createPage(
            'abilities',
            'KANKA.journal.shared.pages.abilities',
            { list: this.entity.entity_abilities },
            this.getCounts(this.entity.entity_abilities, 'ability_id', 'ability'),
        );
    }

    createInventoryPage() {
        return this.createPage(
            'inventory',
            'KANKA.journal.shared.pages.inventory',
            { list: this.entity.inventory },
            this.getCounts(this.entity.inventory, 'item_id', 'item'),
        );
    }

    createEventsPage() {
        return this.createPage(
            'events',
            'KANKA.journal.shared.pages.events',
            { list: this.entity.entity_events },
            this.getCounts(this.entity.entity_events, 'calendar_id', 'calendar'),
        );
    }

    createChildrenPage() {
        if (!hasChildren(this.entity, this.type)) {
            return null;
        }

        return this.createPage(
            'children',
            `KANKA.entityType.${this.type}`,
            { list: this.entity.children },
            this.getCounts(this.entity.children.map(m => ({ id: m })), 'id', this.type),
        );
    }
}