export default async function migrate(): Promise<void> {
    const permissionSetting = await game.settings?.get('kanka-foundry', 'automaticPermissions');

    // Don't run the migration if the setting is already a valid value
    if (permissionSetting && ['never', 'initial', 'always'].includes(permissionSetting)) {
        return;
    }

    if ((permissionSetting as string) === 'false') {
        await game.settings?.set('kanka-foundry', 'automaticPermissions', 'never');
    } else if ((permissionSetting as string) === 'true') {
        await game.settings?.set('kanka-foundry', 'automaticPermissions', 'initial');
    } else {
        await game.settings?.set('kanka-foundry', 'automaticPermissions', 'never');
    }
}
