import { Check, Spinner } from '../common/Icons'

const STATUS_TEXT = {
  idle: 'Sin conectar',
  starting: 'Iniciando…',
  waiting: 'Pendiente de autorización',
  authenticated: 'Conectado',
  error: 'Error',
}

function StatusPill({ status, busy }) {
  return (
    <span className="status-pill">
      {busy ? <Spinner /> : null}
      {status === 'authenticated' ? <Check /> : null}
      {STATUS_TEXT[status]}
    </span>
  )
}

export function AuthCard({
  platform,
  status,
  info,
  user,
  error,
  onStart,
  onCheck,
  onCancel,
}) {
  const connected = status === 'authenticated'
  const busy = status === 'starting' || status === 'waiting'
  const avatarStyle = { '--platform-color': platform.color }

  function renderBody() {
    if (connected) {
      return (
        <div className="auth-success">
          <span className="auth-success-icon">
            <Check />
          </span>
          <div>
            <strong>Cuenta de {platform.name} conectada</strong>
            {user ? <p>Conectado como {user}</p> : null}
            <p>Ya puedes elegir tu playlist para migrar.</p>
          </div>
        </div>
      )
    }

    if (status === 'error') {
      return (
        <div className="auth-body">
          <p className="auth-error">{error}</p>
          <div className="auth-actions">
            <button type="button" className="btn-secondary" onClick={onStart}>
              Reintentar conexión
            </button>
            <button type="button" className="btn-ghost" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      )
    }

    if (status === 'starting') {
      return (
        <div className="auth-body">
          <p className="auth-muted">
            <Spinner />
            Solicitando enlace de autorización a {platform.name}…
          </p>
        </div>
      )
    }

    if (status === 'waiting') {
      return (
        <div className="auth-body">
          <p className="auth-steps">
            Abre el enlace, inicia sesión en {platform.name} e introduce el código
            para autorizar a Music Migrator.
          </p>
          <div className="auth-connect-box">
            <div className="auth-connect-item">
              <span className="auth-connect-label">Enlace</span>
              <a
                className="auth-url"
                href={info.verification_url}
                target="_blank"
                rel="noreferrer"
              >
                {info.verification_url}
              </a>
            </div>
            <div className="auth-connect-item">
              <span className="auth-connect-label">Código</span>
              <code className="auth-code">{info.user_code}</code>
            </div>
          </div>
          <p className="auth-muted">
            <Spinner />
            Esperando que autorices en otra ventana…
          </p>
          <div className="auth-actions">
            <button type="button" className="btn-secondary" onClick={onCheck}>
              Ya autoricé, verificar
            </button>
            <button type="button" className="btn-ghost" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="auth-body">
        <p className="auth-muted">
          Para ver tus playlists de {platform.name} primero debes autorizar tu cuenta.
        </p>
        <div className="auth-actions">
          <button type="button" className="primary-btn" onClick={onStart}>
            Conectar cuenta de {platform.name}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card" data-status={status} style={avatarStyle}>
      <div className="auth-head">
        <span className="auth-avatar">{platform.name.charAt(0)}</span>
        <div className="auth-title">
          <strong>Conectar {platform.name}</strong>
          <span>Tu cuenta quedará vinculada para esta migración.</span>
        </div>
        <StatusPill status={status} busy={busy} />
      </div>
      {renderBody()}
    </div>
  )
}