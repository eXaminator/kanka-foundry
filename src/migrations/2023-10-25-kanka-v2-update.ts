import { showInfo } from '../foundry/notifications';
import { logInfo } from '../util/logger';

// Migrate to new Kanka-URL if the new one is available
export default async function migrate(): Promise<void> {
    const baseUrlSetting = game.settings?.storage
        .get('world')
        ?.find((setting) => setting.key === 'kanka-foundry.baseUrl');
    const baseUrl = baseUrlSetting?.value ?? 'https://kanka.io';

    logInfo('Check for v2 migration...', { baseUrl });

    // Only run this migration if the user has no custom Kanka url or if the manually set URL is the official Kanka url.
    if (!game.user?.isGM || !/^https:\/\/kanka.io/.test(baseUrl)) {
        return;
    }

    logInfo('Update the baseUrl config...');
    await game.settings?.set('kanka-foundry', 'baseUrl', 'https://api.kanka.io');
    showInfo('migration.migrated-v2');

    logInfo('V2 migration done!');
}
