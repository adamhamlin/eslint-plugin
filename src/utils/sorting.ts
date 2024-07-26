import { AST_NODE_TYPES, Expression, Node } from '@typescript-eslint/types/dist/generated/ast-spec';
import { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint';
import { match } from 'ts-pattern';

import { FixHelper } from './fix';
import { zip } from './misc-utils';
import { NodePair, SortableNode, SortingConfig } from './sorting.types';

/**
 * Enforce sorting for the elements of the given node type
 */
export function enforceSorting(
    node: SortableNode,
    sortingConfig: SortingConfig,
    context: RuleContext<string, unknown[]>
): void {
    if (sortingConfig.none) {
        // Short-circuit
        return;
    }

    match(node)
        .with({ type: AST_NODE_TYPES.ObjectExpression }, (matched) => {
            if (sortingConfig.keys) {
                enforceSortingHelper(matched, matched.properties, sortingConfig, context);
            }
        })
        .with({ type: AST_NODE_TYPES.ArrayExpression }, (matched) => {
            if (sortingConfig.values) {
                // A null element only occurs in sparse array; we'll just ignore
                const elements = matched.elements.filter((el): el is Expression => el !== null);
                enforceSortingHelper(matched, elements, sortingConfig, context);
            }
        })
        .with({ type: AST_NODE_TYPES.TSInterfaceDeclaration }, (matched) => {
            if (sortingConfig.keys) {
                enforceSortingHelper(matched, matched.body.body, sortingConfig, context);
            }
        })
        .with({ type: AST_NODE_TYPES.TSTypeLiteral }, (matched) => {
            if (sortingConfig.keys) {
                enforceSortingHelper(matched, matched.members, sortingConfig, context);
            }
        })
        .with({ type: AST_NODE_TYPES.TSEnumDeclaration }, (matched) => {
            if (sortingConfig.values) {
                enforceSortingHelper(matched, matched.members, sortingConfig, context);
            }
        })
        .with({ type: AST_NODE_TYPES.TSUnionType }, (matched) => {
            if (sortingConfig.values) {
                enforceSortingHelper(matched, matched.types, sortingConfig, context);
            }
        })
        .exhaustive();
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function enforceSortingHelper(
    parentNode: SortableNode,
    nodes: Node[],
    sortingConfig: SortingConfig,
    context: RuleContext<string, unknown[]>
): void {
    const sortedNodes = [...nodes].sort(getCompareFn(sortingConfig));
    const nodePairs: NodePair[] = zip(nodes, sortedNodes);

    for (const [node, expectedNode] of nodePairs) {
        if (node !== expectedNode) {
            const fixHelper = new FixHelper(context.getSourceCode());
            context.report({
                loc: parentNode.loc,
                messageId: 'unsortedKeysOrValues',
                data: {
                    entityType: getEntityTypeForDisplay(parentNode),
                    expected: getStringFromNode(expectedNode, true),
                    actual: getStringFromNode(node, true),
                },
                fix: fixHelper.swapNodes(nodePairs),
            });
            break;
        }
    }
}

function getCompareFn(sortingConfig: SortingConfig) {
    return (a: Node, b: Node) => {
        const aStr = getStringFromNode(a);
        const bStr = getStringFromNode(b);
        if (aStr === undefined && bStr === undefined) {
            return 0;
        } else if (aStr === undefined) {
            // Non-sortable nodes to end
            return 1;
        } else if (bStr === undefined) {
            // Non-sortable nodes to end
            return -1;
        } else {
            const compareRes = aStr.localeCompare(bStr, undefined, { numeric: true, caseFirst: 'upper' });
            const multiplier = sortingConfig.reverse ? -1 : 1;
            return compareRes * multiplier;
        }
    };
}

/**
 * Do our best to extract text from a given node type.
 */
function getStringFromNode(node: Node, forDisplay = false): string | undefined {
    return (
        match(node)
            // UNWRAPPED/ATOMIC TYPES
            .with({ type: AST_NODE_TYPES.Identifier }, (matched) => {
                return matched.name;
            })
            .with({ type: AST_NODE_TYPES.Literal }, (matched) => {
                // NOTE: No special treatment of null, true, false, etc
                return matched.value?.toString() ?? matched.raw;
            })
            .with({ type: AST_NODE_TYPES.TemplateElement }, (matched) => {
                return matched.value.cooked;
            })
            // WRAPPED TYPES
            .with({ type: AST_NODE_TYPES.TSLiteralType }, (matched) => {
                return getStringFromNode(matched.literal, forDisplay);
            })
            .with({ type: AST_NODE_TYPES.TemplateLiteral }, (matched) => {
                // Order the consituent parts from left to right
                const children = [...matched.quasis, ...matched.expressions].sort((a, b) => {
                    // NOTE: `range` is of form [start, end]
                    return a.range[0] - b.range[0];
                });
                return children
                    .map((child) => {
                        const str = getStringFromNode(child, forDisplay);
                        const expressions = new Set<Node>(matched.expressions);
                        if (forDisplay && expressions.has(child)) {
                            return `\${${str}}`;
                        } else {
                            return str;
                        }
                    })
                    .join('');
            })
            .with({ type: AST_NODE_TYPES.Property }, (matched) => {
                return getStringFromNode(matched.key, forDisplay);
            })
            .with({ type: AST_NODE_TYPES.MemberExpression }, (matched) => {
                // Get member expression path, e.g., `someObj.a.b.c`
                const leftSide = getStringFromNode(matched.object, forDisplay);
                const rightSide = getStringFromNode(matched.property, forDisplay);
                return `${leftSide}.${rightSide}`;
            })
            .with({ type: AST_NODE_TYPES.TSPropertySignature }, (matched) => {
                // NOTE: This generally covers 'TypeElement' types
                return getStringFromNode(matched.key, forDisplay);
            })
            .with({ type: AST_NODE_TYPES.TSTypeReference }, (matched) => {
                return getStringFromNode(matched.typeName, forDisplay);
            })
            .with({ type: AST_NODE_TYPES.TSEnumMember }, (matched) => {
                return getStringFromNode(matched.id, forDisplay);
            })
            .otherwise(() => {
                // "Unsortable" node type
                return forDisplay ? `<Unsortable type: ${node.type}>` : undefined;
            })
    );
}

function getEntityTypeForDisplay(node: SortableNode): string {
    return match(node.type)
        .with(AST_NODE_TYPES.ObjectExpression, () => 'Object keys')
        .with(AST_NODE_TYPES.ArrayExpression, () => 'Array values')
        .with(AST_NODE_TYPES.TSInterfaceDeclaration, () => 'Interface keys')
        .with(AST_NODE_TYPES.TSTypeLiteral, () => 'Type literal keys')
        .with(AST_NODE_TYPES.TSEnumDeclaration, () => 'Enum values')
        .with(AST_NODE_TYPES.TSUnionType, () => 'Union values')
        .exhaustive();
}
