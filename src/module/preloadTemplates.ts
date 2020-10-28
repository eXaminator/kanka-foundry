export default async function preloadTemplates(): Promise<void> {
    const templatePaths = [
        // Add paths to "modules/kanka-foundry/templates"
    ];

    return loadTemplates(templatePaths);
}
