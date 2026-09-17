import { useEffect, useRef, useState } from 'react'
import { authApi } from '../services/api'

const POLL_INTERVAL = 4000

const initialState = { status: 'idle', info: null, user: '', error: '' }

export function usePlatformAuth() {
  const [state, setState] = useState(initialState)
  const pollTimer = useRef(null)
  const platformRef = useRef(null)

  function stopPolling() {
    if (pollTimer.current) {
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  function applyAuthenticated(data) {
    stopPolling()
    setState({ status: 'authenticated', info: null, user: data.user || '', error: '' })
  }

  function applyError(message) {
    stopPolling()
    setState({ status: 'error', info: null, user: '', error: message })
  }

  function checkAuth() {
    const platform = platformRef.current
    if (!platform) return

    authApi
      .check(platform.id)
      .then((data) => {
        if (data.status === 'authenticated') {
          applyAuthenticated(data)
        } else if (data.status === 'expired' || data.status === 'error') {
          applyError(
            data.message ||
              'La autorización no se completó. Vuelve a intentar la conexión.',
          )
        }
      })
      .catch(() => {})
  }

  function startAuth(platform) {
    stopPolling()
    platformRef.current = platform
    setState(initialState)
    setState({ status: 'starting', info: null, user: '', error: '' })

    authApi
      .startLogin(platform.id)
      .then((data) => {
        if (data.status === 'authenticated') {
          applyAuthenticated(data)
          return
        }
        if (data.status === 'error') {
          applyError(
            data.message ||
              `No se pudo iniciar la conexión con ${platform.name}. Inténtalo de nuevo.`,
          )
          return
        }
        if (!data.verification_url || !data.user_code) {
          applyError(
            `La plataforma ${platform.name} no devolvió los datos de autorización.`,
          )
          return
        }
        setState({
          status: 'waiting',
          info: {
            verification_url: data.verification_url,
            user_code: data.user_code,
          },
          user: '',
          error: '',
        })
        pollTimer.current = window.setInterval(checkAuth, POLL_INTERVAL)
      })
      .catch(() => {
        applyError(
          `No se pudo iniciar la conexión con ${platform.name}. Revisa que el servidor de Music Migrator esté encendido.`,
        )
      })
  }

  function reset() {
    stopPolling()
    platformRef.current = null
    setState(initialState)
  }

  useEffect(() => () => stopPolling(), [])

  return { ...state, startAuth, checkAuth, reset }
}