module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.js$': [
            'esbuild-jest',
            {
                jsxFactory: 'h',
                jsxFragment: 'Fragment',
                sourcemap: true,
                loaders: {
                    '.test.js': 'jsx',
                    '.js': 'jsx',
                },
            }
        ]
    },
    transformIgnorePatterns: [
        '!node_modules/'
    ],
    testMatch: [
        '<rootDir>/src/**/*.test.js'
    ],
    reporters: [
        'default',
        ['jest-html-reporters', { 'publicPath': 'dist/test-reports', 'filename': 'report.html' }]
    ],
    moduleNameMapper: {
        //'^@testing-library/preact$': '<rootDir>/../../node_modules/@testing-library/preact/dist/cjs/index.js'
    },
};
