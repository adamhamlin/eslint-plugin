import { AST_NODE_TYPES, Expression, Node } from '@typescript-eslint/types/dist/generated/ast-spec';
import { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint';

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

    switch (node.type) {
        case AST_NODE_TYPES.ObjectExpression:
            if (sortingConfig.keys) {
                enforceSortingHelper(node, node.properties, sortingConfig, context);
            }
            break;
        case AST_NODE_TYPES.ArrayExpression:
            if (sortingConfig.values) {
                // A null element only occurs in sparse array; we'll just ignore
                const elements = node.elements.filter((el): el is Expression => el !== null);
                enforceSortingHelper(node, elements, sortingConfig, context);
            }
            break;
        case AST_NODE_TYPES.TSInterfaceDeclaration:
            if (sortingConfig.keys) {
                enforceSortingHelper(node, node.body.body, sortingConfig, context);
            }
            break;
        case AST_NODE_TYPES.TSTypeLiteral:
            if (sortingConfig.keys) {
                enforceSortingHelper(node, node.members, sortingConfig, context);
            }
            break;
        case AST_NODE_TYPES.TSEnumDeclaration:
            if (sortingConfig.values) {
                enforceSortingHelper(node, node.members, sortingConfig, context);
            }
            break;
        default:
            // Unexpected node type -- do nothing
            break;
    }
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
                    expected: getStringFromNodeForDisplay(expectedNode),
                    actual: getStringFromNodeForDisplay(node),
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
function getStringFromNode(node: Node): string | undefined {
    switch (node.type) {
        case AST_NODE_TYPES.Identifier:
            // NOTE: This includes literal undefined
            return node.name;
        case AST_NODE_TYPES.Literal:
            // NOTE: No special treatment of null, true, false, etc
            return node.value?.toString() ?? node.raw;
        case AST_NODE_TYPES.TemplateElement:
            return node.value.cooked;
        case AST_NODE_TYPES.TemplateLiteral: {
            // Order the consituent parts from left to right
            const children = [...node.quasis, ...node.expressions].sort((a, b) => {
                // NOTE: `range` is of form [start, end]
                return a.range[0] - b.range[0];
            });
            return children.map((child) => getStringFromNode(child) || '').join('');
        }
        case AST_NODE_TYPES.Property:
            return getStringFromNode(node.key);
        case AST_NODE_TYPES.MemberExpression: {
            // Get member expression path, e.g., `someObj.a.b.c`
            const leftSide = getStringFromNode(node.object);
            const rightSide = getStringFromNode(node.property);
            return `${leftSide}.${rightSide}`;
        }
        case AST_NODE_TYPES.TSPropertySignature:
            // NOTE: This generally covers 'TypeElement' types
            return getStringFromNode(node.key);
        case AST_NODE_TYPES.TSEnumMember:
            return getStringFromNode(node.id);
        default:
            // "Unsortable" node type
            return undefined;
    }
}

function getStringFromNodeForDisplay(node: Node): string | undefined {
    return getStringFromNode(node) ?? `<Unsortable type: ${node.type}>`;
}

function getEntityTypeForDisplay(node: SortableNode): string {
    switch (node.type) {
        case AST_NODE_TYPES.ObjectExpression:
            return 'Object keys';
        case AST_NODE_TYPES.ArrayExpression:
            return 'Array values';
        case AST_NODE_TYPES.TSInterfaceDeclaration:
            return 'Interface keys';
        case AST_NODE_TYPES.TSTypeLiteral:
            return 'Type literal keys';
        case AST_NODE_TYPES.TSEnumDeclaration:
            return 'Enum values';
    }
}
