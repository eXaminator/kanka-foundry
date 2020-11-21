import EntityType from '../types/EntityType';
import { KankaEntityData } from '../types/kanka';
import { MetaDataType } from '../types/KankaSettings';
import EntityAttribute from './EntityAttribute';
import EntityBase from './EntityBase';
import EntityMetaData from './EntityMetaData';
import KankaApi from './KankaApi';

export default abstract class KankaEntity<T extends KankaEntityData = KankaEntityData> extends EntityBase<T> {
    readonly #attributes: EntityAttribute[];
    #metaData?: EntityMetaData[];

    constructor(api: KankaApi<T>, data: T) {
        super(api, data);
        this.#attributes = data.attributes?.map(attr => EntityAttribute.fromAttribute(attr)) ?? [];
    }

    abstract get entityType(): EntityType;

    public get attributes(): EntityAttribute[] {
        return this.#attributes;
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
}
