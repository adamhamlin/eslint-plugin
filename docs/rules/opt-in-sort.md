# `opt-in-sort`

Enforce (and fix!) sorting of object keys, array values, or TS enums/interfaces/types by adding the `@sort` annotation where desired.

Most sorting lint rules require you to make an "all or nothing" sorting decision--sort ALL structures across your codebase or sort nothing. Frequently, sorting arrays is incorrect/would change behavior, but even sorting some objects can hurt readability. But of course there are times where sorting is highly desired, like in large constant objects/lists. Thus, being able to selectively "opt-in" to sorting behavior is ideal.

## Rule Details

This rule will alarm when any of the following structures are both (1) preceded by the `@sort` annotation in a comment, and (2) have unsorted keys/values/elements/etc:

-   Object literal
-   Array literal
-   TS Enum
-   TS Interface
-   TS Type Literal

> _Note that sorting will also be enforced on any nested structures. However, this behavior can be configured--see the [Options](#options) section._

Examples of **incorrect** code for this rule:

```ts
// @sort
const myObj = {
    b: 2,
    a: 1,
    c: 3,
};

// @sort
const myArray = ['b', 'a', 'c'];

// @sort
enum MyEnum {
    B = 'b',
    A = 'a',
    C = 'c',
}

// @sort
interface MyInterface {
    b: string;
    a: string;
    c: string;
}

// @sort
type MyTypeLiteral = {
    b: string;
    a: string;
    c: string;
};
```

Examples of **correct** code for this rule:

```ts
// @sort
const myObj = {
    a: 1,
    b: 2,
    c: 3,
};

/*
 * Works in block comment, too
 * @sort
 */
const myArray = ['a', 'b', 'c'];
```

### Sorting Behavior

The default sorting behavior is as follows:

-   Ordering: Normalize a structure's "elements" to strings, then compare using [String.prototype.localeCompare](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) with the options `{ numeric: true, caseFirst: 'upper' }`
-   "Deeply" sort all applicable nested structures
-   Consider special tokens like `null`/`undefined`/`false`/`true` to be non-special (i.e., null starts with "n", false starts with "f", etc.)
-   Push unknown/unsortable array values to the end of the list (e.g., an array that contains the element `{some: 'value'}`)
-   Sorting is not limited to traditional keys and literal values, we can also sort some expression-based elements:
    ```ts
    // @sort
    const myObj1 = {
        [MyEnum.A]: 1,
        [MyEnum.B]: 2,
        [MyEnum.C]: 3,
    };
    // @sort
    const myArr = [
        my.member.expression,
        `my.template.literal.${a}`,
        `my.template.literal.${b}`,
        some.other.member.expression,
    ];
    ```

### Options

This rule does NOT accept traditional options via an `.eslintrc` file, but every `@sort` annotation accepts the following _colon-delimited_ options:

-   `keys`: (default: true) If prescribed _and_ `values` is omitted, only sort keys, not values. The structures considered to have "keys" are:
    -   Object Literal
    -   TS Interface
    -   TS Type Literal
-   `values`: (default: true) If prescribed _and_ `keys` is omitted, only sort values, not keys. The structures considered to have "values" are:
    -   Array Literal
    -   TS Enum
-   `reverse`: (default: false) If true, reverse the sorting order.
-   `none`: (default: false) If true, do not sort this structure. This is used to "skip" the sorting of specific nested structures.
-   `shallow`: (default: false) If true, only apply sorting to this structure and not nested structures.

```ts
/* OPTIONS EXAMPLE */

// First annotation says: deep sort everything
// @sort
const myObj = {
    a: 1,
    b: 2,
    c: 3,
    // Second annotation says: sort keys-only, reversed, but don't apply that sorting any deeper
    // @sort:keys:reverse:shallow
    nest1: {
        nest2: [
            // Since previous annotation was shallow, now we're back to the top-level
            // annotation, which includes sorting of array values
            'apple',
            'banana',
            'cherry',
        ],
        g: 6,
        f: 5,
        e: 4,
    },
};
```

## When Not To Use It

If you don't have any structures you want to sort.
