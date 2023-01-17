import { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/create-rule';

export const name = 'forbid-pattern-everywhere';
export const rule = createRule({
    name,
    meta: {
        type: 'layout',
        messages: {
            disallowedPattern: `Entity matches the following disallowed pattern: {{pattern}}`,
        },
        docs: {
            description: 'disallow specified patterns everywhere (in identifiers, strings, etc.)',
            recommended: false,
            requiresTypeChecking: true,
        },
        fixable: undefined,
        schema: [
            {
                type: 'object',
                properties: {
                    patterns: {
                        type: 'array',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [{ patterns: [] as Array<RegExp | string> }],

    create(context, optionsWithDefault) {
        const options = optionsWithDefault[0];

        const patternRegexes = options.patterns.map((pattern) => {
            return pattern instanceof RegExp ? pattern : new RegExp(pattern);
        });

        /**
         * @param entity the name/string literal/etc to chek
         * @param loc the location of the AST node
         */
        function checkIfEntityIsAllowed(
            entity: string | TSESTree.Literal['value'],
            loc: TSESTree.SourceLocation
        ): void {
            if (typeof entity === 'string') {
                for (const regex of patternRegexes) {
                    if (regex.test(entity)) {
                        context.report({
                            loc,
                            messageId: 'disallowedPattern',
                            data: {
                                pattern: regex.toString(),
                            },
                        });
                        break;
                    }
                }
            }
        }

        return {
            // NOTE: Using `Identifier` is probably overkill, since only need to check when identifiers are declared/imported/etc, not every usage. But
            // this is simpler/more maintainable as don't have to enumerate a bunch more node types. Re-evaluate if performance negatively impacted.
            Identifier: (node) => {
                checkIfEntityIsAllowed(node.name, node.loc);
            },
            Literal: (node) => {
                checkIfEntityIsAllowed(node.value, node.loc);
            },
            TemplateElement: (node) => {
                checkIfEntityIsAllowed(node.value.cooked, node.loc);
            },
        };
    },
});

export default { name, rule };
