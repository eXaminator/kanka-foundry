/* eslint-disable import/no-extraneous-dependencies */
import { flatten } from 'flat';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { dirname, join, relative } from 'path';
import { Plugin } from 'vite';

export default function translationPlugin(): Plugin {
    let config;
    let server;

    return {
        name: 'yaml-plugin',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        configureServer(_server) {
            server = _server;
        },
        load(id) {
            if (!id.endsWith('.yml')) {
                return null;
            }

            const inputBasePath = dirname(config.build.lib.entry);
            const inputRelativePath = relative(inputBasePath, id);
            const outputRelativePath = inputRelativePath.replace('.yml', '.json');
            const outputPath = join(config.build.outDir, outputRelativePath);

            const content = readFileSync(id, 'utf8');
            const json = flatten(
                yaml.load(content, {
                    schema: yaml.JSON_SCHEMA,
                    filename: id,
                }),
            );
            const jsonContent = JSON.stringify(json, null, 4);

            if (server) {
                mkdirSync(dirname(outputPath), { recursive: true });
                writeFileSync(outputPath, jsonContent);
            } else {
                this.emitFile({
                    type: 'asset',
                    fileName: outputRelativePath,
                    source: jsonContent,
                });
            }

            return 'export default "";';
        },
    };
}
