import { useRef, useState } from 'react'
import './App.css'
import { PLATFORMS, getPlatform, platformName } from './constants/platforms'
import { PLAYLISTS } from './constants/mockPlaylists'
import { Header } from './components/common/Header'
import { Footer } from './components/common/Footer'
import { Stepper } from './components/common/Stepper'
import { TransferArrow } from './components/common/Icons'
import { PlatformSelector } from './components/migration/PlatformSelector'
import { PlaylistSelector } from './components/migration/PlaylistSelector'
import { AuthCard } from './components/auth/AuthCard'
import { useTheme } from './hooks/useTheme'
import { usePlatformAuth } from './hooks/usePlatformAuth'

const STEPS = ['Origen', 'Destino', 'Playlist']

function App() {
  const { theme, toggleTheme } = useTheme()
  const [source, setSource] = useState(null)
  const [target, setTarget] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [hint, setHint] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const {
    status: authStatus,
    info: authInfo,
    user: authUser,
    error: authError,
    startAuth,
    checkAuth,
    reset: resetAuth,
  } = usePlatformAuth()
  const hintTimer = useRef(null)

  function flashHint(message) {
    setHint(message)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(''), 3400)
  }

  const sourcePlatform = source ? getPlatform(source) : null
  const requiresAuth = Boolean(sourcePlatform && sourcePlatform.requiresAuth)
  const authReady = !requiresAuth || authStatus === 'authenticated'
  const playlistsEnabled = Boolean(source) && authReady
  const stepsDone = [Boolean(source), Boolean(target), Boolean(playlist)]
  const currentStep = stepsDone.findIndex((done) => !done)
  const currentStepIndex = currentStep === -1 ? 0 : currentStep
  const selectedPlaylist = playlist
    ? PLAYLISTS.find((item) => item.id === playlist)
    : null
  const ready = Boolean(source && target && playlist)

  let note = ''
  if (!source) {
    note = 'Selecciona primero una plataforma de origen.'
  } else if (requiresAuth && authStatus !== 'authenticated') {
    note = `Conecta tu cuenta de ${sourcePlatform.name} para poder ver tus playlists.`
  } else if (!target) {
    note = 'Selecciona ahora una plataforma de destino.'
  } else if (!playlist) {
    note = 'Por último, elige una playlist para migrar.'
  }

  const playlistNote = !playlistsEnabled
    ? requiresAuth && authStatus !== 'authenticated'
      ? `Conecta tu cuenta de ${sourcePlatform.name} para cargar tus playlists.`
      : 'Selecciona una plataforma de origen para cargar tus playlists.'
    : ''

  function chooseSource(id) {
    if (source === id) {
      setSource(null)
      setPlaylist(null)
      setSubmitted(false)
      resetAuth()
      return
    }
    if (id === target) {
      flashHint('Origen y destino deben ser plataformas distintas.')
      return
    }
    setSource(id)
    setPlaylist(null)
    setSubmitted(false)
    const platform = getPlatform(id)
    if (platform.requiresAuth) {
      startAuth(platform)
    } else {
      resetAuth()
    }
  }

  function chooseTarget(id) {
    if (target === id) {
      setTarget(null)
      setSubmitted(false)
      return
    }
    if (id === source) {
      flashHint('Origen y destino deben ser plataformas distintas.')
      return
    }
    setTarget(id)
    setSubmitted(false)
  }

  function choosePlaylist(id) {
    setPlaylist(id)
    setSubmitted(false)
  }

  function cancelAuth() {
    resetAuth()
    setSource(null)
    setPlaylist(null)
    setSubmitted(false)
  }

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="shell">
        <section className="hero">
          <span className="eyebrow">Migración de playlists</span>
          <h1>Tu música, en cualquier plataforma.</h1>
          <p className="lead">
            Elige de dónde y hacia dónde quieres mover tus playlists. Music
            Migrator se encarga de encontrar y trasladar cada canción.
          </p>
        </section>

        <section className="schema-card" aria-label="Configurador de migración">
          <Stepper steps={STEPS} done={stepsDone} currentIndex={currentStepIndex} />

          {hint ? <p className="hint">{hint}</p> : null}

          <div className="card-section">
            <div className="panel-grid">
              <PlatformSelector
                label="Plataforma de origen"
                value={source}
                platforms={PLATFORMS}
                onSelect={chooseSource}
              />
              <div className="transfer" aria-hidden="true">
                <TransferArrow />
              </div>
              <PlatformSelector
                label="Plataforma de destino"
                value={target}
                platforms={PLATFORMS}
                onSelect={chooseTarget}
              />
            </div>
          </div>

          {requiresAuth ? (
            <div className="card-section">
              <AuthCard
                platform={sourcePlatform}
                status={authStatus}
                info={authInfo}
                user={authUser}
                error={authError}
                onStart={() => startAuth(sourcePlatform)}
                onCheck={checkAuth}
                onCancel={cancelAuth}
              />
            </div>
          ) : null}

          <div className="card-section">
            <PlaylistSelector
              playlists={PLAYLISTS}
              value={playlist}
              enabled={playlistsEnabled}
              note={playlistNote}
              onSelect={choosePlaylist}
            />
          </div>

          <div className="card-section">
            <div className="card-footer">
              <div className="summary" aria-live="polite">
                {source ? (
                  <span className="summary-item">
                    Origen
                    <strong>{platformName(source)}</strong>
                  </span>
                ) : null}
                {target ? (
                  <span className="summary-item">
                    Destino
                    <strong>{platformName(target)}</strong>
                  </span>
                ) : null}
                {selectedPlaylist ? (
                  <span className="summary-item">
                    Playlist
                    <strong>{selectedPlaylist.name}</strong>
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="primary-btn"
                disabled={!ready}
                onClick={() => setSubmitted(true)}
              >
                Migrar playlist
              </button>
            </div>
            {note ? <p className="hint">{note}</p> : null}
            {submitted && ready ? (
              <p className="info-strip">
                Prototipo de interfaz. La migración real se conectará al backend
                (FastAPI) cuando esté disponible.
              </p>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default App