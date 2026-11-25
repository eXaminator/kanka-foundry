import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { HOT_RELOAD_EVENT, type HotReloadPayload } from '../src/dev/hotReloadEvent';

function getPartialPath(parent: string, partial: string) {
    const parentPath = dirname(parent);
    return join(parentPath, `${partial}.partial.hbs`);
}

interface ProcessedTemplate {
    /** Path relative to the build output, e.g. `templates/apps/foo.hbs` */
    outputRelativePath: string;
    /** URL without leading slash as used by Foundry, e.g. `modules/kanka-foundry/templates/apps/foo.hbs` */
    url: string;
    partials: string[];
    content: string;
}

/**
 * Templates are loaded by Foundry via `getTemplate()`, which fetches them from the module URL. During the build they are
 * emitted as assets. On the dev server they are served from source by a middleware (so nothing needs to be written into
 * the Foundry module directory) and template changes are pushed to Foundry's own hot reload handling.
 */
export default function hbsPlugin(): Plugin {
    let config: ResolvedConfig;
    let inputBasePath: string;

    function processTemplate(id: string): ProcessedTemplate {
        const inputRelativePath = relative(inputBasePath, id);
        const outputRelativePath = join('templates', inputRelativePath);
        const url = join(config.base, outputRelativePath).replace(/^\//, '');
        const content = readFileSync(id).toString('utf-8');

        const partialRegex = /\{\{(#|~)?>(\.[-a-zA-Z0-9/_.]+)([^}]*)}}/g;
        const matches = Array.from(content.matchAll(partialRegex));
        const partials = matches.map(([, , partialPath]) => getPartialPath(id, partialPath));

        const parsedContent = matches.reduce((content, match) => {
            if (!match[2]) return content;
            const partialPath = relative(inputBasePath, getPartialPath(id, match[2]));
            const partialUrl = join(config.base, 'templates', partialPath).replace(/^\//, '');
            return content.replaceAll(
                new RegExp(`${match[2]}(}| |\n)`, 'g'),
                (_all, ending) => `${partialUrl}${ending}`,
            );
        }, content);

        return { outputRelativePath, url, partials, content: parsedContent };
    }

    return {
        name: 'hbs-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
            const lib = config.build.lib || null;
            if (typeof lib?.entry !== 'string') throw new Error('hbs-plugin requires build.lib.entry to be a string');
            inputBasePath = dirname(lib.entry);
        },
        configureServer(server) {
            const templateBaseUrl = `${config.base}templates/`;

            server.middlewares.use((req, res, next) => {
                const pathname = decodeURIComponent((req.url ?? '').split('?')[0]);
                if (!pathname.startsWith(templateBaseUrl) || !pathname.endsWith('.hbs')) return next();

                const file = resolve(inputBasePath, pathname.slice(templateBaseUrl.length));
                if (!file.startsWith(inputBasePath + sep)) return next();

                try {
                    const { content } = processTemplate(file);
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.end(content);
                } catch {
                    next();
                }
            });
        },
        load(id) {
            if (!id.endsWith('.hbs')) return null;

            const { outputRelativePath, url, partials, content } = processTemplate(id);

            if (config.command === 'build') {
                this.emitFile({
                    type: 'asset',
                    fileName: outputRelativePath,
                    source: content,
                });
            }

            const partialImports = partials
                .map((path) => relative(dirname(id), path))
                .map((path) => (path.startsWith('.') ? path : `./${path}`))
                .map((path) => `import ${JSON.stringify(path)};`)
                .join('\n');

            const fullTemplateUrl = JSON.stringify(url);

            return `
            ${partialImports};
            Hooks.once('init', () => loadTemplates([${fullTemplateUrl}]));
            export default ${fullTemplateUrl};
            `;
        },
        handleHotUpdate({ server, file, modules }) {
            if (!file.endsWith('.hbs')) return undefined;

            if (modules.length > 0) {
                const { url, content } = processTemplate(file);
                server.ws.send({
                    type: 'custom',
                    event: HOT_RELOAD_EVENT,
                    data: { path: url, extension: 'hbs', content } satisfies HotReloadPayload,
                });
            }

            // The template module itself only exports the URL, so there is nothing for Vite to update.
            return [];
        },
    };
}
