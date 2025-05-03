// Migrate global Kanka access key setting to local setting
export default async function migrate(): Promise<void> {
    const accessKeySetting = game.settings?.storage
        .get('world')
        ?.find((setting) => setting.key === 'kanka-foundry.accessToken');
    const accessKey = accessKeySetting?.value;

    if (game.user?.isGM && accessKey) {
        await game.settings?.set('kanka-foundry', 'accessToken', accessKey);
        await accessKeySetting.delete();

        const campaignSetting = game.settings.storage
            .get('world')
            ?.find((setting) => setting.key === 'kanka-foundry.campaign');
        await game.settings?.set('kanka-foundry', 'campaign', campaignSetting?.value);
    }
}
