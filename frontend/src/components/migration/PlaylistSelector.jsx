import { Check } from '../common/Icons'

export function PlaylistSelector({ playlists, value, enabled, note, onSelect }) {
  const selected = playlists.find((item) => item.id === value) || null

  return (
    <>
      <div className="panel-head">
        <h3>Playlist</h3>
        <span className="panel-val">
          {selected
            ? `${selected.name} · ${selected.tracks} canciones`
            : 'Sin seleccionar'}
        </span>
      </div>
      {!enabled && note ? <p className="playlist-note">{note}</p> : null}
      <div className={enabled ? 'playlist-list' : 'playlist-list disabled'}>
        {playlists.map((item) => {
          const isSelected = value === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={'playlist-row' + (isSelected ? ' selected' : '')}
              disabled={!enabled}
              aria-pressed={isSelected}
              onClick={() => onSelect(isSelected ? null : item.id)}
            >
              <span className="playlist-cover" aria-hidden="true" />
              <span className="playlist-meta">
                <span className="playlist-name">{item.name}</span>
                <span className="playlist-count">{item.tracks} canciones</span>
              </span>
              <span className="playlist-check">{isSelected ? <Check /> : null}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}