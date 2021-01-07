export enum KankaSettings {
    accessToken = 'access_token',
    campaign = 'campaign',
    importLanguage = 'importLanguage',
    disableExternalMentionLinks = 'disableExternalMentionLinks',
    importPrivateEntities = 'importPrivateEntities',
    entityNotesVisibility = 'entityNotesVisibility',
    metaDataBasicVisibility = 'metaDataBasicVisibility',
    metaDataAttributeVisibility = 'metaDataAttributeVisibility',
    metaDataRelationVisibility = 'metaDataRelationVisibility',
    metaDataInventoryVisibility = 'metaDataInventoryVisibility',
    metaDataCharacterTraitVisibility = 'metaDataCharacterTraitVisibility',
    metaDataQuestReferenceVisibility = 'metaDataQuestReferenceVisibility',
    imageInText = 'imageInText',
    keepTreeStructure = 'keepTreeStructure',
}

export function kankaBrowserTypeCollapseSetting(type: string): KankaSettings {
    // This pretends to be a KankaSettings entry and should be usable everywhere regular KankaSettings
    // are usable
    return `collapseType_${type}` as KankaSettings;
}

export function kankaImportTypeSetting(type: string): KankaSettings {
    // This pretends to be a KankaSettings entry and should be usable everywhere regular KankaSettings
    // are usable
    return `importType_${type}` as KankaSettings;
}

export enum MetaDataType {
    basic = 'basic',
    reference = 'reference',
    attribute = 'attribute',
    inventory = 'inventory',
    relation = 'relation',
    characterTrait = 'characterTrait',
    questReference = 'questReference',
}

export enum MetaDataBasicVisibility {
    all = 'all',
    none = 'none',
}

export enum MetaDataAttributeVisibility {
    all = 'all',
    allStarred = 'allStarred',
    public = 'public',
    publicStarred = 'publicStarred',
    none = 'none',
}

export enum MetaDataRelationVisibility {
    all = 'all',
    allStarred = 'allStarred',
    public = 'public',
    publicStarred = 'publicStarred',
    none = 'none',
}

export enum MetaDataCharacterTraitVisibility {
    all = 'all',
    personality = 'personality',
    appearance = 'appearance',
    none = 'none',
}

export enum MetaDataQuestReferenceVisibility {
    all = 'all',
    public = 'public',
    none = 'none',
}

export enum MetaDataInventoryVisibility {
    all = 'all',
    public = 'public',
    none = 'none',
}

export enum EntityNotesVisibility {
    all = 'all',
    public = 'public',
    none = 'none',
}
