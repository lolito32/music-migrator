export const PLATFORMS = [
  {
    id: 'spotify',
    name: 'Spotify',
    available: true,
    requiresAuth: false,
    color: '#1db954',
  },
  {
    id: 'tidal',
    name: 'Tidal',
    available: true,
    requiresAuth: true,
    color: '#0a0a0a',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    available: false,
    requiresAuth: true,
    color: '#ff0000',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    available: false,
    requiresAuth: true,
    color: '#fa2d48',
  },
  {
    id: 'deezer',
    name: 'Deezer',
    available: false,
    requiresAuth: true,
    color: '#a238ff',
  },
]

export function getPlatform(id) {
  return PLATFORMS.find((platform) => platform.id === id)
}

export function platformName(id) {
  const found = getPlatform(id)
  return found ? found.name : ''
}