import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { PluginContext } from 'rollup';
import { Plugin } from 'vite';
function getPartialPath(parent, partial) {
    const parentPath = dirname(parent);
    return join(parentPath, `${partial}.partial.hbs`);
}

export default function hbsPlugin(): Plugin {
    let config;
    let server;

    function load(this: PluginContext | void, id: string) {
        if (!id.endsWith('.hbs')) {
            return null;
        }
        const inputBasePath = dirname(config.build.lib.entry);
        const inputRelativePath = relative(inputBasePath, id);
        const outputRelativePath = join('templates', inputRelativePath);
        const outputPath = join(config.build.outDir, outputRelativePath);
        const outputUrl = join(config.base, outputRelativePath).replace(/^\//, '');
        const content = readFileSync(id).toString('utf-8');

        const partialRegex = /\{\{(#|~)?>(\.[-a-zA-Z0-9/_.]+)([^}]*)}}/g;
        const matches = Array.from(content.matchAll(partialRegex));
        const partials = matches.map(([, , partialPath]) => getPartialPath(id, partialPath));

        const partialImports = partials
            .map(path => relative(dirname(id), path))
            .map(path => (path.startsWith('.') ? path : `./${path}`))
            .map(path => `import ${JSON.stringify(path)};`)
            .join('\n');

        const parsedContent = matches.reduce((content, match) => {
            if (!match[2]) return content;
            const partialPath = relative(inputBasePath, getPartialPath(id, match[2]));
            const partialUrl = join(config.base, 'templates', partialPath).replace(/^\//, '');
            return content.replaceAll(
                new RegExp(`${match[2]}(}| |\n)`, 'g'),
                (all, ending) => `${partialUrl}${ending}`,
            );
        }, content);

        if (server) {
            mkdirSync(dirname(outputPath), { recursive: true });
            writeFileSync(outputPath, parsedContent);
        } else {
            this?.emitFile({
                type: 'asset',
                fileName: outputRelativePath,
                source: parsedContent,
            });
        }

        const fullTemplateUrl = JSON.stringify(outputUrl);

        return `
        ${partialImports};
        Hooks.once('init', () => loadTemplates([${fullTemplateUrl}]));
        export default ${fullTemplateUrl};
        `;
    }

    return {
        name: 'hbs-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        configureServer(_server) {
            server = _server;
        },
        load,
        async handleHotUpdate({ server, file, modules }) {
            // Send event to frontend which can then remove the file from the cache and rerender open apps
            if (!file.endsWith('.hbs')) {
                return undefined;
            }

            const promises = modules.map(async (module) => {
                if (!module.id || !module.file) return;

                load(module.id);

                const inputBasePath = dirname(config.build.lib.entry);
                const inputRelativePath = relative(inputBasePath, module.file);
                const file = join(config.base, 'templates', inputRelativePath).replace(/^\//, '');
                server.hot.send({
                    type: 'custom',
                    event: 'kanka:update-hbs',
                    data: { file },
                });
            });
            await Promise.all(promises);

            return [];
        },
    };
}
