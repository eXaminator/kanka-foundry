import EntityType from './EntityType';

export enum KankaSettings {
    accessToken = 'access_token',
    campaign = 'campaign',
    importPrivateEntities = 'importPrivateEntities',
    metaDataBasicVisibility = 'metaDataBasicVisibility',
    metaDataAttributeVisibility = 'metaDataAttributeVisibility',
    metaDataCharacterTraitVisibility = 'metaDataCharacterTraitVisibility',
    imageInText = 'imageInText',
}

export function kankaImportTypeSetting(type: EntityType): KankaSettings {
    // This pretends to be a KankaSettings entry and should be usable everywhere regular KankaSettings
    // are usable
    return `importType_${type}` as KankaSettings;
}

export enum MetaDataType {
    basic = 'basic',
    attribute = 'attribute',
    characterTrait = 'characterTrait',
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

export enum MetaDataCharacterTraitVisibility {
    all = 'all',
    personality = 'personality',
    appearance = 'appearance',
    none = 'none',
}
