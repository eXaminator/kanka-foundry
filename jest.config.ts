/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
    clearMocks: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/src/types',
        '<rootDir>/src/index.ts',
        '<rootDir>/src/kanka.ts',
        '.d.ts',
    ],
    collectCoverageFrom: ['src/**/*.ts'],
    coverageProvider: 'v8',
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
    setupFiles: ['./src/setupTests.ts'],
};
