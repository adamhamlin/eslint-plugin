'use strict';

module.exports = {
    extends: ['@adamhamlin/eslint-config', 'plugin:eslint-plugin/recommended'],
    rules: {
        'eslint-plugin/require-meta-docs-description': 'error',
    },
    overrides: [
        {
            files: ['__tests__/**'],
            plugins: ['jest'],
            extends: ['plugin:jest/all'],
            rules: {
                'jest/prefer-expect-assertions': 'off',
                'jest/prefer-lowercase-title': 'off',
                'jest/max-expects': ['error', { max: 8 }],
                'jest/require-hook': 'off',
                'jest/unbound-method': ['error', { ignoreStatic: true }],
                '@typescript-eslint/unbound-method': 'off', // disable in favor of jest/unbound-method
            },
        },
    ],
};
