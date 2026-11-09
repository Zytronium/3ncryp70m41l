// avatar.ts memoizes the remote photo candidate list for a sender so the same
// sender (or bimi domain) is only resolved once per source preference. the
// backend resolves BIMI DNS and supplies Gravatar URLs; the webview requests the
// image only when a candidate reaches an img element.

import { senderPhotos } from './api'

const cache = new Map<string, Promise<string[]>>()

export function clearPhotoCache(): void {
  cache.clear()
}

// photosFor returns remote candidates allowed by the selected source and the
// Gravatar preference. errors and the "pfp" source resolve to an empty list so
// callers fall back to the generated placeholder.
export async function photosFor(source: string, email: string, useGravatar: boolean): Promise<string[]> {
  if (source === 'pfp' || !email) {
    return []
  }
  const key = `${source}:${email.toLowerCase()}`
  let pending = cache.get(key)
  if (!pending) {
    // the binding returns json null for a sender without candidates (a nil Go
    // slice), which resolves successfully - normalize it, the catch alone
    // does not cover it.
    pending = senderPhotos(email)
      .then((found) => found ?? [])
      .catch(() => [])
    cache.set(key, pending)
  }
  const photos = await pending
  return useGravatar ? photos : photos.filter((photo) => !isGravatarURL(photo))
}

function isGravatarURL(photo: string): boolean {
  try {
    return new URL(photo).hostname.toLowerCase() === 'www.gravatar.com'
  } catch {
    return false
  }
}
