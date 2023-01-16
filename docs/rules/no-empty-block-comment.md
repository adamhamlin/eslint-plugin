# `no-empty-block-comment`

Block comments must have non-empty content.

The [require-jsdoc](https://eslint.org/docs/latest/rules/require-jsdoc) lint rule can enforce that a jsdoc comment exists, but it doesn't validate that the comment has any content, which is the point of having a comment. This is compounded by the fact that `require-jsdoc` is "fixable" by populating an empty jsdoc comment, which means there may be no explicit impetus to go back and fill it in. In general, an empty block comment has dubious value/intention.

## Rule Details

This rule will alarm when any block comment--jsdoc or otherwise--is empty (i.e., has only whitespace content).

Examples of **incorrect** code for this rule:

```ts
/**
 *
 */
const myVar = 4;

/* */
const myVar2 = 5;
```

Examples of **correct** code for this rule:

```ts
/**
 * This comment not empty!
 */
const myVar = 4;

/* info */
const myVar2 = 5;

// Empty line comments are:
//
// OK
const myVar3 = 6;
```

### Options

N/A

## When Not To Use It

If you don't care about having empty block/jsdoc comments.

## Further Reading

-   [require-jsdoc](https://eslint.org/docs/latest/rules/require-jsdoc) lint rule
