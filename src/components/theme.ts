import { getStoredItem, setStoredItem } from '../utils/storage.js';
import { getElement } from '../utils/dom.js';

/**
 * Gestione del tema chiaro/scuro.
 *
 * Il tema viene salvato in localStorage e applicato come attributo
 * sull'elemento <html>, sfruttando le variabili CSS definite in SCSS.
 */

const THEME_STORAGE_KEY = 'dashboard-theme';
const THEME_ATTRIBUTE = 'data-theme';
type Theme = 'light' | 'dark';

const getStoredTheme = (): Theme => {
  const stored = getStoredItem(THEME_STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
};

const updateThemeColorMeta = (theme: Theme): void => {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) return;

  // Colore della barra del browser in linea con lo sfondo del tema.
  meta.content = theme === 'dark' ? '#141414' : '#E4EBF5';
};

const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  updateThemeColorMeta(theme);
};

const updateToggleVisualState = (button: HTMLButtonElement, isDark: boolean): void => {
  button.setAttribute('aria-pressed', String(isDark));
};

export function initializeTheme(): void {
  const toggleButton = getElement<HTMLButtonElement>('#theme-toggle');
  const initialTheme = getStoredTheme();

  applyTheme(initialTheme);
  updateToggleVisualState(toggleButton, initialTheme === 'dark');

  toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE) === 'dark'
      ? 'dark'
      : 'light';
    const nextTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

    applyTheme(nextTheme);
    setStoredItem(THEME_STORAGE_KEY, nextTheme);
    updateToggleVisualState(toggleButton, nextTheme === 'dark');
  });
}
