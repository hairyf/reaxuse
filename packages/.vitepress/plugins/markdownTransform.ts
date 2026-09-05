import type { Plugin } from 'vite'

/**
 * Inline-markdown transformer for VitePress pages.
 *
 * React adaptation of VueUse's `packages/.vitepress/plugins/markdownTransform.ts`:
 * - backticked function names (`` `useToggle` ``) that match the registry are
 *   auto-linked to their docs page (`[\`useToggle\`](/core/useToggle)`).
 * - VueUse's Vue-specific injections (twoslash code blocks, function-page
 *   metadata) do not apply to the React port and are omitted.
 */
export interface FunctionRef {
  name: string
  pkg: string
}

export function MarkdownTransform(functions: FunctionRef[]): Plugin {
  const registered = new Map(functions.map(fn => [fn.name, `/${fn.pkg}/${fn.name}/`]))

  return {
    name: 'reaxuse-markdown-transform',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md'))
        return

      const lines = code.split('\n')

      const out = lines.map((line) => {
        const trimmed = line.trimStart()
        // Keep fenced code blocks and raw HTML untouched.
        if (trimmed.startsWith('```') || trimmed.startsWith('<'))
          return line
        // Only linkify known function names in prose/table cells, and skip
        // tokens that are already part of a markdown link label (`[`useX`]`).
        return line.replace(/`([\w-]+)`/g, (raw, name) => {
          if (line.includes(`[\`${name}\`]`))
            return raw
          const link = registered.get(name)
          return link ? `[\`${name}\`](${link})` : raw
        })
      })

      return out.join('\n')
    },
  }
}
