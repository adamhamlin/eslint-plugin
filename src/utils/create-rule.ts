import { ESLintUtils } from '@typescript-eslint/utils';

// Create rule function
export const createRule = ESLintUtils.RuleCreator(
    (ruleName) => `https://github.com/adamhamlin/eslint-plugin/docs/rules/${ruleName}.md`
);
