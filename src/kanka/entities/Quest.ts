import EntityType from '../../types/EntityType';
import { QuestData } from '../../types/kanka';
import { MetaDataType } from '../../types/KankaSettings';
import mentionLink from '../../util/mentionLink';
import EntityCollection from '../EntityCollection';
import type Campaign from './Campaign';
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

export default class Quest extends PrimaryEntity<QuestData, Campaign> {
    #characters = this.createCollection('quest_characters', QuestCharacter);
    #locations = this.createCollection('quest_locations', QuestLocation);
    #items = this.createCollection('quest_items', QuestItem);
    #organisations = this.createCollection('quest_organisations', QuestOrganisation);

    get entityType(): EntityType {
        return EntityType.quest;
    }

    get treeParentId(): number | undefined {
        return this.data.quest_id;
    }

    async treeParent(): Promise<Quest | undefined> {
        return this.findReference(this.parent.quests(), this.treeParentId);
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

    public get characters(): EntityCollection<QuestCharacter> {
        return this.#characters;
    }

    public get locations(): EntityCollection<QuestLocation> {
        return this.#locations;
    }

    public get items(): EntityCollection<QuestItem> {
        return this.#items;
    }

    public get organisations(): EntityCollection<QuestOrganisation> {
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
            label: mentionLink(entities[index].name, entities[index]),
            value: referenceValue(reference),
            section,
            type: MetaDataType.questReference,
            originalData: reference,
        }, true));
    }
}
