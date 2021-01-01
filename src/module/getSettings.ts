import { logInfo } from '../logger';
import moduleConfig from '../module.json';
import { KankaSettings } from '../types/KankaSettings';

export default function getSettings<T = unknown>(setting: KankaSettings): T {
    logInfo('getSettings', setting);
    return game.settings.get(moduleConfig.name, setting);
}
