import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import hbsPlugin from './build/hbsPlugin';
import translationPlugin from './build/translationPlugin';
import tailwindcss from '@tailwindcss/vite';

// Environment variables, optionally from a (git ignored) .env.local in the project root. See .env.local.dist.
const env = loadEnv(process.env.NODE_ENV || 'development', __dirname, '');

// Foundry instance the dev server sits in front of. Everything outside of /modules/kanka-foundry is proxied to it.
const foundryUrl = new URL(env.FOUNDRY_URL || 'http://localhost:30000');
const foundryProxy = {
    target: foundryUrl.origin,
    changeOrigin: true,
    autoRewrite: true,
    secure: true,
};

// Public URL when the dev server runs as a Paseo service behind Paseo's proxy (see paseo.json).
const publicUrl = env.PASEO_URL ? new URL(env.PASEO_URL) : undefined;
const publicIsHttps = publicUrl?.protocol === 'https:';

export default defineConfig({
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'public'),
    base: '/modules/kanka-foundry/',
    server: {
        port: 3000,
        open: false,
        allowedHosts: publicUrl ? [publicUrl.hostname] : undefined,
        hmr: publicUrl
            ? {
                  protocol: publicIsHttps ? 'wss' : 'ws',
                  host: publicUrl.hostname,
                  clientPort: Number(publicUrl.port) || (publicIsHttps ? 443 : 80),
              }
            : undefined,
        proxy: {
            '^(?!/modules/kanka-foundry)': foundryProxy,
            '/socket.io': {
                ...foundryProxy,
                target: foundryUrl.origin.replace(/^http/, 'ws'),
                ws: true,
            },
        },
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
        rolldownOptions: {
            output: {
                keepNames: true,
            },
        },
    },
    cacheDir: resolve(__dirname, 'node_modules/.vite'),
    plugins: [
        hbsPlugin(),
        translationPlugin(),
        tailwindcss(),
    ],
    test: {
        clearMocks: true,
        setupFiles: ['./src/setupTests.ts'],
        root: resolve(__dirname, 'src'),
        globals: true,
        coverage: {
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
