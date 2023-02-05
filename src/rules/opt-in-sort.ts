import { Node } from '@typescript-eslint/types/dist/generated/ast-spec';

import { getAnnotationMap } from '../utils/annotations';
import { createRule } from '../utils/create-rule';
import { enforceSorting } from '../utils/sorting';
import { SortableNode, SortingConfig, SortingState } from '../utils/sorting.types';

export const name = 'opt-in-sort';
export const rule = createRule({
    name,
    meta: {
        type: 'layout',
        messages: {
            unsortedKeysOrValues: `{{entityType}} are not sorted: '{{expected}}' should appear before '{{actual}}'.`,
        },
        docs: {
            description: 'sorts object keys, array values, TS interfaces/enums/etc via an annotation',
            recommended: false,
            requiresTypeChecking: false,
        },
        fixable: 'code',
        schema: [],
    },
    defaultOptions: [],

    create(context) {
        const annotatedLinesMap = getAnnotationMap(context, '@sort', (opts): SortingConfig => {
            return {
                keys: opts.has('keys') || !opts.has('values'),
                values: opts.has('values') || !opts.has('keys'),
                reverse: opts.has('reverse'),
                none: opts.has('none'),
                shallow: opts.has('shallow'),
            };
        });

        // Short-circuit if no @sort annotations in this file
        if (Object.keys(annotatedLinesMap).length === 0) {
            return {};
        }

        let sortingState: SortingState | undefined;

        function processExpressionEnter(node: SortableNode): void {
            const annotationConfig = getSortingConfigFromAnnotation(node);
            if (annotationConfig && !annotationConfig.shallow) {
                // Store this config for deep/nested usage
                sortingState = {
                    config: annotationConfig,
                    prev: sortingState,
                };
            }
            const sortingConfig = annotationConfig ?? sortingState?.config;
            if (sortingConfig) {
                enforceSorting(node, sortingConfig, context);
            }
        }

        function processExpressionExit(node: SortableNode): void {
            const annotationConfig = getSortingConfigFromAnnotation(node);
            if (annotationConfig && !annotationConfig.shallow) {
                // Revert to previous sorting configuration
                sortingState = sortingState?.prev;
            }
        }

        function getSortingConfigFromAnnotation(node: Node): SortingConfig | undefined {
            return annotatedLinesMap[node.loc.start.line - 1];
        }

        return {
            ObjectExpression: processExpressionEnter,
            'ObjectExpression:exit': processExpressionExit,
            ArrayExpression: processExpressionEnter,
            'ArrayExpression:exit': processExpressionExit,
            TSInterfaceDeclaration: processExpressionEnter,
            'TSInterfaceDeclaration:exit': processExpressionExit,
            TSTypeLiteral: processExpressionEnter,
            'TSTypeLiteral:exit': processExpressionExit,
            TSEnumDeclaration: processExpressionEnter,
            'TSEnumDeclaration:exit': processExpressionExit,
        };
    },
});

export default { name, rule };
