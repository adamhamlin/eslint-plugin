import { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint';

interface AnnotationMap<T> {
    [lineNum: number]: T;
}

/**
 * Returns a map who keys are line numbers corresponding to annotations and whose values are
 * the result of passing the colon-delimited options thru the `processOptions` function.
 *
 * Assumptions:
 * - An annotation must appear by itself on a single line
 * - Any options should follow the annotation and be colon-delimited, no whitespace
 */
export function getAnnotationMap<T>(
    context: RuleContext<string, unknown[]>,
    annotation: `@${string}`,
    processOptions: (opts: Set<string>) => T
): AnnotationMap<T> {
    const regexStr = `^\\s*(?:\\*\\s*)?(${annotation}(?::[\\w-]+)*)`;
    return context
        .getSourceCode()
        .getAllComments()
        .reduce((accumulator, comment) => {
            // Find the first line that matches
            const annotationMatch = comment.value
                .split('\n')
                .find((line) => line.match(regexStr))
                ?.match(regexStr)?.[1]; // just want the first capture group, which includes the annotation itself
            if (annotationMatch) {
                const optionsTokens = new Set(annotationMatch.split(':').slice(1));
                accumulator[comment.loc.end.line] = processOptions(optionsTokens);
            }
            return accumulator;
        }, {} as AnnotationMap<T>);
}
