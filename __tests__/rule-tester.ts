import { RuleTester } from '@typescript-eslint/utils/dist/eslint-utils';

export const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 2018, sourceType: 'module' },
});
