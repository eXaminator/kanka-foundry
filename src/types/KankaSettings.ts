export enum KankaSettings {
    accessToken = 'access_token',
    campaign = 'campaign',
    importLanguage = 'importLanguage',
    disableExternalMentionLinks = 'disableExternalMentionLinks',
    importPrivateEntities = 'importPrivateEntities',
    imageInText = 'imageInText',
    keepTreeStructure = 'keepTreeStructure',
    browserView = 'browserView',
    automaticPermissions = 'automaticPermissions',
    importTemplateEntities = 'importTemplateEntities',
    questQuestStatusIcon = 'questQuestStatusIcon',
}

export function kankaBrowserTypeCollapseSetting(type: string): KankaSettings {
    // This pretends to be a KankaSettings entry and should be usable everywhere regular KankaSettings
    // are usable
    return `collapseType_${type}` as KankaSettings;
}
