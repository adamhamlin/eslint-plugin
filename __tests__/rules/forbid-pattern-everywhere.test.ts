import { TestCaseError } from '@typescript-eslint/utils/dist/ts-eslint';
import dedent from 'dedent';

import { name, rule } from '../../src/rules/forbid-pattern-everywhere';
import { ruleTester } from '../rule-tester';

describe('Rule Tests', () => {
    function getErrors(pattern: string): TestCaseError<'disallowedPattern'>[] {
        return [{ messageId: `disallowedPattern`, data: { pattern } }];
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
        ],

        invalid: [
            {
                code: dedent`
                    const doNotAllowBlahInVarName = 5;
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/'),
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
                errors: getErrors('/Blah/'),
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
                errors: getErrors('/Blah/'),
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
                errors: getErrors('/Blah/'),
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
                errors: getErrors('/Blah/'),
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
                errors: getErrors('/Blah/'),
            },
            {
                code: dedent`
                class MyClass {
                    constructor(arg) {
                        this.doNotAllowBlahInMemberVar = arg;
                    }
                };
            `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/'),
            },
            {
                code: dedent`
                    const myObj = {
                        doNotAllowBlahInPropertyName: 'myValue'
                    };
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/'),
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
                errors: getErrors('/BLAH/i'),
            },
            {
                code: dedent`
                    interface BlahInterface {
                        someProp: string;
                    }
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/'),
            },
            {
                code: dedent`
                    type BlahType = {
                        someProp: string;
                    };
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/'),
            },
            {
                code: dedent`
                    interface MyInterface {
                        someBlahProp: string;
                    }
                `,
                options: [
                    {
                        patterns: ['Blah'],
                    },
                ],
                errors: getErrors('/Blah/'),
            },
        ],
    });
});
