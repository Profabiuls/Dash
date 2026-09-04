import { getElement, getOptionalElement } from '../utils/dom.js';

/**
 * Tabs accessibili da tastiera e da mouse.
 *
 * Implementa il pattern ARIA per tablist:
 * - frecce sinistra/destra per muoversi tra i tab
 * - tasto Home/End per il primo/ultimo tab
 * - attributi aria-selected e tabindex gestiti dinamicamente
 */

const TAB_SELECTOR = '[role="tab"]';

export function initializeTabs(tabListSelector: string): void {
  const tabList = getElement<HTMLElement>(tabListSelector);
  const tabs = Array.from(tabList.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR));
  const tabContents = new Map<string, HTMLElement>();

  tabs.forEach((tab) => {
    const panelId = `${tab.dataset.tab}-tab`;
    const panel = getOptionalElement<HTMLElement>(`#${panelId}`);
    if (panel) {
      tab.setAttribute('aria-controls', panelId);
      panel.setAttribute('aria-labelledby', tab.id || panelId);
      tabContents.set(tab.dataset.tab ?? '', panel);
    }

    tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');
  });

  function activateTab(targetTab: HTMLButtonElement): void {
    tabs.forEach((tab) => {
      const isSelected = tab === targetTab;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    tabContents.forEach((panel, key) => {
      const isActive = key === targetTab.dataset.tab;
      panel.classList.toggle('active', isActive);
    });

    targetTab.focus();
  }

  function moveFocus(currentIndex: number, direction: number): void {
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    activateTab(tabs[nextIndex]);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));

    tab.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          moveFocus(index, 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          moveFocus(index, -1);
          break;
        case 'Home':
          event.preventDefault();
          activateTab(tabs[0]);
          break;
        case 'End':
          event.preventDefault();
          activateTab(tabs[tabs.length - 1]);
          break;
        default:
          break;
      }
    });
  });
}
