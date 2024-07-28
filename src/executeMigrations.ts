import { showError, showInfo } from "./foundry/notifications";
import { getSetting, setSetting } from "./foundry/settings";
import getMessage from './foundry/getMessage';

type MigrateFn = () => Promise<void>;

const migrationModules = import.meta.glob<true, '', { default: MigrateFn }>('./migrations/*.ts', { eager: true });
const sortedMigrationModuleNames = Object.keys(migrationModules).sort();

function getMigrationVersionFromModuleName(moduleName: string) {
    return moduleName.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '';
}

export default async function executeMigrations(): Promise<void> {
    const currentMigrationVersion = getSetting('migrationVersion');
    const newestMigrationVersion = getLatestMigrationVersion();

    const relevantMigrations = sortedMigrationModuleNames
        .filter(key => {
            const version = getMigrationVersionFromModuleName(key);
            const isSpecialCase = [version, currentMigrationVersion, newestMigrationVersion].every(v => v === '2024-07-29');
            return version > currentMigrationVersion || isSpecialCase;
        });

    if (relevantMigrations.length === 0) return;

    try {
        showInfo('migration.started');

        for (const key of relevantMigrations) {
            const version = getMigrationVersionFromModuleName(key);
            // Add special case for migration 2024-07-29 because it was the first migration at which the migrationVersion setting was introduced
            // This special case checks whether this migration is set as last executed (which might be due to the default value of the setting)
            // but it needs to be executed at least once. To make sure it is executed only once, the saved recent setting will be set to one day later.
            const isSpecialCase = version === currentMigrationVersion;

            await migrationModules[key].default();

            if (isSpecialCase) {
                await setSetting('migrationVersion', '2024-07-30');
            } else {
                await setSetting('migrationVersion', version);
            }
        }

        showInfo('migration.finished');
    } catch (error) {
        showError('migration.failed', { error: (error as Error).message });
    }

}

export function getLatestMigrationVersion() {
    return getMigrationVersionFromModuleName(sortedMigrationModuleNames[sortedMigrationModuleNames.length - 1]);
}
