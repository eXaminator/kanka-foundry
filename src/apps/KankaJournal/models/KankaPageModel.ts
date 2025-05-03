import type Reference from "../../../types/Reference";
import DataSchema = foundry.data.fields.DataSchema;
import TypeDataModel = foundry.abstract.TypeDataModel;
import type { KankaApiChildEntity } from "../../../types/kanka";

declare namespace KankaPageModel {
    interface Schema extends DataSchema, ReturnType<typeof KankaPageModel['defineSchema']> { }
    // biome-ignore lint/complexity/noBannedTypes: This is intentional
    type BaseData = {};
    // biome-ignore lint/complexity/noBannedTypes: This is intentional
    type DerivedData = {};
}

class KankaPageModel extends TypeDataModel<KankaPageModel.Schema, JournalEntryPage> {
    static defineSchema() {
        const { fields } = foundry.data;

        return {
            kankaId: new fields.NumberField({ required: true }),
            kankaEntityId: new fields.NumberField({ required: true }),
            campaignId: new fields.NumberField({ required: true }),
            type: new fields.StringField({ required: true, blank: false, trim: true }),
            name: new fields.StringField({ required: true, blank: false, trim: true }),
            img: new fields.StringField({ blank: false, trim: true }),
            version: new fields.StringField({ required: true, blank: false, trim: true }),
            snapshot: new fields.ObjectField<
                { required: true, nullable: false },
                Record<string, unknown>,
                Record<string, unknown>,
                Record<string, unknown>
            >({ required: true, nullable: false }),
            references: new fields.ObjectField<
                { required: true, nullable: false },
                Record<number, Reference>,
                Record<number, Reference>,
                Record<number, Reference>
            >({ required: true, nullable: false }),
            publicCount: new fields.NumberField({ required: false }),
            totalCount: new fields.NumberField({ required: false }),
        };
    }

    prepareDerivedData(): void { }
}

export { KankaPageModel };
