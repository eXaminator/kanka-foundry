import EntityType from '../../types/EntityType';
import { KankaApiId, KankaApiQuest } from '../../types/kanka';
import { MetaDataType } from '../../types/KankaSettings';
import getContrastColor from '../../util/getContrastColor';
import mentionLink from '../../util/mentionLink';
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
    #characters = this.createReferenceCollection('quest_characters', QuestCharacter);
    #locations = this.createReferenceCollection('quest_locations', QuestLocation);
    #items = this.createReferenceCollection('quest_items', QuestItem);
    #organisations = this.createReferenceCollection('quest_organisations', QuestOrganisation);

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
        const entities = await Promise.all(references.map(ref => ref.entity()));

        references.forEach((reference, index) => this.addMetaData({
            label: [
                mentionLink(entities[index].name, entities[index]),
                reference.color ? `<span class="kanka-colored-dot" style="background: ${reference.color}; color: ${getContrastColor(reference.color)};"></span>` : '',
            ].join(' '),
            // label: mentionLink(entities[index].name, entities[index]),
            value: referenceValue(reference),
            section,
            type: MetaDataType.questReference,
            originalData: reference,
        }, true));
    }

    protected createReferenceCollection<
        T extends QuestReference<PrimaryEntity> = QuestReference<PrimaryEntity>,
    >(path: string, model: KankaNodeClass<T>): KankaQuestReferenceCollection<T> {
        return new KankaQuestReferenceCollection<T>(this.endpoint.withPath(path), model, this.campaign);
    }
}
