import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import hbsPlugin from './build/hbsPlugin';
import translationPlugin from './build/translationPlugin';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'public'),
    base: '/modules/kanka-foundry/',
    server: {
        port: 3000,
        open: false,
        proxy: {
            '^(?!/modules/kanka-foundry)': 'http://localhost:30000/',
            '^/modules/kanka-foundry/lang/.+\.json': 'http://localhost:30000/',
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
        translationPlugin(),
    ],
    test: {
        clearMocks: true,
        setupFiles: ['./src/setupTests.ts'],
        root: resolve(__dirname, 'src'),
        globals: true,
        coverage: {
            all: true,
            exclude: [
                'types/**',
                'index.ts',
                'kanka.ts',
                '**/*.d.ts',
                '**/*.test.ts',
                '**/__mocks__/**',
                'dev/**',
            ],
        },
    },
});
