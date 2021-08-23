import type KankaFoundry from '../KankaFoundry';
import { AutomaticPermissionValue } from '../module/KankaFoundrySettings';
import { KankaSettings } from '../types/KankaSettings';

export default async function migrateV3(module: KankaFoundry): Promise<void> {
    const permissionSetting = module.game.settings.get(module.name, KankaSettings.automaticPermissions) as string;

    if (permissionSetting === 'false') {
        module.game.settings.set(module.name, KankaSettings.automaticPermissions, AutomaticPermissionValue.never);
    } else if (permissionSetting === 'true') {
        module.game.settings.set(module.name, KankaSettings.automaticPermissions, AutomaticPermissionValue.initial);
    } else if (!AutomaticPermissionValue[permissionSetting]) {
        module.game.settings.set(module.name, KankaSettings.automaticPermissions, AutomaticPermissionValue.never);
    }
}
