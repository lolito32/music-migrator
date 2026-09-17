import { platformName } from '../../constants/platforms'
import { Check } from '../common/Icons'

export function PlatformSelector({ label, value, platforms, onSelect }) {
  const valueLabel = value ? platformName(value) : 'Sin seleccionar'

  return (
    <div>
      <div className="panel-head">
        <h3>{label}</h3>
        <span className="panel-val">{valueLabel}</span>
      </div>
      <div className="platform-list">
        {platforms.map((platform) => {
          const isSelected = value === platform.id
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
              onClick={() => onSelect(platform.id)}
            >
              <span className="opt-indicator">{isSelected ? <Check /> : null}</span>
              <span className="opt-name">{platform.name}</span>
              {!platform.available ? (
                <span className="opt-tag">Próximamente</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}