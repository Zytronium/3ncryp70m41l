// These fonts are bundled with the app; the webview makes no font requests.
import './assets/fonts/fonts.css'
import '@fontsource/noto-sans-arabic/400.css'
import '@fontsource/noto-sans-sc/400.css'

// theme tokens must load before the base styles that reference them.
import './theme/tokens.css'
import './style.css'

import { mount } from 'svelte'
import App from './App.svelte'
import { isDemoMode } from './lib/api'
import { setDemoActive } from './lib/demo'

const target = document.getElementById('app')
if (!target) {
  throw new Error('pelton: #app mount point missing')
}

// the cosmetic demo mode (--potatoes-are-nice) has to be known before anything
// renders. Asking for it from the root component's onMount was too late: a
// child mounts before its parent does, so the sidebar and the message list had
// already asked the backend for real mail, and the samples only appeared once
// something triggered a reload.
//
// The root component still asks as well. This runs earlier than any binding
// call the app has made before, so if the backend is not reachable this early
// on some platform, the later answer is what it always was rather than nothing.
await isDemoMode()
  .then(setDemoActive)
  .catch(() => {})

const app = mount(App, { target })

// remove the pre-mount splash now that svelte has taken over.
document.getElementById('splash')?.remove()

export default app
