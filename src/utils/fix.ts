import { Node } from '@typescript-eslint/types/dist/generated/ast-spec';
import { SourceCode, RuleFixer, ReportFixFunction } from '@typescript-eslint/utils/dist/ts-eslint';

import { NodePair } from './sorting.types';

export class FixHelper {
    constructor(private sourceCode: SourceCode) {}

    /**
     * For each pair, replace text of left node with the right node.
     */
    swapNodes(pairs: NodePair[]): ReportFixFunction {
        return (fixer: RuleFixer) => {
            return pairs.map(([node, replacementNode]) => {
                const replacementText = this.getText(replacementNode);
                return fixer.replaceText(node, replacementText);
            });
        };
    }

    private getText(node: Node): string {
        return this.sourceCode.getText(node);
    }
}
