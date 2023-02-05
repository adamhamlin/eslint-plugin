import {
    ArrayExpression,
    Node,
    ObjectExpression,
    TSEnumDeclaration,
    TSInterfaceDeclaration,
    TSTypeLiteral,
} from '@typescript-eslint/types/dist/generated/ast-spec';

export type SortableNode =
    | ObjectExpression
    | ArrayExpression
    | TSEnumDeclaration
    | TSInterfaceDeclaration
    | TSTypeLiteral;

export interface SortingState {
    config: SortingConfig;
    prev?: SortingState;
}

export interface SortingConfig {
    /**
     * If true, sort object keys (default: true)
     */
    keys: boolean;
    /**
     * If true, sort array values (default: true)
     */
    values: boolean;
    /**
     * If true, reverse the sorting order (default: false)
     */
    reverse: boolean;
    /**
     * If true, don't sort at all (default: false)
     *
     * This is needed to "skip" sorting of a specific nested object, for example
     */
    none: boolean;
    /**
     * If true, don't sort nested objects/arrays (default: false)
     */
    shallow: boolean;
}

export type NodePair = [Node, Node];
