import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { KankaSettings } from '../types/KankaSettings';

export function getSetting<T = unknown>(setting: KankaSettings): T {
    logInfo('getSettings', setting);
    return game.settings.get(moduleConfig.name, setting);
}

export async function setSetting<T = unknown>(setting: KankaSettings, value: T): Promise<void> {
    logInfo('setSetting', setting, value);
    await game.settings.set(moduleConfig.name, setting, value);
}
