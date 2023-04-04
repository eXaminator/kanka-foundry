import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';

function getPartialPath(parent, partial) {
    const parentPath = dirname(parent);
    return join(parentPath, `${partial}.partial.hbs`);
}

export default function hbsPlugin() {
    let config;
    let server;

    async function load(id) {
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

        const partialImports = partials.map((partial) => `import ${JSON.stringify(partial)};`).join('\n');

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
            this.emitFile({
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
                return null;
            }

            const promises = modules.map(async (module) => {
                await load(module.id);

                const inputBasePath = dirname(config.build.lib.entry);
                const inputRelativePath = relative(inputBasePath, module.file);
                const url = join(config.base, 'templates', inputRelativePath).replace(/^\//, '');

                server.ws.send({
                    type: 'custom',
                    event: 'update-hbs',
                    data: { file: url },
                });
            });
            await Promise.all(promises);

            return [];
        },
    };
}
