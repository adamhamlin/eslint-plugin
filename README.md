# ESLint Plugin

[![CI Status Badge](https://github.com/adamhamlin/eslint-plugin/actions/workflows/ci.yaml/badge.svg)](https://github.com/adamhamlin/eslint-plugin/actions/workflows/ci.yaml)

My collection of miscellaneous custom ESLint rules!

## Install

```bash
npm install eslint-plugin-adamhamlin --save-dev
```

## Usage

Add `adamhamlin` to the plugins section of your `.eslintrc` configuration file:

```json
{
    "plugins": ["adamhamlin"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "adamhamlin/no-empty-block-comment": "error",
        "adamhamlin/forbid-pattern-everywhere": [
            "error",
            {
                "patterns": ["^(bleep|bloop)"]
            }
        ]
    }
}
```

## Rules

This plugin makes the following lint rules available:

-   [forbid-pattern-everywhere](./docs/rules/forbid-pattern-everywhere.md) - Specified pattern(s) are disallowed **everywhere**--in variables, functions, literals, property names, classes, types, interfaces, etc.
-   [no-emppty-block-comment](./docs/rules/no-empty-block-comment.md) - Block comments must have non-empty content.

<!-- begin auto-generated rules list -->

<!-- end auto-generated rules list -->

## TODO

-   Use eslint-doc-generator to generate the rules list?
