import { SCHEMES, useTheme } from '@/store';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function ThemeControls() {
  const { mode, toggleMode, scheme, setScheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5">
        {SCHEMES.map((s) => (
          <button
            key={s.id}
            onClick={() => setScheme(s.id)}
            title={s.label}
            aria-label={s.label}
            className={`w-5 h-5 rounded-full transition ring-offset-2 ring-offset-transparent ${
              scheme === s.id ? 'ring-2 ring-ink scale-110' : 'hover:scale-110 opacity-70'
            }`}
            style={{ backgroundColor: s.swatch }}
          />
        ))}
      </div>
      <button
        onClick={toggleMode}
        title={mode === 'night' ? 'Denní režim' : 'Noční režim'}
        aria-label={mode === 'night' ? 'Přepnout na denní režim' : 'Přepnout na noční režim'}
        className="p-2 rounded-lg panel text-ink hover:text-accent transition"
      >
        {mode === 'night' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}
