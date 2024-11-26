import {
  CommonModule,
  CurrencyPipe,
  registerLocaleData,
} from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeIt from '@angular/common/locales/it';
import { APP_INITIALIZER, isDevMode, LOCALE_ID, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import {
  devFirebaseConfig,
  prodFirebaseConfig,
} from 'src/environments/environment';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SharedModule } from './shared/shared.module';
import { ThemeService } from './shared/services/theme/theme.service';
registerLocaleData(localeIt);

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

export function initializeThemeApp(themeService: ThemeService) {
  return () => themeService.initializeTheme();
}
const firebaseConfig = prodFirebaseConfig;
const dbname = 'prod';
@NgModule({
  declarations: [AppComponent, HeaderComponent, FooterComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    ToastModule,
    MenuModule,
    SharedModule,
    RouterModule.forRoot(routes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig, dbname)),
    provideDatabase(() => getDatabase()),
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: firebaseConfig },
    CurrencyPipe,
    { provide: LOCALE_ID, useValue: 'it-IT' },
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeThemeApp,
      deps: [ThemeService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
