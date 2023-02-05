import * as MiscUtils from '../src/utils/misc-utils';

describe('Misc Utils', () => {
    describe('assertIsDefined', () => {
        it('No error when value is defined', () => {
            expect(() => MiscUtils.assertDefined(5)).not.toThrow();
        });

        it('Assertion error thrown when value is nullish', () => {
            const expectedError = new MiscUtils.AssertionError('Value is null or undefined.');
            expect(() => MiscUtils.assertDefined(null)).toThrow(expectedError);
            expect(() => MiscUtils.assertDefined(undefined)).toThrow(expectedError);
        });
    });
});
