import {
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../login/auth.service';
import { MessageService } from 'primeng/api';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { IS_DEV_MODE } from 'src/app/app.module';
import {
  callModalToast,
  normalizeString,
  UploadEvent,
} from 'src/app/shared/utils/common-utils';
import { Workbook } from 'exceljs';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';

@Component({
  selector: 'excel-upload-modal',
  templateUrl: './excel-upload-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class ExcelUploadModalComponent implements OnInit {
  @Input() formData: FormGroup = undefined;
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter();

  isAdmin: boolean = false;
  loading: boolean = false;

  modalTitle: string;
  mode: string;
  FileExcel: File;

  constructor(
    private fb: FormBuilder,
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService,
    private messageService: MessageService,
    @Inject(IS_DEV_MODE) public isDevMode: boolean,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  ngOnInit(): void {
    this.modalTitle = 'Upload Excel';
  }

  handleClose() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
  }

  onUploadFile(event: UploadEvent) {
    this.FileExcel = event.files[0];
  }

  getExcelData() {
    const workbook = new Workbook();
    const reader = new FileReader();
    const itemList: InventarioItemModel[] = [];
    reader.onload = (event: any) => {
      const data = new Uint8Array(event.target.result);
      workbook.xlsx.load(data).then(() => {
        const worksheet = workbook.getWorksheet(1); // Get the first worksheet
        let itemCount = 0;
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber !== 1) {
            const rowData = row.values; // Get the row values
            let negozio = rowData[16] !== undefined ? rowData[16] : '';
            switch (negozio) {
              case 'Iseo':
                negozio = 'Negozio I';
                break;
              case 'Negozio I':
                negozio = 'Negozio I';
                break;
              case 'iseo':
                negozio = 'Negozio I';
                break;
              case 'brescia':
                negozio = 'Negozio B';
                break;
              case 'Brescia':
                negozio = 'Negozio B';
                break;
              case 'Negozio B':
                negozio = 'Negozio B';
                break;
              case 'magazzino':
                negozio = 'Magazzino';
                break;
              case 'Magazzino':
                negozio = 'Magazzino';
                break;
            }
            const itemData: InventarioItemModel = {
              marca:
                rowData[3] !== undefined ? normalizeString(rowData[3]) : '',
              nome: rowData[4] !== undefined ? rowData[4] : '',
              IMEI: rowData[5] !== undefined ? rowData[5] : '',
              colore: rowData[6] !== undefined ? rowData[6] : '',
              memoria: rowData[7] !== undefined ? rowData[7] : '',
              grado: rowData[8] !== undefined ? rowData[8].toString() : '',
              prezzo_acquisto: rowData[9] !== undefined ? rowData[9] : '',
              fornitore: rowData[10] !== undefined ? rowData[10] : '',
              quantita: rowData[11] !== undefined ? rowData[11] : '',
              perc_batteria: rowData[12] !== undefined ? rowData[12] : '',
              prezzo_negozio: rowData[13] !== undefined ? rowData[13] : '',
              prezzo_online: rowData[14] !== undefined ? rowData[14] : '',
              data: new Date(),
              garanzia_mesi: rowData[15] !== undefined ? rowData[15] : '',
              negozio,
              id: Math.floor(100000 + Math.random() * 900000),
            };
            if (itemData.IMEI !== '' && rowData[5] !== undefined) {
              itemList.push(itemData);
              console.log(`Row ${rowNumber}: ${rowData}`);
            } else if (itemData.IMEI === '' && rowData[5] !== undefined) {
              callModalToast(
                this.messageService,
                'Warning',
                `IMEI riga ${rowNumber} non presente`,
                'warn'
              );
            }
          }
        });

        Promise.all(
          itemList.map((item) =>
            this.firebaseStoreService.imeiArticolo(item.IMEI).then((data) => {
              if (data) {
                callModalToast(
                  this.messageService,
                  'Errore',
                  `IMEI ${item.IMEI} già presente`,
                  'error'
                );
              } else {
                item.listaStorico = [];
                const newItem = {
                  ...item,
                  imei: item.IMEI,
                  listaStorico: [],
                };
                this.firebaseStoreService.addArticoloInventario(newItem);
                itemCount++;
              }
            })
          )
        ).then(() => {
          if (itemCount !== 0) {
            callModalToast(
              this.messageService,
              'Aggiunti record',
              `${itemCount} ${
                itemCount > 1
                  ? 'Nuovo articolo aggiunto'
                  : 'Nuovi articoli aggiunti'
              }`
            );
            this.handleClose();
          }
        });
      });
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsArrayBuffer(this.FileExcel);
  }
}
