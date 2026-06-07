import { useTranslation } from 'react-i18next';

export function LangToggle() {
  const { i18n } = useTranslation();
  const set = (lng: 'cs' | 'en') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
  };
  return (
    <div className="flex gap-1 text-sm">
      {(['cs', 'en'] as const).map((lng) => (
        <button
          key={lng}
          onClick={() => set(lng)}
          className={`px-2 py-1 rounded transition ${
            i18n.language === lng ? 'bg-accent text-accent-ink' : 'bg-line/40 text-muted hover:text-ink'
          }`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
