import EntityType from '../../types/EntityType';
import { KankaEntityData } from '../../types/kanka';
import { MetaDataType } from '../../types/KankaSettings';
import KankaApi from '../KankaApi';
import type Campaign from './Campaign';
import EntityAttribute from './EntityAttribute';
import EntityBase from './EntityBase';
import EntityMetaData from './EntityMetaData';
import InventoryItem from './InventoryItem';

export default abstract class PrimaryEntity<
    T extends KankaEntityData = KankaEntityData,
    P extends Campaign = Campaign
> extends EntityBase<T, P> {
    readonly #attributes: EntityAttribute[];
    readonly #inventory: InventoryItem[];
    #metaData?: EntityMetaData[];

    constructor(api: KankaApi<T>, data: T, parent: P) {
        super(api, data, parent);
        this.#attributes = data.attributes?.map(attr => EntityAttribute.fromAttribute(attr)) ?? [];
        this.#inventory = data.inventory?.map(entry => new InventoryItem(this.api, entry, this)) ?? [];
    }

    abstract get entityType(): EntityType;

    get treeParentId(): number | undefined {
        return undefined;
    }

    async treeParent(): Promise<PrimaryEntity<T, P> | undefined> {
        return undefined;
    }

    async treeAncestors(): Promise<PrimaryEntity<T, P>[]> {
        const parent = await this.treeParent();
        if (!parent) return [];
        const path = await parent.treeAncestors();
        return [...path, parent];
    }

    public get attributes(): EntityAttribute[] {
        return this.#attributes;
    }

    public get inventory(): InventoryItem[] {
        return this.#inventory;
    }

    public get entityId(): number {
        return this.data.entity_id;
    }

    public get name(): string {
        return this.data.name;
    }

    public get image(): string | undefined {
        if (this.data.has_custom_image === false) return undefined;
        return `https://kanka-user-assets.s3.eu-central-1.amazonaws.com/${this.data.image}`;
    }

    public get entry(): string {
        return this.data.entry_parsed;
    }

    public async metaData(): Promise<EntityMetaData[]> {
        if (!this.#metaData) {
            this.#metaData = [];
            await this.buildMetaData();
        }

        return this.#metaData;
    }

    public async metaDataSections(): Promise<string[]> {
        const metaData = await this.metaData();
        return metaData
            .map(data => data.section ?? '')
            .filter((section, index, all) => all.indexOf(section) === index);
    }

    public async getMetaDataBySection(section?: string): Promise<EntityMetaData[]> {
        const metaData = await this.metaData();
        return metaData.filter(data => data.section === section);
    }

    protected async buildMetaData(): Promise<void> {
        let currentSection: EntityAttribute | undefined;

        this.attributes
            .sort((a, b) => a.defaultOrder - b.defaultOrder)
            .forEach((attribute) => {
                if (attribute.isSection()) {
                    currentSection = attribute;
                    return;
                }

                this.addMetaData({
                    type: MetaDataType.attribute,
                    section: currentSection?.name,
                    label: attribute.name,
                    value: attribute.value,
                    originalData: attribute,
                });
            });

        const items = await Promise.all(this.inventory.map(i => i.item()));

        this.inventory
            .forEach((inventory, index) => {
                this.addMetaData({
                    type: MetaDataType.inventory,
                    section: inventory.position || 'inventory',
                    label: items[index]?.name,
                    value: `${inventory.amount ? `${inventory.amount} &times; ` : ''}${inventory.name}${inventory.isEquipped ? '*' : ''}`,
                    originalData: inventory,
                    linkTo: items[index],
                });
            });
    }

    protected addMetaData(data?: Partial<EntityMetaData>, keepFalsyValue = false): void {
        if (!data) return;

        if (!this.#metaData) {
            this.#metaData = [];
        }

        if (keepFalsyValue || !!data.value) {
            this.#metaData.push({
                originalData: data.originalData,
                label: data.label ?? '',
                value: data.value,
                section: data.section ?? '',
                type: data.type ?? MetaDataType.basic,
                linkTo: data.linkTo,
            });
        }
    }

    protected async addReferenceMetaData(
        label: string,
        entityPromise?: Promise<PrimaryEntity | undefined>,
        section?: string,
    ): Promise<void> {
        const entity = await entityPromise;

        if (entity) {
            this.addMetaData({
                label,
                section,
                originalData: entity,
                type: MetaDataType.reference,
                value: entity.name,
                linkTo: entity,
            });
        }
    }
}
