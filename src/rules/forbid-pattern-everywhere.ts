import { TSESTree } from '@typescript-eslint/types';
import matchAll from 'string.prototype.matchall';

import { createRule } from '../utils/create-rule';
import { FileHelper } from '../utils/file-helper';
import { assertDefined } from '../utils/misc-utils';

export const name = 'forbid-pattern-everywhere';
export const rule = createRule({
    name,
    meta: {
        type: 'layout',
        messages: {
            disallowedPattern: `Text matches the following disallowed pattern: {{pattern}}`,
        },
        docs: {
            description: 'disallow specified patterns everywhere (in identifiers, strings, etc.)',
            recommended: false,
            requiresTypeChecking: false,
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

        const fileHelper = new FileHelper(context.getSourceCode());
        const patternRegexes = options.patterns.map((pattern) => {
            if (pattern instanceof RegExp) {
                // Force this regex to be global
                return pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
            } else {
                return new RegExp(pattern, 'g');
            }
        });

        function enforceForbiddenPatterns(): void {
            for (const regex of patternRegexes) {
                const matches = matchAll(fileHelper.sourceText, regex);
                for (const match of matches) {
                    context.report({
                        loc: getMatchSourceLocation(match),
                        messageId: 'disallowedPattern',
                        data: {
                            pattern: regex.toString(),
                        },
                    });
                }
            }
        }

        function getMatchSourceLocation(match: RegExpMatchArray): Readonly<TSESTree.SourceLocation> {
            const matchText = match[0];
            const startIdx = match.index;
            assertDefined(startIdx); // don't know how this can be undefined if match is defined
            const endIdx = startIdx + matchText.length;

            return {
                start: fileHelper.getPositionFromIndex(startIdx),
                end: fileHelper.getPositionFromIndex(endIdx),
            };
        }

        return {
            Program: (_node) => enforceForbiddenPatterns(),
        };
    },
});

export default { name, rule };
