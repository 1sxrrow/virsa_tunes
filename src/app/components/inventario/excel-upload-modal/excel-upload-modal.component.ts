import {
  ChangeDetectorRef,
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
import { MessageService } from 'primeng/api';
import { IS_DEV_MODE } from 'src/app/app.module';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import {
  callModalToast,
  UploadEvent
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';

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
  carica: boolean = false;

  modalTitle: string;
  mode: string;
  FileExcel: File;

  constructor(
    private fb: FormBuilder,
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService,
    private messageService: MessageService,
    private cf: ChangeDetectorRef,
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
    this.carica = true;
    this.cf.detectChanges(); // Trigger change detection

    const worker = new Worker('/assets/workers/excel-worker.js');
    worker.postMessage({ file: this.FileExcel });

    worker.onmessage = async (event) => {
      const { itemList } = event.data;
      let itemCount = 0;

      await Promise.all(
        itemList.map((item: InventarioItemModel) =>
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
      );

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

      this.carica = false;
      this.cf.detectChanges(); // Trigger change detection
    };

    worker.onerror = (error) => {
      console.error('Error in worker:', error);
      this.carica = false;
      this.cf.detectChanges(); // Trigger change detection
    };
  }

  onUpload() {
    this.carica = true;
    this.cf.detectChanges(); // Trigger change detection
    this.getExcelData();
  }
}
