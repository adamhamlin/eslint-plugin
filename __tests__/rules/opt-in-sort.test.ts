import { TestCaseError } from '@typescript-eslint/utils/dist/ts-eslint';
import dedent from 'dedent';

import { name, rule } from '../../src/rules/opt-in-sort';
import { ruleTester } from '../rule-tester';

describe('Rule Tests', () => {
    // NOTE: Pattern-matching to make testing in isolation easier. Add specific regexes
    // below as desired for troubleshooting
    const testPatternsToMatch: RegExp[] = [];

    function filterTests<T extends { code: string }>(testCases: T[]): T[] {
        return testCases.filter((test) => {
            return testPatternsToMatch.length === 0 || testPatternsToMatch.some((pattern) => pattern.test(test.code));
        });
    }

    function getErrors(entityType: string, expected: string, actual: string): TestCaseError<'unsortedKeysOrValues'>[] {
        return [{ messageId: 'unsortedKeysOrValues', data: { entityType, expected, actual } }];
    }

    // Simple helper to build code block from list of lines.
    // This is needed to get proper parsing of template literals w/ expressions
    function buildLines(lines: string[]): string {
        return lines.join('\n');
    }

    ruleTester.run(name, rule, {
        valid: filterTests([
            {
                code: dedent`
                    // Basic coverage for no annotations
                    const myObj = {
                        b: '',
                        a: '',
                        c: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Basic keys and values
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        d: [
                            'apple',
                            'banana',
                            'cherry',
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Nested objects, with nested overrides (using option 'reverse')
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        d: {
                            e: '',
                            f: '',
                            g: '',
                            // @sort:reverse
                            h: {
                                k: '',
                                j: '',
                                i: '',
                            }
                        }
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'none'
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        // @sort:none
                        d: {
                            f: '',
                            g: '',
                            e: '',
                        }
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'shallow'
                    // @sort:shallow
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        d: {
                            f: '',
                            e: '',
                            g: '',
                        }
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'none' and 'shallow'
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        // @sort:none:shallow
                        d: {
                            f: '',
                            g: '',
                            e: '',
                            h: {
                                i: '',
                                j: '',
                                k: ''
                            }
                        }
                    };
                `,
            },
            {
                code: dedent`
                    // Case insensitive, but uppercase first, numeric order respected
                    // @sort
                    const myObj = {
                        1: '',
                        2: '',
                        10: '',
                        A: '',
                        a: '',
                        B: '',
                        b: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'keys'
                    // @sort:keys
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        d: [
                            'banana',
                            'apple',
                            'cherry',
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'values'
                    // @sort:values
                    const myObj = {
                        b: '',
                        a: '',
                        c: '',
                        d: [
                            'apple',
                            'banana',
                            'cherry',
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Using programmatic keys, non-literal array values
                    const keyA = 'a';
                    const keyB = 'b';
                    const APPLE = 'zzz_apple';
                    const BANANA = 'aaa_banana'
                    // @sort
                    const myObj = {
                        [keyA]: '',
                        [keyB]: [
                            APPLE,
                            BANANA,
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Using long member expressions
                    const ref = {
                        a1: {
                            b1: {
                                c1: {
                                    key: 'myKey',
                                    val: 'myValue'
                                },
                                c2: {
                                    key: 'myOtherKey',
                                }
                            },
                            b2: {
                                val: 'myValue'
                            }
                        }
                    };
                    // @sort
                    const myObj = {
                        [ref.a1.b1.c1.key]: '',
                        [ref.a1.b1.c2.key]: [
                            ref.a1.b1.c1.val,
                            ref.a1.b2.val,
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Sort enum
                    // @sort
                    enum MyEnum {
                        A = 'a',
                        B = 'b',
                        C = 'c',
                    }
                `,
            },
            {
                code: dedent`
                    // Sort union
                    // @sort
                    type MyUnion = 'a' | 'b' | 'c';
                `,
            },
            {
                code: dedent`
                    // Sort union with type references
                    type A = 'a';
                    type B = 'b';
                    type C = 'c';
                    // @sort
                    type MyUnion = A | B | C;
                `,
            },
            {
                code: dedent`
                    // Sort interface
                    // @sort
                    interface MyInterface {
                        a: string;
                        b: string;
                        c: string;
                    }
                `,
            },
            {
                code: dedent`
                    // Sort type literal
                    // @sort
                    type MyTypeLiteral = {
                        a: string;
                        b: string;
                        c: string;
                    };
                `,
            },
            {
                code: dedent`
                    // Sort keys constructed from template literals
                    // @sort
                    const a = 'a';
                    const b = 'b';
                    const myObj = {
                        [\`cool-dude-\${a}\`]: '',
                        [\`cool-dude-\${b}\`]: '',
                        [\`not-cool-dude-\${a}-first\`]: '',
                        [\`not-cool-dude-\${a}-second\`]: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Sort values including primitives and "unsortable" types
                    // @sort
                    const myArray = [
                        /^hi/g, 1, 2, '3', false, null, undefined, {}, []
                    ];
                `,
            },
        ]),

        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////

        invalid: filterTests([
            {
                code: dedent`
                    // Basic keys
                    // @sort
                    const myObj = {
                        a: '',
                        c: '',
                        b: '',
                    };
                `,
                errors: getErrors('Object keys', 'b', 'c'),
                output: dedent`
                    // Basic keys
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Basic values
                    // @sort
                    const myValues = [
                        'banana',
                        'apple',
                        'cherry',
                    ],
                `,
                errors: getErrors('Array values', 'apple', 'banana'),
                output: dedent`
                    // Basic values
                    // @sort
                    const myValues = [
                        'apple',
                        'banana',
                        'cherry',
                    ],
                `,
            },
            {
                code: dedent`
                    // Nested objects
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        d: {
                            f: '',
                            e: '',
                            g: '',
                        }
                    };
                `,
                errors: getErrors('Object keys', 'e', 'f'),
                output: dedent`
                    // Nested objects
                    // @sort
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                        d: {
                            e: '',
                            f: '',
                            g: '',
                        }
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'none', then overriding
                    // @sort:none
                    const myObj = {
                        b: '',
                        a: '',
                        c: '',
                        // @sort
                        d: {
                            f: '',
                            g: '',
                            e: '',
                        }
                    };
                `,
                errors: getErrors('Object keys', 'e', 'f'),
                output: dedent`
                    // Using option 'none', then overriding
                    // @sort:none
                    const myObj = {
                        b: '',
                        a: '',
                        c: '',
                        // @sort
                        d: {
                            e: '',
                            f: '',
                            g: '',
                        }
                    };
                `,
            },
            {
                code: dedent`
                    // Case insensitive, but uppercase first, numeric order respected
                    // @sort
                    const myObj = {
                        1: '',
                        10: '',
                        2: '',
                        A: '',
                        a: '',
                        B: '',
                        b: '',
                    };
                `,
                errors: getErrors('Object keys', '2', '10'),
                output: dedent`
                    // Case insensitive, but uppercase first, numeric order respected
                    // @sort
                    const myObj = {
                        1: '',
                        2: '',
                        10: '',
                        A: '',
                        a: '',
                        B: '',
                        b: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'keys'
                    // @sort:keys
                    const myObj = {
                        c: '',
                        b: '',
                        a: '',
                    };
                `,
                errors: getErrors('Object keys', 'a', 'c'),
                output: dedent`
                    // Using option 'keys'
                    // @sort:keys
                    const myObj = {
                        a: '',
                        b: '',
                        c: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Using option 'values'
                    // @sort:values
                    const myObj = {
                        b: '',
                        a: '',
                        c: '',
                        d: [
                            'cherry',
                            'apple',
                            'banana',
                        ],
                    };
                `,
                errors: getErrors('Array values', 'apple', 'cherry'),
                output: dedent`
                    // Using option 'values'
                    // @sort:values
                    const myObj = {
                        b: '',
                        a: '',
                        c: '',
                        d: [
                            'apple',
                            'banana',
                            'cherry',
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Using programmatic keys
                    const keyA = 'a';
                    const keyB = 'b';
                    // @sort
                    const myObj = {
                        [keyB]: '',
                        [keyA]: '',
                    };
                `,
                errors: getErrors('Object keys', 'keyA', 'keyB'),
                output: dedent`
                    // Using programmatic keys
                    const keyA = 'a';
                    const keyB = 'b';
                    // @sort
                    const myObj = {
                        [keyA]: '',
                        [keyB]: '',
                    };
                `,
            },
            {
                code: dedent`
                    // Using non-literal array values
                    const APPLE = 'zzz_apple';
                    const BANANA = 'aaa_banana'
                    // @sort
                    const myArray = [
                        BANANA,
                        APPLE,
                    ];
                `,
                errors: getErrors('Array values', 'APPLE', 'BANANA'),
                output: dedent`
                    // Using non-literal array values
                    const APPLE = 'zzz_apple';
                    const BANANA = 'aaa_banana'
                    // @sort
                    const myArray = [
                        APPLE,
                        BANANA,
                    ];
                `,
            },
            {
                code: dedent`
                    // Using long member expressions
                    const ref = {
                        a1: {
                            b1: {
                                c1: {
                                    key: 'myKey',
                                    val: 'myValue'
                                },
                                c2: {
                                    key: 'myOtherKey',
                                }
                            },
                            b2: {
                                val: 'myValue'
                            }
                        }
                    };
                    // @sort
                    const myObj = {
                        [ref.a1.b1.c2.key]: [
                            ref.a1.b2.val,
                            ref.a1.b1.c1.val,
                        ],
                        [ref.a1.b1.c1.key]: '',
                    };
                `,
                errors: [
                    ...getErrors('Object keys', 'ref.a1.b1.c1.key', 'ref.a1.b1.c2.key'),
                    ...getErrors('Array values', 'ref.a1.b1.c1.val', 'ref.a1.b2.val'),
                ],
                // NOTE: Only the first error will be fixed
                output: dedent`
                    // Using long member expressions
                    const ref = {
                        a1: {
                            b1: {
                                c1: {
                                    key: 'myKey',
                                    val: 'myValue'
                                },
                                c2: {
                                    key: 'myOtherKey',
                                }
                            },
                            b2: {
                                val: 'myValue'
                            }
                        }
                    };
                    // @sort
                    const myObj = {
                        [ref.a1.b1.c1.key]: '',
                        [ref.a1.b1.c2.key]: [
                            ref.a1.b2.val,
                            ref.a1.b1.c1.val,
                        ],
                    };
                `,
            },
            {
                code: dedent`
                    // Sort enum
                    // @sort
                    enum MyEnum {
                        B = 'b',
                        A = 'a',
                        C = 'c',
                    }
                `,
                errors: getErrors('Enum values', 'A', 'B'),
                output: dedent`
                    // Sort enum
                    // @sort
                    enum MyEnum {
                        A = 'a',
                        B = 'b',
                        C = 'c',
                    }
                `,
            },
            {
                code: dedent`
                    // Sort union
                    // @sort
                    type MyUnion = 'b' | 'c' | 'a';
                `,
                errors: getErrors('Union values', 'a', 'b'),
                output: dedent`
                    // Sort union
                    // @sort
                    type MyUnion = 'a' | 'b' | 'c';
                `,
            },
            {
                code: dedent`
                    // Sort union with type references
                    type A = 'a';
                    type B = 'b';
                    type C = 'c';
                    // @sort
                    type MyUnion = B | A | C;
                `,
                errors: getErrors('Union values', 'A', 'B'),
                output: dedent`
                    // Sort union with type references
                    type A = 'a';
                    type B = 'b';
                    type C = 'c';
                    // @sort
                    type MyUnion = A | B | C;
                `,
            },
            {
                code: dedent`
                    // Sort interface
                    // @sort
                    interface MyInterface {
                        b: string;
                        a: string;
                        c: string;
                    }
                `,
                errors: getErrors('Interface keys', 'a', 'b'),
                output: dedent`
                    // Sort interface
                    // @sort
                    interface MyInterface {
                        a: string;
                        b: string;
                        c: string;
                    }
                `,
            },
            {
                code: dedent`
                    // Sort type literal
                    // @sort
                    type MyTypeLiteral = {
                        b: string;
                        a: string;
                        c: string;
                    };
                `,
                errors: getErrors('Type literal keys', 'a', 'b'),
                output: dedent`
                    // Sort type literal
                    // @sort
                    type MyTypeLiteral = {
                        a: string;
                        b: string;
                        c: string;
                    };
                `,
            },
            {
                code: buildLines([
                    '// Sort keys constructed from template literals',
                    'const a = 1;',
                    'const b = 1;',
                    '// @sort',
                    'const myObj = {',
                    '    [`not-cool-dude-${a}-first`]: 1,',
                    '    [`cool-dude-${b}`]: 1,',
                    '    [`not-cool-dude-${a}-second`]: 1,',
                    '    [`cool-dude-${a}`]: 1,',
                    '};',
                ]),
                errors: getErrors('Object keys', 'cool-dude-${a}', 'not-cool-dude-${a}-first'),
                output: buildLines([
                    '// Sort keys constructed from template literals',
                    'const a = 1;',
                    'const b = 1;',
                    '// @sort',
                    'const myObj = {',
                    '    [`cool-dude-${a}`]: 1,',
                    '    [`cool-dude-${b}`]: 1,',
                    '    [`not-cool-dude-${a}-first`]: 1,',
                    '    [`not-cool-dude-${a}-second`]: 1,',
                    '};',
                ]),
            },
            {
                code: buildLines([
                    '// Combination of template literals and member expressions',
                    'const a = 1;',
                    'const b = 1;',
                    '// @sort',
                    'const myArr = [',
                    '    `my.template.literal.${b}`,',
                    '    `my.template.literal.${a}`,',
                    '    some.other.member.expression,',
                    '    my.member.expression,',
                    '];',
                ]),
                errors: getErrors('Array values', 'my.member.expression', 'my.template.literal.${b}'),
                output: buildLines([
                    '// Combination of template literals and member expressions',
                    'const a = 1;',
                    'const b = 1;',
                    '// @sort',
                    'const myArr = [',
                    '    my.member.expression,',
                    '    `my.template.literal.${a}`,',
                    '    `my.template.literal.${b}`,',
                    '    some.other.member.expression,',
                    '];',
                ]),
            },
            {
                code: buildLines([
                    '// Template literals with unsortable expressions',
                    'const a = 1;',
                    'const b = 1;',
                    '// @sort',
                    'const myArr = [',
                    '    `my.template.literal.${a}`,',
                    '    `my.template.literal.${b ? b : a}`,',
                    '];',
                ]),
                errors: getErrors(
                    'Array values',
                    'my.template.literal.${<Unsortable type: ConditionalExpression>}',
                    'my.template.literal.${a}'
                ),
                output: buildLines([
                    '// Template literals with unsortable expressions',
                    'const a = 1;',
                    'const b = 1;',
                    '// @sort',
                    'const myArr = [',
                    '    `my.template.literal.${b ? b : a}`,',
                    '    `my.template.literal.${a}`,',
                    '];',
                ]),
            },
            {
                code: dedent`
                    // Sort values including primitives and "unsortable" types
                    // @sort
                    const myArray = [
                        {}, 2, '3', null, 1, undefined, false, [], /^hi/g
                    ];
                `,
                errors: getErrors('Array values', '/^hi/g', '<Unsortable type: ObjectExpression>'),
                output: dedent`
                    // Sort values including primitives and "unsortable" types
                    // @sort
                    const myArray = [
                        /^hi/g, 1, 2, '3', false, null, undefined, {}, []
                    ];
                `,
            },
            {
                code: dedent`
                    // Sparse arrays OK
                    // @sort
                    const myArray = [
                        4,,1,2,,3
                    ];
                `,
                errors: getErrors('Array values', '1', '4'),
                output: dedent`
                    // Sparse arrays OK
                    // @sort
                    const myArray = [
                        1,,2,3,,4
                    ];
                `,
            },
            {
                code: dedent`
                    // Comment content after the annotation ok
                    // @sort (blah blah sort blah)
                    const myArray = [
                        1,3,2
                    ];
                `,
                errors: getErrors('Array values', '2', '3'),
                output: dedent`
                    // Comment content after the annotation ok
                    // @sort (blah blah sort blah)
                    const myArray = [
                        1,2,3
                    ];
                `,
            },
            {
                code: dedent`
                    /**
                     * Annotation can appear on any line in block comment
                     * @sort
                     * More comment
                     */
                    const myArray = [
                        1,3,2
                    ];
                `,
                errors: getErrors('Array values', '2', '3'),
                output: dedent`
                    /**
                     * Annotation can appear on any line in block comment
                     * @sort
                     * More comment
                     */
                    const myArray = [
                        1,2,3
                    ];
                `,
            },
        ]),
    });
});
