import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import { Table } from 'primeng/table';
import { Observable, Subscription } from 'rxjs';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
@Component({
  selector: 'telefoni-modal',
  templateUrl: './telefoni-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TelefoniModalComponent implements OnInit, OnDestroy {
  @ViewChild('table') table: Table;
  @Input() showTelefoniModal: boolean = false;
  @Output() showTelefoniModalChange = new EventEmitter<boolean>();

  telefoniShow$: Observable<any>;
  telefoniSubscription: Subscription;

  showListTelefoniModal: boolean = false;

  resultData = [];

  loadingTable: boolean = true;

  constructor(private firebaseStoreService: FirebaseStoreService) {}

  ngOnInit(): void {
    this.telefoniShow$ = this.firebaseStoreService.getTelefoniClienti();
    this.telefoniSubscription = this.telefoniShow$.subscribe((data) => {
      this.resultData = data;
      this.loadingTable = false;
    });
  }

  ngOnDestroy(): void {
    this.telefoniSubscription.unsubscribe();
  }

  handleClose() {
    this.showTelefoniModal = false;
    this.showTelefoniModalChange.emit(this.showTelefoniModal);
  }

  handleShowListTelefoniModalChange(show: boolean) {
    this.showListTelefoniModal = show;
  }

  filterTelefoni() {
    this.loadingTable = true;
  }

  async exportToCSV() {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Telefoni');

    // Add header row
    worksheet.addRow(['Cliente', 'Telefono']);

    // Add data rows
    const telefoniData = this.resultData;
    telefoniData.forEach((rowData) => {
      worksheet.addRow([rowData.cliente, `+39 ${rowData.telefono}`]);
    });

    // Generate buffer
    const buffer = await workbook.csv.writeBuffer();

    // Save to file
    const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, 'telefoni.csv');
  }
}
