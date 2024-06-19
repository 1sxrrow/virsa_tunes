import {
  CommonModule,
  CurrencyPipe,
  registerLocaleData,
} from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeIt from '@angular/common/locales/it';
import { isDevMode, LOCALE_ID, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { AngularFireModule, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import {
  prodFirebaseConfig,
  devFirebaseConfig,
} from 'src/environments/environment';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { InventarioItemListComponent } from './components/inventario/inventario-list/inventario-item-list.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { UserListComponent } from './components/user-data/user-list/user-list.component';
import { PersonalConfirmDialogModule } from './shared/components/confirm-dialog/confirm.dialog.module';
import { UppercaseFirstLetterPipe } from './shared/pipes/uppercase.pipe';
registerLocaleData(localeIt);

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}
const firebaseConfig = isDevMode() ? devFirebaseConfig : prodFirebaseConfig;
const dbname = isDevMode() ? 'dev' : 'prod';
@NgModule({
  declarations: [
    AppComponent,
    UserDataComponent,
    HeaderComponent,
    FooterComponent,
    UserListComponent,
    InventarioItemListComponent,
    UppercaseFirstLetterPipe,
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
    ToolbarModule,
    BreadcrumbModule,
    FileUploadModule,
    ProgressBarModule,
    MenuModule,
    OverlayPanelModule,
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
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
