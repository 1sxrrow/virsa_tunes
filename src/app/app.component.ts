import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateCustomService } from './shared/services/translation/translate-custom-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private config: PrimeNGConfig,
    private translateCustomService: TranslateCustomService
  ) {}

  ngOnInit(): void {
    this.translateCustomService;
    this.config.setTranslation({
      accept: 'Accept',
      reject: 'Cancel',
      //translations
    });
  }

  title = 'virsa_tunes';
}
