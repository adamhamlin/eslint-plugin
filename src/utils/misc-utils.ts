/**
 * Zip arr1 alongside arr2
 */
export function zip<L, R>(arr1: L[], arr2: R[]): Array<[L, R]> {
    return arr1.map((el, idx) => [el, arr2[idx]]);
}

/**
 * Assertion type guard for undefined values
 */
export function assertDefined<T>(value: T): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        throw new AssertionError('Value is null or undefined.');
    }
}

export class AssertionError extends Error {}
