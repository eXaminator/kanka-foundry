// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        clearMocks: true,
        setupFiles: ['./src/setupTests.ts'],
        globals: true,
        coverage: {
            all: true,
            src: ['./src'],
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
