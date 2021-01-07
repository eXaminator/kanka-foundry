import moduleConfig from '../module.json';

export default async function preloadTemplates(): Promise<void> {
    const templatePaths = [
        `modules/${moduleConfig.name}/templates/journalEntry.html`,
        `modules/${moduleConfig.name}/templates/entityList.html`,
        `modules/${moduleConfig.name}/templates/kankaBrowser.html`,
    ];

    return loadTemplates(templatePaths);
}
