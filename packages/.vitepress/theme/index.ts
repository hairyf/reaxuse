import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Contributors from './components/Contributors.vue'
import DemoContainer from './components/DemoContainer.vue'
import Note from './components/Note.vue'
import ReloadPrompt from './components/ReloadPrompt.vue'
import './styles/main.css'
import './styles/vars.css'
import './styles/overrides.css'
import './styles/demo.css'
import './styles/utils.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DemoContainer', DemoContainer)
    app.component('Note', Note)
    app.component('Contributors', Contributors)
    app.component('ReloadPrompt', ReloadPrompt)
  },
} satisfies Theme
