import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
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
import { TextareaModule } from 'primeng/textarea';
import { KeyFilterModule } from 'primeng/keyfilter';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PersonalConfirmDialogModule } from 'src/app/shared/components/confirm-dialog/confirm.dialog.module';
import { CustomSelectComponent } from '../components/items/custom-select/custom-select.component';
import { UppercaseFirstLetterPipe } from './pipes/uppercase.pipe';
import { CircleSpinnerComponent } from './components/circle-spinner/circle-spinner.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { InputGroupModule } from 'primeng/inputgroup';

@NgModule({
  declarations: [
    CustomSelectComponent,
    UppercaseFirstLetterPipe,
    TruncatePipe,
    CircleSpinnerComponent,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    TableModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    KeyFilterModule,
    DialogModule,
    TooltipModule,
    NgSelectModule,
    CheckboxModule,
    SelectButtonModule,
    CalendarModule,
    ToolbarModule,
    BreadcrumbModule,
    FileUploadModule,
    ProgressBarModule,
    TextareaModule,
    NgbModule,
    ButtonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayPanelModule,
    PersonalConfirmDialogModule,
    InputGroupModule,
  ],
  exports: [
    TableModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    KeyFilterModule,
    DialogModule,
    TooltipModule,
    NgSelectModule,
    CheckboxModule,
    SelectButtonModule,
    CalendarModule,
    ToolbarModule,
    BreadcrumbModule,
    FileUploadModule,
    ProgressBarModule,
    TextareaModule,
    TableModule,
    NgbModule,
    DialogModule,
    ButtonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayPanelModule,
    PersonalConfirmDialogModule,
    CustomSelectComponent,
    UppercaseFirstLetterPipe,
    TruncatePipe,
    CircleSpinnerComponent,
    InputGroupModule,
  ],
})
export class SharedModule {}
