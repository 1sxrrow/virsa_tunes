import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class TranslateCustomService {
  constructor(
    public primeNgConfig: PrimeNGConfig,
    public translateService: TranslateService
  ) {
    this.translateService.addLangs(['it', 'en']);
    this.translateService.setDefaultLang('it');

    const browserLang = this.translateService.getBrowserLang();
    let lang = browserLang.match(/it|en/) ? browserLang : 'it';
    this.changeLang(lang);
    this.translateService.stream('primeng').subscribe((data) => {
      this.primeNgConfig.setTranslation(data);
    });
  }

  changeLang(lang: string) {
    this.translateService.use(lang);
  }
}
