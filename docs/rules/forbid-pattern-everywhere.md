# `forbid-pattern-everywhere`

Specified pattern(s) are disallowed **everywhere**--in variables, functions, literals, property names, classes, types, interfaces, etc.

Sometimes you don't want to see certain words in your code, period. Maybe you're refactoring out problematic verbiage (e.g., "whitelist"/"blacklist") or maybe just trying to avoid domain-specific terminology whose meanings have evolved, become ambiguous or obsolete. Either way, you want to prevent these patterns from creeping back into your codebase in the future.

There are certainly existing lint rules that can restrict patterns (for example, [naming-convention](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md) for variable/function names), but `forbid-pattern-everywhere` provides a focused, one-stop shop that avoids the "regex pollution" of forcing negative patterns into positive regexes.

## Rule Details

This rule will alarm when any string literal or named "entity" matches any configured pattern.

Examples of **incorrect** code for this rule:

```ts
/**
 * With options = { patterns: ['Blah'] }
 */
const myBlahVar = 4;

/**
 * With options = { patterns: ['Blah'] }
 */
function myBlahFunc() {
    return 'ok';
}

/**
 * With options = { patterns: ['Blah'] }
 */
function myFunc() {
    return 'Blah blah blah';
}

/**
 * With options = { patterns: ['Blah'] }
 */
interface MyBlahInterface {
    someProp: string;
}
```

Examples of **correct** code for this rule:

```ts
/**
 * With options = { patterns: ['^Blah'] }
 */
function myBlahFunc() {
    return 'ok because does not start with "Blah"';
}
```

### Options

The rule accepts an options object with the below structure. Note that any string pattern will be interpreted as a regular expression string, or you can provide an explicit `RegExp` object if you're defining these patterns in javascript/typescript.

```ts
type Options = {
    patterns: Array<string | RegExp>;
};
```

## When Not To Use It

If you don't have any words/patterns you want to globally prohibit.

## Further Reading

-   [naming-convention](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/naming-convention.md) lint rule
