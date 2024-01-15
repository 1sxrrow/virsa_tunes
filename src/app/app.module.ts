import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {
  CommonModule,
  CurrencyPipe,
  registerLocaleData,
} from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeIt from '@angular/common/locales/it';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { firebaseConfig } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { HeaderComponent } from './components/header/header.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { UserListComponent } from './components/user-data/user-list/user-list.component';
import { CircleSpinnerComponent } from './shared/components/circle-spinner/circle-spinner.component';
import { PersonalConfirmDialogModule } from './shared/components/confirm-dialog/confirm.dialog.module';
import { MessageService } from 'primeng/api';
import { FooterComponent } from './components/footer/footer.component';

registerLocaleData(localeIt);
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  declarations: [
    AppComponent,
    UserDataComponent,
    HeaderComponent,
    FooterComponent,
    UserListComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    NgbModule,
    ButtonModule,
    TableModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    KeyFilterModule,
    DialogModule,
    PersonalConfirmDialogModule,
    ToastModule,
    TooltipModule,
    NgSelectModule,
    CheckboxModule,
    SelectButtonModule,
    CalendarModule,
    MatListModule,
    MatSidenavModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideDatabase(() => getDatabase()),
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: firebaseConfig },
    CurrencyPipe,
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
