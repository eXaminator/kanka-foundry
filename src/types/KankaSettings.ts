export enum KankaSettings {
    accessToken = 'access_token',
    campaign = 'campaign',
    metaDataBasicVisibility = 'metaDataBasicVisibility',
    metaDataAttributeVisibility = 'metaDataAttributeVisibility',
    metaDataCharacterTraitVisibility = 'metaDataCharacterTraitVisibility',
    imageInText = 'imageInText',
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
