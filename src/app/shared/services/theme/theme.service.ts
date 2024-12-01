import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private renderer: Renderer2;
  private themeSubject: BehaviorSubject<string>;
  private readonly storageKey = 'selected-theme';
  private readonly lightTheme = 'theme-light';
  private readonly darkTheme = 'theme-dark';

  private lightThemeLinkId = 'light-theme';
  private darkThemeLinkId = 'dark-theme';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    const savedTheme = localStorage.getItem(this.storageKey) || this.lightTheme;
    this.themeSubject = new BehaviorSubject<string>(savedTheme);
    this.setTheme(savedTheme);
  }

  get theme$() {
    return this.themeSubject.asObservable();
  }

  switchTheme() {
    const newTheme =
      this.themeSubject.value === this.lightTheme
        ? this.darkTheme
        : this.lightTheme;
    this.setTheme(newTheme);
  }

  /**
   * Sets the specified theme
   * @param themeName Name of the theme to set
   */
  private setTheme(themeName: string) {
    const body = document.body;

    // Rimuovi il tema precedente
    this.renderer.removeClass(body, this.lightTheme);
    this.renderer.removeClass(body, this.darkTheme);

    // Aggiungi il nuovo tema
    this.renderer.addClass(body, themeName);

    if (themeName === this.lightTheme) {
      this.enableStylesheet(this.lightThemeLinkId);
      this.disableStylesheet(this.darkThemeLinkId);
    } else {
      this.enableStylesheet(this.darkThemeLinkId);
      this.disableStylesheet(this.lightThemeLinkId);
    }

    // Aggiorna BehaviorSubject e localStorage
    this.themeSubject.next(themeName);
    localStorage.setItem(this.storageKey, themeName);
  }

  /**
   * Abilita il foglio di stile del tema specificato
   * @param id ID del link del foglio di stile
   */
  private enableStylesheet(id: string) {
    let link = document.getElementById(id) as HTMLLinkElement;
    if (!link) {
      link = this.renderer.createElement('link');
      link.rel = 'stylesheet';
      link.id = id;
      link.href = this.getThemeHref(id);
      this.renderer.appendChild(document.head, link);
    } else {
      this.renderer.removeAttribute(link, 'disabled');
    }
  }
  /**
   * Disabilita il foglio di stile del tema specificato
   * @param id ID del link del foglio di stile
   */
  private disableStylesheet(id: string) {
    const link = document.getElementById(id) as HTMLLinkElement;
    if (link) {
      this.renderer.setAttribute(link, 'disabled', 'true');
    }
  }
  /**
   * Restituisce l'URL del foglio di stile in base all'ID
   * @param id ID del link del foglio di stile
   */
  private getThemeHref(id: string): string {
    if (id === this.lightThemeLinkId) {
      return 'assets/themes/lara-light-blue.css';
    } else if (id === this.darkThemeLinkId) {
      return 'assets/themes/lara-dark-blue.css';
    }
    return '';
  }

  /**
   * Gets the current theme
   */
  getCurrentTheme(): string {
    return this.themeSubject.value;
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem(this.storageKey) || this.lightTheme;
    this.setTheme(savedTheme);
  }
}
