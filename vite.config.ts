import { resolve } from 'path';
import type { UserConfig } from 'vite';
import hbsPlugin from './build/hbsPlugin';
import translationPlugin from './build/translationPlugin';

const config: UserConfig = {
    root: resolve(__dirname, 'src/devServer'),
    publicDir: resolve(__dirname, 'public'),
    base: '/modules/kanka-foundry/',
    server: {
        port: 3000,
        open: false,
        proxy: {
            '^(?!/modules/kanka-foundry)': 'http://localhost:30000/',
            '^/modules/kanka-foundry/lang': 'http://localhost:30000/',
            '^/modules/kanka-foundry/templates': 'http://localhost:30000/',
            '/socket.io': {
                target: 'ws://localhost:30000',
                ws: true,
            },
        },
    },
    esbuild: {
        keepNames: true,
    },
    build: {
        outDir: resolve(__dirname, 'dist'),
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            name: 'kanka-foundry',
            entry: resolve(__dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: () => 'index.js',
        },
    },
    plugins: [
        hbsPlugin(),
        translationPlugin('./src/lang', './dist/lang'),
    ],
};

export default config;
