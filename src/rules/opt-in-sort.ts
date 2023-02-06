import { Node } from '@typescript-eslint/types/dist/generated/ast-spec';

import { createRule } from '../utils/create-rule';
import { FileHelper } from '../utils/file-helper';
import { assertDefined } from '../utils/misc-utils';
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
        const fileHelper = new FileHelper(context.getSourceCode());
        const annotatedLinesMap = fileHelper.getAnnotationMap('@sort', (opts): SortingConfig => {
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
                // NOTE: Can't reach here before sortingState exists, but make types/coverage happy
                assertDefined(sortingState);
                // Revert to previous sorting configuration
                sortingState = sortingState.prev;
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
