import excludePatternEverywhere from './src/rules/forbid-pattern-everywhere';
import noEmptyBlockComment from './src/rules/no-empty-block-comment';

export const rules = {
    [excludePatternEverywhere.name]: excludePatternEverywhere.rule,
    [noEmptyBlockComment.name]: noEmptyBlockComment.rule,
};
