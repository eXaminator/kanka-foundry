import { getSetting, setSetting } from '../module/settings';

export default async function migrate(): Promise<void> {
    const permissionSetting = getSetting('automaticPermissions') as string;

    if (permissionSetting === 'false') {
        await setSetting('automaticPermissions', 'never');
    } else if (permissionSetting === 'true') {
        await setSetting('automaticPermissions', 'initial');
    } else {
        await setSetting('automaticPermissions', 'never');
    }
}
