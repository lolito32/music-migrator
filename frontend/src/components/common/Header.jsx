import { BrandMark, MoonIcon, SunIcon } from './Icons'

export function Header({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <div className="brand">
          <BrandMark />
          <span>Music Migrator</span>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  )
}