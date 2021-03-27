import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiQuest } from '../../types/kanka';
import { MetaDataType } from '../../types/KankaSettings';
import getContrastColor from '../../util/getContrastColor';
import mentionLink from '../../util/mentionLink';
import KankaEmptyNodeCollection from '../KankaEmptyNodeCollection';
import KankaNodeClass from '../KankaNodeClass';
import KankaNodeCollection from '../KankaNodeCollection';
import KankaQuestReferenceCollection from '../KankaQuestReferenceCollection';
import PrimaryEntity from './PrimaryEntity';
import QuestCharacter from './QuestCharacter';
import QuestItem from './QuestItem';
import QuestLocation from './QuestLocation';
import QuestOrganisation from './QuestOrganisation';
import QuestReference from './QuestReference';

function referenceValue(reference: QuestReference): string {
    const content: string[] = [];

    if (reference.role) {
        content.push(`<strong class="kanka-quest-role">${reference.role}</strong>`);
    }

    if (reference.description?.trim()) {
        content.push(reference.description.trim());
    }

    return content.join('<br/>');
}

export default class Quest extends PrimaryEntity<KankaApiQuest> {
    #characters = this.createReferenceCollection('quest_characters', QuestCharacter, this.data.characters);
    #locations = this.createReferenceCollection('quest_locations', QuestLocation, this.data.locations);
    #items = this.createReferenceCollection('quest_items', QuestItem, this.data.items);
    #organisations = this.createReferenceCollection('quest_organisations', QuestOrganisation, this.data.organisations);

    get entityType(): EntityType {
        return EntityType.quest;
    }

    get treeParentId(): KankaApiId | undefined {
        return this.data.quest_id;
    }

    async treeParent(): Promise<Quest | undefined> {
        if (!this.treeParentId) return undefined;
        return this.campaign.quests().byId(this.treeParentId);
    }

    public get type(): string | undefined {
        return this.data.type;
    }

    public get date(): string | undefined {
        return this.data.date;
    }

    public get isCompleted(): boolean {
        return this.data.is_completed;
    }

    public get characters(): KankaNodeCollection<QuestCharacter> {
        return this.#characters;
    }

    public get locations(): KankaNodeCollection<QuestLocation> {
        return this.#locations;
    }

    public get items(): KankaNodeCollection<QuestItem> {
        return this.#items;
    }

    public get organisations(): KankaNodeCollection<QuestOrganisation> {
        return this.#organisations;
    }

    protected async buildMetaData(): Promise<void> {
        await super.buildMetaData();
        this.addMetaData({ label: 'type', value: this.type });
        this.addMetaData({ label: 'date', value: this.date });
        this.addMetaData({ label: 'isCompleted', value: this.isCompleted });

        await Promise.all([
            this.addQuestReferenceMetaData(this.#characters.all(), 'characters'),
            this.addQuestReferenceMetaData(this.#locations.all(), 'locations'),
            this.addQuestReferenceMetaData(this.#items.all(), 'items'),
            this.addQuestReferenceMetaData(this.#organisations.all(), 'organisations'),
        ]);
    }

    private async addQuestReferenceMetaData(
        referencePromises: Promise<QuestReference[]>,
        section: string,
    ): Promise<void> {
        const references = await referencePromises;
        const entities = await Promise.all(references.map(ref => ref.entity().catch(() => undefined)));

        references.forEach((reference, index) => {
            const { color } = reference;
            const entity = entities[index];
            if (!entity) return;

            this.addMetaData({
                label: [
                    mentionLink(entity.name, entity),
                    color ? `<span class="kanka-colored-dot" style="background: ${color}; color: ${getContrastColor(color)};"></span>` : '',
                ].join(' '),
                value: referenceValue(reference),
                section,
                type: MetaDataType.questReference,
                originalData: reference,
            }, true);
        });
    }

    protected createReferenceCollection<
        T extends QuestReference<PrimaryEntity> = QuestReference<PrimaryEntity>,
    >(path: string, model: KankaNodeClass<T>, count: number): KankaNodeCollection<T> {
        if (count === 0) {
            return new KankaEmptyNodeCollection<T>(this.endpoint.withPath(path), model);
        }

        return new KankaQuestReferenceCollection<T>(this.endpoint.withPath(path), model, this.campaign);
    }
}
