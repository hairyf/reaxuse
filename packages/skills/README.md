# reause Skills

Agent Skills for reause — a collection of reactive utilities for React, a 1:1
AI-mapped port of [VueUse](https://vueuse.org).

> [!IMPORTANT]
> Experimental Project: Aims to help AI agents use libraries more accurately with fewer tokens. Feedback is welcome.

- 🪜 Progressive disclosure: send reause function overviews first, then load detailed usage and type declarations on demand
- 💰 Minimal token usage: provide only necessary information to reduce token consumption
- 📵 Offline-first design: works without internet access or additional agent permissions
- ⚙️ Customizable policies: users can override function invocation rules in prompts or `AGENTS.md`
- 💉 Reduced hallucinations: precise usage references help prevent invented APIs

## Installation

### Install via [skills-npm](https://github.com/antfu/skills-npm)

`@reause/skills` needs to be used together with [`skills-npm`](https://github.com/antfu/skills-npm) to install agent skills.

First, add a `prepare` script to your `package.json` so the skills are symlinked automatically for your agent whenever you install dependencies:

```json
{
  "scripts": {
    "prepare": "skills-npm"
  }
}
```

Then, install both `skills-npm` and `@reause/skills`:

```bash
npm i -D @reause/skills skills-npm
```

### Install via [skills](https://github.com/vercel-labs/skills)

```bash
npx skills add hairyf/reause
```

Install skills via [skills](https://github.com/vercel-labs/skills) you need to be careful about the potential version mismatch between the skill and your local reause version.

## Generation

`skills/reause-functions` is generated, never hand-edited. It mirrors
VueUse's [`packages/skills`](https://github.com/vueuse/vueuse/tree/main/packages/skills)
one-to-one: for every page in the `@reause/metadata` registry (`packages/metadata`),
`build.ts` writes `references/<name>.md` (the docs page plus its type
declarations) and a categorised functions table into `SKILL.md`, then copies the
result to the repo-root `skills/` directory that ships with this package.

```bash
npm run build:types   # emit types/packages/**/index.d.ts (declaration-only tsc pass)
npm run update:skills # turbo run update -F @reause/skills
```

Type declarations are read from the `types/` output, so `build:types` must run
first — a reference generated without it simply omits the
`## Type Declarations` section.

## License

MIT
