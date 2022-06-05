import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';

function getPartialPath(parent, partial) {
    const parentPath = dirname(parent);
    return join(parentPath, `${partial}.partial.hbs`);
}

export default function hbsPlugin() {
    let config;
    let server;

    return {
        name: 'hbs-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        configureServer(_server) {
            server = _server;
        },
        async load(id) {
            if (!id.endsWith('.hbs')) {
                return null;
            }

            const inputBasePath = dirname(config.build.lib.entry);
            const inputRelativePath = relative(inputBasePath, id);
            const outputRelativePath = join('templates', inputRelativePath);
            const outputPath = join(config.build.outDir, outputRelativePath);
            const outputUrl = join(config.base, outputRelativePath).replace(/^\//, '');
            const content = readFileSync(id).toString('utf-8');

            const partialRegex = /\{\{>([-a-zA-Z0-9/_.]+)([^}]*)}}/g;
            const matches = Array.from(content.matchAll(partialRegex));
            const partials = matches.map(([, partialPath]) => getPartialPath(id, partialPath));
            // if (this.addWatchFile) partials.forEach((partial) => this.addWatchFile(partial));

            const partialImports = partials
                .map((partial) => `import ${JSON.stringify(partial)};`)
                .join('\n');

            const parsedContent = content.replaceAll(partialRegex, (all, p1, p2) => {
                const partialPath = relative(inputBasePath, getPartialPath(id, p1));
                const partialUrl = join(config.base, 'templates', partialPath).replace(/^\//, '');
                return `{{>${partialUrl}${p2}}}`;
            });

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
        },
        async handleHotUpdate({ server, file, modules }) {
            // Send event to frontend which can then remove the file from the cache and rerender open apps
            if (!file.endsWith('.hbs')) {
                return null;
            }

            const promises = modules.map(async (module) => {
                await this.load(module.id);

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
