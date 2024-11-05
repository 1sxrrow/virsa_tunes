import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';
import { ToolbarModule } from 'primeng/toolbar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PersonalConfirmDialogModule } from 'src/app/shared/components/confirm-dialog/confirm.dialog.module';
import { CustomSelectComponent } from '../components/items/custom-select/custom-select.component';
import { UppercaseFirstLetterPipe } from './pipes/uppercase.pipe';

@NgModule({
  declarations: [CustomSelectComponent, UppercaseFirstLetterPipe],
  imports: [
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
    InputTextareaModule,
    NgbModule,
    ButtonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayPanelModule,
    PersonalConfirmDialogModule,
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
    InputTextareaModule,
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
  ],
})
export class SharedModule {}
