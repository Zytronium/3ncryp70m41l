import { beforeEach, describe, expect, it, vi } from 'vitest'
import { senderPhotos } from './api'
import { clearPhotoCache, photosFor } from './avatar'

vi.mock('./api', () => ({ senderPhotos: vi.fn() }))

const gravatar = 'https://www.gravatar.com/avatar/abc?d=404&s=160'
const bimi = 'https://sender.example/logo.svg'

beforeEach(() => {
  clearPhotoCache()
  vi.clearAllMocks()
  vi.mocked(senderPhotos).mockResolvedValue([bimi, gravatar])
})

describe('photosFor', () => {
  it('filters Gravatar candidates when the preference is off', async () => {
    await expect(photosFor('bimi_gravatar', 'sender@example.com', false)).resolves.toEqual([bimi])
  })

  it('keeps Gravatar candidates when the preference is on', async () => {
    await expect(photosFor('bimi_gravatar', 'other@example.com', true)).resolves.toEqual([bimi, gravatar])
  })

  it('does not request candidates for the generated-only source', async () => {
    await expect(photosFor('pfp', 'private@example.com', true)).resolves.toEqual([])
    expect(senderPhotos).not.toHaveBeenCalled()
  })

  it('re-resolves candidates after the selected source changes', async () => {
    await photosFor('bimi_gravatar', 'sender@example.com', true)
    clearPhotoCache()
    await photosFor('bimi_gravatar', 'sender@example.com', true)
    expect(senderPhotos).toHaveBeenCalledTimes(2)
  })
})
