type StringFieldOprions = ConstructorParameters<typeof foundry.data.fields.StringField>[0] & { blank: boolean };

export default class KankaPageModel extends foundry.abstract.TypeDataModel {
    static defineSchema(): unknown {
        const { fields } = foundry.data;

        return {
            kankaId: new fields.NumberField({ required: true }),
            kankaEntityId: new fields.NumberField({ required: true }),
            campaignId: new fields.NumberField({ required: true }),
            type: new fields.StringField({ required: true, blank: false, trim: true } as StringFieldOprions),
            name: new fields.StringField({ required: true, blank: false, trim: true } as StringFieldOprions),
            img: new fields.StringField({ blank: false, trim: true } as StringFieldOprions),
            version: new fields.StringField({ required: true, blank: false, trim: true } as StringFieldOprions),
            snapshot: new fields.ObjectField({ required: true, nullable: false }),
            references: new fields.ObjectField({ required: true, nullable: false }),
            publicCount: new fields.NumberField({ required: false }),
            totalCount: new fields.NumberField({ required: false }),
        };
    }

    prepareDerivedData(): void {}
}
