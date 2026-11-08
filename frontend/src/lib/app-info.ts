// app-info.ts holds the static facts shown in the settings about section. the
// version is hardcoded for now; wiring it to the build (ldflags or wails.json)
// is a small follow-up.
// TODO(build): inject version at build time instead of hardcoding here.
export const APP = {
  name: 'EncryptoMail',
  version: '0.1.0',
  website: 'https://pelton.app',
  docs: 'https://docs.pelton.app',
  repo: 'https://github.com/zytronium/3ncryp70m41l',
  issues: 'https://github.com/zytronium/3ncryp70m41l/issues',
  contributors: 'https://github.com/zytronium/3ncryp70m41l/graphs/contributors',
  license: 'GPL-3.0',
  licenseUrl: 'https://www.gnu.org/licenses/gpl-3.0.html',
  author: 'Arne K.',
} as const
