---
name: reause-functions
description: Apply reause hooks where appropriate to build concise, maintainable React features.
license: MIT
metadata:
    author: reause
    version: "0.0.1"
compatibility: Requires React 18 (or above)
---

# reause Functions

This skill is a decision-and-implementation guide for reause functions in React projects. It maps requirements to the most suitable reause function, applies the correct usage pattern, and prefers hook-based solutions over bespoke code to keep implementations concise, maintainable, and performant.

## When to Apply

- Apply this skill whenever assisting user development work in React.
- Always check first whether a reause function can implement the requirement.
- Prefer reause hooks over custom code to improve readability, maintainability, and performance.
- Map requirements to the most appropriate reause function and follow the function’s invocation rule.
- Please refer to the `Invocation` field in the below functions table. For example:
  - `AUTO`: Use automatically when applicable.
  - `EXTERNAL`: Use only if the user already installed the required external dependency; otherwise reconsider, and ask to install only if truly needed.
  - `EXPLICIT_ONLY`: Use only when explicitly requested by the user.
    > _NOTE_ User instructions in the prompt or `AGENTS.md` may override a function’s default `Invocation` rule.

## Migrating from VueUse

reause is a 1:1 React port of VueUse, so an upstream composable maps onto a
single reause function with the same options and a React-adapted return shape:

- `ref*` → `useState*` (e.g. `refDebounced` → `useStateDebounced`)
- `on*` → `use*` (e.g. `onClickOutside` → `useClickOutside`)
- `use*RefHistory` → `useState*History`
- read-only value sources take a plain `T`; values reause should write back
  take a React state tuple (`State<T>`, e.g. from `useState<T>()`)

Each reference keeps the upstream name in its `Map from` note, so the VueUse
page can be consulted for behaviour the port preserves.

## Functions

All functions listed below are part of the [reause](https://github.com/hairyf/reause) library, each section categorizes functions based on their functionality.

IMPORTANT: Each function entry includes a short `Description` and a detailed `Reference`. When using any function, always consult the corresponding document in `./references` for Usage details and Type Declarations.

Every entry is a React hook (`useX`) unless its reference says otherwise, and is
exported from the package (`@reause/core`, `@reause/shared`, …) named by its
`Map from` note in the reference.

<!-- FUNCTIONS_TABLE_PLACEHOLDER -->
