import { flatten } from 'flat';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import yaml from 'js-yaml';
import type { Plugin, ResolvedConfig } from 'vite';
import { HOT_RELOAD_EVENT, type HotReloadPayload } from '../src/dev/hotReloadEvent';

/**
 * Translations are written as YAML in `src/lang` and loaded by Foundry as flat JSON from `lang/<lang>.json` (see
 * module.json). During the build they are emitted as assets. On the dev server they are converted on request by a
 * middleware and changes are pushed to Foundry's own hot reload handling.
 */
export default function translationPlugin(): Plugin {
    let config: ResolvedConfig;
    let inputBasePath: string;

    function toJson(file: string): string {
        const content = readFileSync(file, 'utf8');
        const json = flatten(yaml.load(content, { schema: yaml.JSON_SCHEMA, filename: file }));
        return JSON.stringify(json, null, 4);
    }

    function outputRelativePath(file: string): string {
        return relative(inputBasePath, file).replace(/\.yml$/, '.json');
    }

    return {
        name: 'yaml-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
            const lib = config.build.lib || null;
            if (typeof lib?.entry !== 'string') throw new Error('yaml-plugin requires build.lib.entry to be a string');
            inputBasePath = dirname(lib.entry);
        },
        configureServer(server) {
            const langBaseUrl = `${config.base}lang/`;

            server.middlewares.use((req, res, next) => {
                const pathname = decodeURIComponent((req.url ?? '').split('?')[0]);
                if (!pathname.startsWith(langBaseUrl) || !pathname.endsWith('.json')) return next();

                const file = resolve(inputBasePath, 'lang', pathname.slice(langBaseUrl.length).replace(/\.json$/, '.yml'));
                if (!file.startsWith(inputBasePath + sep) || !existsSync(file)) return next();

                try {
                    const json = toJson(file);
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.end(json);
                } catch (error) {
                    next(error);
                }
            });
        },
        load(id) {
            if (!id.endsWith('.yml')) return null;

            if (config.command === 'build') {
                this.emitFile({
                    type: 'asset',
                    fileName: outputRelativePath(id),
                    source: toJson(id),
                });
            }

            return 'export default "";';
        },
        handleHotUpdate({ server, file, modules }) {
            if (!file.endsWith('.yml')) return undefined;

            if (modules.length > 0) {
                const path = `${config.base}${outputRelativePath(file)}`.replace(/^\//, '');
                server.ws.send({
                    type: 'custom',
                    event: HOT_RELOAD_EVENT,
                    data: { path, extension: 'json', content: toJson(file) } satisfies HotReloadPayload,
                });
            }

            return [];
        },
    };
}
