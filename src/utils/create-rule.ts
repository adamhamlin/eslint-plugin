import { ESLintUtils } from '@typescript-eslint/utils';

import { version } from '../../package.json';

// Create rule function
export const createRule = ESLintUtils.RuleCreator(
    (ruleName) => `https://github.com/adamhamlin/eslint-plugin/blob/v${version}/docs/rules/${ruleName}.md`
);
