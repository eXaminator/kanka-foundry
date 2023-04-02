/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
type MigrateFn = () => Promise<void>;

const migrationModules = import.meta.glob<true, '', { default: MigrateFn }>(
    '../migrations/*.ts',
    { eager: true },
);

export default async function executeMigrations(): Promise<void> {
    for (const key of Object.keys(migrationModules).sort()) {
        await migrationModules[key].default();
    }
}
