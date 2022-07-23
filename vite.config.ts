import { resolve } from 'path';
import type { UserConfig } from 'vite';
import hbsPlugin from './build/hbsPlugin';
import translationPlugin from './build/translationPlugin';

const config: UserConfig = {
    root: resolve(__dirname, 'src/dev'),
    publicDir: resolve(__dirname, 'public'),
    base: '/modules/kanka-foundry/',
    server: {
        port: 3000,
        open: false,
        proxy: {
            '^(?!/modules/kanka-foundry)': 'http://localhost/',
            '^/modules/kanka-foundry/lang': 'http://localhost/',
            '^/modules/kanka-foundry/templates': 'http://localhost/',
            '/socket.io': {
                target: 'ws://localhost',
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
