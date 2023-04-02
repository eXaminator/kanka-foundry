import type { HelperDelegate } from 'handlebars';

const helpers = import.meta.glob<true, '', { default: HelperDelegate }>(
    './helpers/!(*.test).ts',
    { eager: true },
);

export default function registerHandlebarsHelpers(): void {
    Object
        .entries(helpers)
        .forEach(([path, helper]) => {
            const name = path.match(/([a-zA-Z0-9]+)\.ts$/)?.[1];
            if (name) Handlebars.registerHelper(name, helper.default);
        });
}

if (import.meta.hot) {
    import.meta.hot.dispose(async () => {
        Object
            .entries(helpers)
            .forEach(([path]) => {
                const name = path.match(/([a-zA-Z0-9]+)\.ts$/)?.[1];
                if (name) Handlebars.unregisterHelper(name);
            });
    });
}
