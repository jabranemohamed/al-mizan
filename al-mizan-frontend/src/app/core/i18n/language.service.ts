import { Injectable, signal, computed, effect } from '@angular/core';
import { TRANSLATIONS, Lang } from './translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {

  private readonly LANG_KEY = 'mizan_lang';

  readonly currentLang = signal<Lang>(this.loadLang());
  readonly isRtl = computed(() => this.currentLang() === 'ar');

  constructor() {
    effect(() => {
      const lang = this.currentLang();
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    });
  }

  t(key: string): string {
    return TRANSLATIONS[this.currentLang()][key] ?? key;
  }

  setLang(lang: Lang): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  actionName(action: { nameAr: string; nameFr: string; nameEn: string }): string {
    switch (this.currentLang()) {
      case 'ar': return action.nameAr;
      case 'en': return action.nameEn;
      default: return action.nameFr;
    }
  }

  private loadLang(): Lang {
    const stored = localStorage.getItem(this.LANG_KEY);
    if (stored === 'fr' || stored === 'en' || stored === 'ar') return stored;
    return 'fr';
  }
}