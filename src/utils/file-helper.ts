import { Position } from '@typescript-eslint/types/dist/generated/ast-spec';
import { SourceCode } from '@typescript-eslint/utils/dist/ts-eslint';

import { assertDefined } from './misc-utils';

interface AnnotationMap<T> {
    [lineNum: number]: T;
}

/**
 * A tuple list of 0-based <lineNum, lineStartIndex, lineEndIndex>
 *
 * NOTE: lineEndIndex should include the trailing newline character
 */
type LineIndices = Array<[number, number, number]>;

/**
 * Miscellaneous helpers for parsing/processing source files
 */
export class FileHelper {
    sourceText: string;

    private _lineIndices: LineIndices | undefined;

    constructor(private sourceCode: SourceCode) {
        this.sourceText = sourceCode.getText();
    }

    // Lazy getter
    private get lineIndices(): LineIndices {
        if (!this._lineIndices) {
            this._lineIndices = this.sourceText.split('\n').reduce(
                (accumulator, line, idx) => {
                    const cursor = accumulator.cursor;
                    accumulator.indices.push([idx, cursor, cursor + line.length]);
                    accumulator.cursor += line.length + 1; // +1 for newline char
                    return accumulator;
                },
                { cursor: 0, indices: [] as LineIndices }
            ).indices;
        }
        return this._lineIndices;
    }

    /**
     * Returns a map who keys are line numbers corresponding to annotations and whose values are
     * the result of passing the colon-delimited options thru the `processOptions` function.
     *
     * @param annotation the @-prefixed annotation to search for
     * @param processOptions the callback function to process any parsed options
     *
     * Assumptions:
     * - An annotation must appear by itself on a single line
     * - Any options should follow the annotation and be colon-delimited, no whitespace
     */
    getAnnotationMap<T>(annotation: `@${string}`, processOptions: (opts: Set<string>) => T): AnnotationMap<T> {
        const regexStr = `^\\s*(?:\\*\\s*)?(${annotation}(?::[\\w-]+)*)`;
        return this.sourceCode.getAllComments().reduce((accumulator, comment) => {
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

    /**
     * Get a Position object from an index in this file's source text
     *
     * @param index the 0-based index
     */
    getPositionFromIndex(index: number): Position {
        const res = this.lineIndices.find(([_lineNum, start, end]) => {
            return index >= start && index <= end;
        });
        assertDefined(res);
        const [lineNum, lineStartIdx] = res;

        return {
            line: lineNum + 1, // 1-based
            column: index - lineStartIdx, // 0-based
        };
    }
}
