import { setSetting } from '../foundry/settings';
import getGame from '../foundry/getGame';

// Migrate global Kanka access key setting to local setting
export default async function migrate(): Promise<void> {
    const game = getGame();
    const accessKeySetting = game.settings.storage.get('world')?.find(setting => setting.key === 'kanka-foundry.accessToken');
    const accessKey = accessKeySetting?.value;

    if (game.user?.isGM && accessKey) {
        setSetting('accessToken', accessKey);
        await accessKeySetting.delete();

        const campaignSetting = game.settings.storage.get('world')?.find(setting => setting.key === 'kanka-foundry.campaign');
        setSetting('campaign', campaignSetting?.value);
    }
}
