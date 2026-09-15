import { Fragment, useEffect, useRef, useState } from 'react'
import './App.css'

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', available: true },
  { id: 'tidal', name: 'Tidal', available: true },
  { id: 'youtube-music', name: 'YouTube Music', available: false },
  { id: 'apple-music', name: 'Apple Music', available: false },
  { id: 'deezer', name: 'Deezer', available: false },
]

const PLAYLISTS = [
  { id: 1, name: 'Mañana en la ciudad', tracks: 48 },
  { id: 2, name: 'Foco y trabajo', tracks: 22 },
  { id: 3, name: 'Clásicos de los 2000', tracks: 67 },
  { id: 4, name: 'Encuentros', tracks: 31 },
]

const STEPS = ['Origen', 'Destino', 'Playlist']

function platformName(id) {
  const found = PLATFORMS.find((platform) => platform.id === id)
  return found ? found.name : ''
}

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path
        d="M2 5l2 2 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('mm-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })
  const [source, setSource] = useState(null)
  const [target, setTarget] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [hint, setHint] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const hintTimer = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('mm-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  function flashHint(message) {
    setHint(message)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(''), 3400)
  }

  function chooseSource(id) {
    if (source === id) {
      setSource(null)
      setPlaylist(null)
      setSubmitted(false)
      return
    }
    if (id === target) {
      flashHint('Origen y destino deben ser plataformas distintas.')
      return
    }
    setSource(id)
    setPlaylist(null)
    setSubmitted(false)
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

  const ready = Boolean(source && target && playlist)
  const playlistsEnabled = Boolean(source)
  const stepsDone = [Boolean(source), Boolean(target), Boolean(playlist)]
  const currentStep = stepsDone.findIndex((done) => !done)
  const currentStepIndex = currentStep === -1 ? 0 : currentStep
  const selectedPlaylist = playlist
    ? PLAYLISTS.find((item) => item.id === playlist)
    : null

  let note = ''
  if (!source) {
    note = 'Selecciona primero una plataforma de origen.'
  } else if (!target) {
    note = 'Selecciona ahora una plataforma de destino.'
  } else if (!playlist) {
    note = 'Por último, elige una playlist para migrar.'
  }

  function renderPlatformOption(side, platform) {
    const selecting = side === 'source'
    const isSelected = selecting ? source === platform.id : target === platform.id

    return (
      <button
        key={platform.id}
        type="button"
        className={
          'platform-option' +
          (isSelected ? ' selected' : '') +
          (platform.available ? '' : ' soon')
        }
        disabled={!platform.available}
        aria-pressed={isSelected}
        onClick={() => (selecting ? chooseSource : chooseTarget)(platform.id)}
      >
        <span className="opt-indicator">{isSelected ? <Check /> : null}</span>
        <span className="opt-name">{platform.name}</span>
        {!platform.available ? <span className="opt-tag">Próximamente</span> : null}
      </button>
    )
  }

  return (
    <>
      <header className="site-header">
        <div className="shell header-inner">
          <div className="brand">
            <svg
              className="brand-mark"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M6 12h10m0 0l-4-4m4 4l-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Music Migrator</span>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13.4 10.6A6 6 0 1 1 5.4 2.6a4.9 4.9 0 0 0 8 8z" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="3.2" />
                <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" />
              </svg>
            )}
          </button>
        </div>
      </header>

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
          <div className="steps">
            {STEPS.map((label, index) => {
              const done = stepsDone[index]
              const isCurrent = index === currentStepIndex
              return (
                <Fragment key={label}>
                  {index > 0 ? <span className="step-line" aria-hidden="true" /> : null}
                  <span
                    className={
                      'step-node' +
                      (done ? ' done' : '') +
                      (isCurrent ? ' current' : '')
                    }
                  >
                    <span className="step-index">
                      {done ? <Check /> : `0${index + 1}`}
                    </span>
                    <span className="step-label">{label}</span>
                  </span>
                </Fragment>
              )
            })}
          </div>

          {hint ? <p className="hint">{hint}</p> : null}

          <div className="card-section">
            <div className="panel-grid">
              <div>
                <div className="panel-head">
                  <h3>Plataforma de origen</h3>
                  <span className="panel-val">
                    {source ? platformName(source) : 'Sin seleccionar'}
                  </span>
                </div>
                <div className="platform-list">
                  {PLATFORMS.map((platform) =>
                    renderPlatformOption('source', platform),
                  )}
                </div>
              </div>

              <div className="transfer" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    d="M4 12h15m0 0l-5-5m5 5l-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <div className="panel-head">
                  <h3>Plataforma de destino</h3>
                  <span className="panel-val">
                    {target ? platformName(target) : 'Sin seleccionar'}
                  </span>
                </div>
                <div className="platform-list">
                  {PLATFORMS.map((platform) =>
                    renderPlatformOption('target', platform),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card-section">
            <div className="panel-head">
              <h3>Playlist</h3>
              <span className="panel-val">
                {selectedPlaylist
                  ? `${selectedPlaylist.name} · ${selectedPlaylist.tracks} canciones`
                  : 'Sin seleccionar'}
              </span>
            </div>
            {!playlistsEnabled ? (
              <p className="playlist-note">
                Selecciona una plataforma de origen para cargar tus playlists.
              </p>
            ) : null}
            <div className={playlistsEnabled ? 'playlist-list' : 'playlist-list disabled'}>
              {PLAYLISTS.map((item) => {
                const isSelected = playlist === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={'playlist-row' + (isSelected ? ' selected' : '')}
                    disabled={!playlistsEnabled}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setPlaylist(isSelected ? null : item.id)
                      setSubmitted(false)
                    }}
                  >
                    <span className="playlist-cover" aria-hidden="true" />
                    <span className="playlist-meta">
                      <span className="playlist-name">{item.name}</span>
                      <span className="playlist-count">
                        {item.tracks} canciones
                      </span>
                    </span>
                    <span className="playlist-check">
                      {isSelected ? <Check /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
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

      <footer className="site-footer">
        <div className="shell footer-inner">
          <p>Music Migrator</p>
          <p>Prototipo de interfaz. El backend se integrará en fases posteriores.</p>
        </div>
      </footer>
    </>
  )
}

export default App