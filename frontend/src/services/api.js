async function apiGet(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const authApi = {
  startLogin(platformId) {
    return apiGet(`/api/${platformId}/auth/login`)
  },
  check(platformId) {
    return apiGet(`/api/${platformId}/auth/check`)
  },
}