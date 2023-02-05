/**
 * Zip arr1 alongside arr2
 */
export function zip<L, R>(arr1: L[], arr2: R[]): Array<[L, R]> {
    return arr1.map((el, idx) => [el, arr2[idx]]);
}
