import { setSetting } from '../foundry/settings';
import getGame from '../foundry/getGame';
import { logInfo } from '../util/logger';
import { showInfo } from '../foundry/notifications';

// Migrate to new Kanka-URL if the new one is available
export default async function migrate(): Promise<void> {
    const game = getGame();
    const baseUrlSetting = game.settings.storage.get('world')?.find(setting => setting.key === 'kanka-foundry.baseUrl');
    const baseUrl = baseUrlSetting?.value ?? 'https://kanka.io';

    logInfo('Check for v2 migration...', { baseUrl });

    // Only run this migration if the user has no custom Kanka url or if the manually set URL is the official Kanka url.
    if (!game.user?.isGM || !/^https:\/\/kanka.io/.test(baseUrl)) {
        return;
    }

    try {
        // Test if the old URL is still available...
        const response = await fetch('https://kanka.io/api/1.0/campaigns');

        // We expect a 401 since we didn't pass in any token, if we get anything else we assume the
        // old URL is no longer available
        if (response.status !== 401) throw new Error();
        logInfo('Nothing to do!');
    } catch {
        // ...if not, we update the config
        logInfo('Update the baseUrl config...');
        await setSetting('baseUrl', 'https://api.kanka.io');
        showInfo('migration.migrated-v2');
    }

    logInfo('V2 migration done!');
}
