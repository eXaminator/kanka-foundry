export {};

type FlagData = {
    id: KankaApiEntityId;
    campaign: KankaApiId;
    snapshot: KankaApiChildEntity;
    type: KankaApiModuleType;
    version: string;
    references: Record<number, Reference>;
}

declare module "fvtt-types/configuration" {
    interface FlagConfig {
        JournalEntry: {
            'core': Document.CoreFlags;
            'kanka-foundry': FlagData;
        };
        Folder: {
            'core': Document.CoreFlags;
            'kanka-foundry': FlagData;
        }
    }

    interface DataModelConfig {
        JournalEntryPage: {
            "kanka-foundry.post": BaseJournalEntryPage;
            "kanka-foundry.overview": typeof KankaPageModel;
            "kanka-foundry.character-profile": typeof KankaPageModel;
            "kanka-foundry.attributes": typeof KankaPageModel;
            "kanka-foundry.abilities": typeof KankaPageModel;
            "kanka-foundry.relations": typeof KankaPageModel;
            "kanka-foundry.assets": typeof KankaPageModel;
            "kanka-foundry.inventory": typeof KankaPageModel;
            "kanka-foundry.children": typeof KankaPageModel;
            "kanka-foundry.events": typeof KankaPageModel;
            "kanka-foundry.character-organisations": typeof KankaPageModel;
            "kanka-foundry.family-members": typeof KankaPageModel;
            "kanka-foundry.organisation-members": typeof KankaPageModel;
            "kanka-foundry.quest-elements": typeof KankaPageModel;
        }
    }

    interface SettingConfig {
        'kanka-foundry.baseUrl': string;
        'kanka-foundry.accessToken': string;
        'kanka-foundry.campaign': string;
        'kanka-foundry.importLanguage': string;
        'kanka-foundry.disableExternalMentionLinks': boolean;
        'kanka-foundry.importPrivateEntities': boolean;
        'kanka-foundry.mergeOverviewPages': boolean;
        'kanka-foundry.keepTreeStructure': boolean;
        'kanka-foundry.browserView': 'grid' | 'list';
        'kanka-foundry.automaticPermissions': 'never' | 'initial' | 'always';
        'kanka-foundry.importTemplateEntities': boolean;
        'kanka-foundry.questQuestStatusIcon': boolean;
        'kanka-foundry.migrationVersion': string,
        'kanka-foundry.collapseType_ability': boolean,
        'kanka-foundry.collapseType_campaign': boolean,
        'kanka-foundry.collapseType_creature': boolean,
        'kanka-foundry.collapseType_character': boolean,
        'kanka-foundry.collapseType_event': boolean,
        'kanka-foundry.collapseType_family': boolean,
        'kanka-foundry.collapseType_item': boolean,
        'kanka-foundry.collapseType_journal': boolean,
        'kanka-foundry.collapseType_location': boolean,
        'kanka-foundry.collapseType_note': boolean,
        'kanka-foundry.collapseType_organisation': boolean,
        'kanka-foundry.collapseType_quest': boolean,
        'kanka-foundry.collapseType_race': boolean,
    }
}
