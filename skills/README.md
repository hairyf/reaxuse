# Skills

Agent skills for working with the reause codebase. The layout mirrors
[VueUse's `skills/` directory](https://github.com/vueuse/vueuse/tree/main/skills):
a per-topic folder containing a `SKILL.md` plus one reference document per
function.

> [!NOTE]
> These files are **generated** — do not edit them by hand. They are produced
> by [`packages/skills`](../packages/skills) from the `@reause/metadata`
> registry:
>
> ```bash
> npm run build:types   # emit types/ with a declaration-only tsc pass
> npm run update:skills # turbo run update -F @reause/skills
> ```
>
> Edit the docs pages (`packages/<pkg>/<hook>/index.md`), the template
> (`packages/skills/templates/reause-functions-skills.md`) or
> `packages/skills/build.ts` instead, then regenerate.
