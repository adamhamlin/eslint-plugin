import { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/create-rule';

export default createRule({
    name: 'no-empty-block-comment',
    meta: {
        type: 'layout',
        messages: {
            nonEmptyBlockComment: 'Block comments must have non-empty content',
        },
        docs: {
            description: 'disallow block comments with empty content',
            recommended: 'error',
            requiresTypeChecking: false,
        },
        fixable: undefined,
        schema: [],
    },
    defaultOptions: [],

    create(context) {
        /**
         * @param comment the comment to check
         * @returns true if the given comment is a block comment that has no content
         */
        function isEmptyBlockComment(comment: TSESTree.Comment): boolean {
            return comment.type === 'Block' && comment.value.split('\n').every((line) => line.match(/^(\s*\*)?\s*$/));
        }

        return {
            Program: (_node) => {
                context
                    .getSourceCode()
                    .getAllComments()
                    .forEach((comment) => {
                        if (isEmptyBlockComment(comment)) {
                            context.report({
                                loc: comment.loc,
                                messageId: 'nonEmptyBlockComment',
                            });
                        }
                    });
            },
        };
    },
});
