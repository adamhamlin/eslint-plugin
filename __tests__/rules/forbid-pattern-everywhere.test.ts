import { TestCaseError } from '@typescript-eslint/utils/dist/ts-eslint';
import dedent from 'dedent';

import { name, rule } from '../../src/rules/forbid-pattern-everywhere';
import { ruleTester } from '../rule-tester';

describe('Rule Tests', () => {
    function getErrors(
        pattern: string,
        line: number,
        column: number,
        endColumn: number
    ): TestCaseError<'disallowedPattern'>[] {
        return [{ messageId: `disallowedPattern`, data: { pattern }, line, column, endColumn }];
    }

    ruleTester.run(name, rule, {
        valid: [
            {
                // No options/patterns specified
                code: dedent`
                    const myVar = 5;
                `,
            },
            {
                // Identifier doesn't match any configured pattern
                code: dedent`
                    const myVar = 5;
                `,
                options: [
                    {
                        patterns: ['Bleep', 'Bloop'],
                    },
                ],
            },
            {
                // Negative lookbehind
                code: dedent`
                    const blah = ctx.dataSources.enrichment.lookup();
                `,
                options: [
                    {
                        patterns: [/(?<!ctx\.)(D|d)ataSource/g],
                    },
                ],
            },
        ],

        invalid: [
            {
                code: dedent`
                    let a = {
                        x: 4
                    };
                `,
                options: [
                    {
                        patterns: ['x'],
                    },
                ],
                errors: getErrors('/x/g', 2, 5, 6),
            },
            {
                code: dedent`
                    const doNotAllowBlahInVarName = 5;
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/g', 1, 17, 21),
            },
            {
                code: dedent`
                    function doNotAllowBlahInFunctionName() {
                        return 'ok';
                    };
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/g', 1, 20, 24),
            },
            {
                code: dedent`
                    function myFunc(doNotAllowBlahInParameterName) {
                        return 'ok';
                    };
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/g', 1, 27, 31),
            },
            {
                code: dedent`
                    function myFunc() {
                        return 'do not allow Blah in string literal';
                    };
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/g', 2, 26, 30),
            },
            {
                code: dedent`
                    const myStr = \`This is a \${type} template literal with BlahBlahBlah\`;
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: [
                    // One error for each instance
                    ...getErrors('/Blah/g', 1, 57, 61),
                    ...getErrors('/Blah/g', 1, 61, 65),
                    ...getErrors('/Blah/g', 1, 65, 69),
                ],
            },
            {
                code: dedent`
                    class DoNotAllowBlahInClassName {
                        constructor(arg) {
                            this.arg = arg;
                        }
                    };
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/g', 1, 17, 21),
            },
            {
                code: dedent`
                    const doNotAllowBlahCaseInsensitive = 5;
                `,
                options: [
                    {
                        patterns: [/BLAH/i],
                    },
                ],
                errors: getErrors('/BLAH/gi', 1, 17, 21),
            },
            {
                // Negative lookbehind (just one error expected)
                code: dedent`
                    const dataSources = ctx.dataSources;
                `,
                options: [
                    {
                        patterns: [/(?<!ctx\.)(D|d)ataSource/],
                    },
                ],
                errors: getErrors('/(?<!ctx\\.)(D|d)ataSource/g', 1, 7, 17),
            },
            {
                code: dedent`
                    // Can't even put Blah in a comment!
                `,
                options: [
                    {
                        patterns: [/Blah/],
                    },
                ],
                errors: getErrors('/Blah/g', 1, 19, 23),
            },
        ],
    });
});
