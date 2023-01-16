import dedent from 'dedent';

import rule from '../../src/rules/no-empty-block-comment';
import { ruleTester } from '../rule-tester';

describe('Rule Tests', () => {
    const errors = [{ messageId: 'nonEmptyBlockComment' as const }];

    ruleTester.run('no-empty-block-comment', rule, {
        valid: [
            {
                code: dedent`
                    /**
                     * Not empty
                     */
                `,
            },
            {
                code: dedent`
                    /**
                     *
                     * Still not empty
                     */
                `,
            },
            {
                // Ignore empty line comments
                code: dedent`
                    //
                `,
            },
        ],

        invalid: [
            {
                code: `/**/`,
                errors,
            },
            {
                code: `/* */`,
                errors,
            },
            {
                code: dedent`
                    /**
                     *
                     */
                `,
                errors,
            },
            {
                // Trailing whitespace on middle line
                code: dedent`
                    /**
                     * 
                     */
                `,
                errors,
            },
            {
                code: dedent`
                    /**
                     * Good comment, followed by empty comment
                     */
                    const bleep = 4;

                    /**
                     *
                     */
                    const bloop = 5;
                `,
                errors,
            },
        ],
    });
});
