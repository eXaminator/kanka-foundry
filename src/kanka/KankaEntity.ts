import { KankaEntityData } from '../types/kanka';
import { MetaDataType } from '../types/KankaSettings';
import EntityAttribute from './EntityAttribute';
import EntityMetaData from './EntityMetaData';
import KankaApi from './KankaApi';

export default abstract class KankaEntity<T extends KankaEntityData = KankaEntityData> {
    readonly #attributes: EntityAttribute[];
    #metaData: EntityMetaData[] = [];

    constructor(protected api: KankaApi<T>, protected data: T) {
        this.#attributes = data.attributes?.map(attr => EntityAttribute.fromAttribute(attr)) ?? [];
        this.buildMetaData();
    }

    public get id(): number {
        return this.data.id;
    }

    abstract get entityType(): string;

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
        return this.data.image_full;
    }

    public get entry(): string {
        return this.data.entry_parsed;
    }

    public get metaData(): EntityMetaData[] {
        return this.#metaData;
    }

    public get metaDataSections(): string[] {
        return Array.from(this.metaData)
            .map(data => data.section ?? '')
            .filter((section, index, all) => all.indexOf(section) === index);
    }

    public getMetaDataBySection(section?: string): EntityMetaData[] {
        return Array.from(this.metaData).filter(data => data.section === section);
    }

    protected buildMetaData(): void {
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

        if (keepFalsyValue || !!data.value) {
            this.#metaData.push({
                originalData: data.originalData,
                label: data.label ?? '',
                value: data.value,
                section: data.section ?? '',
                type: data.type ?? MetaDataType.basic,
            });
        }
    }
}
