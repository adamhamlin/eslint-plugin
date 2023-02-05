import excludePatternEverywhere from './src/rules/forbid-pattern-everywhere';
import noEmptyBlockComment from './src/rules/no-empty-block-comment';
import optInSort from './src/rules/opt-in-sort';

export const rules = {
    [excludePatternEverywhere.name]: excludePatternEverywhere.rule,
    [noEmptyBlockComment.name]: noEmptyBlockComment.rule,
    [optInSort.name]: optInSort.rule,
};
