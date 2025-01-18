import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent } from 'primeng/fileupload';
import { finalize, Subscription } from 'rxjs';
import { IS_DEV_MODE } from 'src/app/app.module';
import { prodottiAggiuntivi } from 'src/app/shared/models/prodotti-aggiuntivi.model';
import { SpecificDataModel } from 'src/app/shared/models/specific-data.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { selectEventEmitterObject } from 'src/app/shared/types/custom-types';
import {
  callModalToast,
  createForm,
  FileUpload,
  findInvalidControls,
  keylistener,
  UploadEvent,
} from 'src/app/shared/utils/common-utils';
import { UserDataService } from '../user-data/user-data.service';
import { userDataModalStorage } from './user-data-modal-storage.service';
import { UserDataModalService } from './user-data-modal.service';

@Component({
  selector: 'user-data-modal',
  templateUrl: 'user-data-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDataModalComponent implements OnInit, OnDestroy {
  @Input() formData: FormGroup = undefined;
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter();

  @ViewChild('quantitaProdottoInput') quantitaProdottoInput: ElementRef;
  @ViewChild('nomeProdottoInput') nomeProdottoInput: ElementRef;
  @ViewChild('costoProdottoInput') costoProdottoInput: ElementRef;

  mode: string;
  showFieldsRiparazione: boolean;
  showFieldsVendita: boolean;
  showFields: boolean;
  modalTitle: string;

  prodottiAggiuntivi: prodottiAggiuntivi[] = [];
  checkedProdottiAggiuntivi: boolean = false;
  checkedPermuta: boolean = false;

  uploadedFiles: FileUpload[] = [];
  uploadedFilesDone = false;
  percentage: number = 0;
  isUploading = false;

  storedSubscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private storage: userDataModalStorage,
    private userDataModalService: UserDataModalService,
    private userDataService: UserDataService,
    private translate: TranslateService,
    private messageService: MessageService,
    private firebaseStorage: AngularFireStorage,
    private firebaseStoreService: FirebaseStoreService,
    @Inject(LOCALE_ID) public locale: string,
    @Inject(IS_DEV_MODE) public isDevMode: boolean
  ) {}

  ngOnInit(): void {
    this.formData = this.storage.input.selectedItem
      ? createForm(
          this.fb,
          this.storage.input.selectedItem,
          this.storage.input.selectedItem.tipo_intervento
        )
      : undefined;
    this.mode = this.formData ? 'Edit' : 'Add';
    switch (this.mode) {
      case 'Add':
        this.storedSubscriptions.add(
          this.translate
            .get('user_data.title.USER_DATA_MODAL_ADD_TITLE')
            .subscribe((res) => {
              this.modalTitle = res;
            })
        );
        this.handleInitialAddMode();
        break;
      case 'Edit':
        this.storedSubscriptions.add(
          this.translate
            .get('user_data.title.USER_DATA_MODAL_EDIT_TITLE')
            .subscribe((res) => {
              this.modalTitle = res;
            })
        );
        this.dateFieldsFix();
        this.handleEditMode(
          this.userDataModalService.getIntervento(this.formData)
        );
        break;
    }

    keylistener(this.isDevMode);
  }

  ngOnDestroy(): void {
    if (this.storedSubscriptions) {
      this.storedSubscriptions.unsubscribe();
    }
  }

  get tipoInterventoDataSet() {
    return this.userDataModalService.getTipoInterventoDataSet();
  }

  get condizioniProdottoDataSet() {
    return this.userDataModalService.getCondizioniProdottoDataSet();
  }

  get tipoPagamentoDataSet() {
    return this.userDataModalService.getTipoPagamentoDataSet();
  }

  get tipoParteDataSet() {
    return this.userDataModalService.getTipoParteDataSet();
  }

  get mesiGaranziaDataSet() {
    return this.userDataModalService.getMesiGaranziaDataSet();
  }

  get negozioDataSet() {
    return this.userDataModalService.getNegozioDataSet();
  }

  handleClose() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
  }

  handleInitialAddMode() {
    this.formData = new FormGroup({
      tipo_intervento: new FormControl('', Validators.required),
    });
    this.storedSubscriptions.add(
      this.formData.get('tipo_intervento')?.valueChanges.subscribe((value) => {})
    );
  }

  handleEditMode(type: string): void {
    this.prodottiAggiuntivi = this.userDataModalService.setInterventiAggiuntivi(
      this.storage.input.selectedItem
    );
    switch (type) {
      case 'Vendita':
        this.checkedPermuta = this.formData.get('checkedPermuta')?.value;
        this.storedSubscriptions.add(
          this.formData
            .get('checkedPermuta')
            ?.valueChanges.subscribe((value) => {
              this.checkedPermuta = value;
            })
        );
        if (this.checkedPermuta) {
          if (this.storage.input.selectedItem.files) {
            this.uploadedFiles = Object.values(
              this.storage.input.selectedItem.files
            );
          }
        }
        this.checkedProdottiAggiuntivi = this.formData.get(
          'checkedProdottiAggiuntivi'
        )?.value;
        this.storedSubscriptions.add(
          this.formData
            .get('checkedProdottiAggiuntivi')
            ?.valueChanges.subscribe((value) => {
              this.checkedProdottiAggiuntivi = value;
            })
        );
        this.initFieldsAndFormGroup('Vendita');
        break;
      case 'Riparazione':
        this.checkedProdottiAggiuntivi = this.formData.get(
          'checkedProdottiAggiuntivi'
        )?.value;
        this.storedSubscriptions.add(
          this.formData
            .get('checkedProdottiAggiuntivi')
            ?.valueChanges.subscribe((value) => {
              this.checkedProdottiAggiuntivi = value;
            })
        );

        this.initFieldsAndFormGroup('Riparazione');
        break;
    }
  }

  initFieldsAndFormGroup(intervento: string) {
    this.showFields = true;
    this.showFieldsRiparazione = intervento === 'Riparazione' ? true : false;
    this.showFieldsVendita = intervento === 'Vendita' ? true : false;
    this.formData = this.userDataModalService.initFormGroup(this.formData);
  }

  async addIntervento() {
    const filteredData = this.userDataModalService.getFilteredFormData(
      this.formData
    );
    this.userDataService
      .addNewIntervento(
        new SpecificDataModel(filteredData),
        this.storage.input.userData,
        this.prodottiAggiuntivi,
        this.uploadedFiles
      )
      .then((result) => {
        if (result) {
          this.showModal = !this.showModal;
          //prettier-ignore
          callModalToast(this.messageService, 'Aggiunto', 'Nuovo intervento aggiunto');
        } else {
          //prettier-ignore
          callModalToast(this.messageService, 'Errore', 'Articolo non disponibile', 'error');
        }
      });
  }

  /*
   * Metodo di modifica scatenato alla pressione del pulsante di modifica nel component
   */
  updateIntervento() {
    this.userDataService.modifyIntervento(
      this.storage.input.id,
      new SpecificDataModel(this.formData.getRawValue()),
      this.prodottiAggiuntivi,
      this.storage.input.userData,
      this.uploadedFiles
    );

    this.showModal = !this.showModal;
    // prettier-ignore
    callModalToast(this.messageService, 'Modificato', 'Utente modificato', 'info');
  }

  /*
   * Metodo di modifica valore scatenato dalle dropdown
   */
  onOptionSelected(selectEventEmitterObject: selectEventEmitterObject) {
    this.formData
      .get(selectEventEmitterObject.formControlName)
      .setValue(selectEventEmitterObject.value);
    if (selectEventEmitterObject.formControlName === 'tipo_intervento') {
      this.setValuesForm();
    }
  }

  /*
   * Metodo per visualizzare campi in base all'intervento selezionato
   */
  private setValuesForm() {
    if (this.userDataModalService.getIntervento(this.formData) == 'Vendita') {
      this.initFieldsAndFormGroup('Vendita');
    } else {
      this.initFieldsAndFormGroup('Riparazione');
    }
  }

  checkCongruenzaProdottiAggiuntivi() {
    let checkedValue = this.formData.value['checkedProdottiAggiuntivi'];
    if (checkedValue && this.prodottiAggiuntivi.length < 1) {
      checkedValue = false;
    }
    return checkedValue;
  }

  /*
   * Metodi per p-FileUpload
   */
  onUpload(event: UploadEvent) {
    for (let file of event.files) {
      this.uploadedFilesDone = false;
      this.isUploading = true;
      // Storage path && upload task
      const filePath = `files/${this.storage.input.id}/${this.storage.input.userData.nome}_${this.storage.input.userData.cognome}_${file.name}`;
      const storageRef = this.firebaseStorage.ref(filePath);
      const uploadTask = this.firebaseStorage.upload(filePath, file);
      // Monitor uploading process
      this.storedSubscriptions.add(
        uploadTask.percentageChanges().subscribe((percentage) => {
          this.percentage = Math.round(percentage);
          if (percentage === 100) {
            this.percentage = 0;
            this.isUploading = false;
          }
        })
      );

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            this.storedSubscriptions.add(
              storageRef.getDownloadURL().subscribe((downloadURL) => {
                console.log(`File available at ${downloadURL}`);
                if (this.uploadedFiles === undefined) {
                  this.uploadedFiles = [];
                }
                this.uploadedFiles.push({
                  file: {
                    filename: file.name,
                    filetype: file.type,
                    filesize: file.size,
                    addDate: new Date(),
                  },
                  filePath: filePath,
                  uploadURL: downloadURL,
                });
                this.uploadedFilesDone = true;
                // prettier-ignore
                callModalToast(this.messageService, 'File Caricato', 'Il file è stato caricato correttamente', 'info');
              })
            );
          })
        )
        .subscribe();
    }
  }
  /*
   * Pressione tasto di rimozione su singolo elemento lista file in permuta
   */
  onRemove(event: FileRemoveEvent) {
    this.uploadedFiles.forEach((item) => {
      if (item.file.filename === event.file.name) {
        this.firebaseStorage.storage
          .refFromURL(item.uploadURL)
          .delete()
          .then(() => {
            // prettier-ignore
            callModalToast(this.messageService, 'File Rimosso', 'Il file è stato rimosso', 'info' );
          })
          .catch((error) => {
            // prettier-ignore
            callModalToast( this.messageService, 'Errore rimozione', 'Il file non è stato rimosso', 'error');
            console.log(error);
          });
        this.uploadedFiles.splice(this.uploadedFiles.indexOf(item), 1);
      }
    });
  }

  /*
   * Pressione tasto di rimozione di tutti gli elementi in lista file in permuta
   */
  onClear(event: Event) {
    this.uploadedFiles.forEach((item) => {
      this.firebaseStorage.storage
        .refFromURL(item.uploadURL)
        .delete()
        .then(() => {
          // prettier-ignore
          callModalToast(this.messageService, 'File Rimosso', 'Il file è stato rimosso', 'info');
        })
        .catch((error) => {
          // prettier-ignore
          callModalToast(this.messageService, 'Errore rimozione', 'Il file non è stato rimosso', 'error');
          console.log(error);
        });
    });
    this.uploadedFiles = [];
  }

  downloadFile(downloadUrl: string) {
    this.storedSubscriptions.add(
      this.firebaseStorage
        .refFromURL(downloadUrl)
        .getDownloadURL()
        .subscribe(
          (url) => {
            // Fetch the file
            fetch(url).then((response) => {
              response.blob().then((blob) => {
                // Use FileSaver to save the blob
                const filename = url.split('/').pop().split('?')[0]; // Extract filename from URL
                saveAs(blob, filename || 'downloaded-file');
              });
            });
          },
          (error) => {
            console.error('Error downloading file:', error);
            // Handle any errors here, such as showing an error message to the user
          }
        )
    );
  }

  addProdottoAggiuntivi(quantita: number, nome: string, costo: number) {
    if (quantita != 0 && nome != '' && costo != 0) {
      this.prodottiAggiuntivi.push({
        quantita: quantita,
        nomeProdotto: nome,
        costo: costo,
        id: Math.random().toString(36).substr(2, 9),
      });
    }
    this.quantitaProdottoInput.nativeElement.value = '';
    this.nomeProdottoInput.nativeElement.value = '';
    this.costoProdottoInput.nativeElement.value = '';
  }

  removeProdottoAggiuntivi(prodotto: prodottiAggiuntivi) {
    let index = this.prodottiAggiuntivi.indexOf(prodotto, 1);
    this.prodottiAggiuntivi.splice(index, 1);
  }

  changeValueProdottoAggiuntivi(
    id: string,
    costo: number,
    nome: string,
    quantita: number
  ) {
    this.prodottiAggiuntivi.forEach((item) => {
      item.id === id
        ? ((item.costo = costo),
          (item.quantita = quantita),
          (item.nomeProdotto = nome))
        : null;
    });
  }

  checkImei() {
    this.firebaseStoreService
      .imeiArticolo(this.formData.value['imei'])
      .then((data) => {
        if (data) {
          let item = Object.values(data);
          if (item[0]['quantita'] > 0) {
            this.formData.patchValue({
              modello_telefono: item[0]['nome'],
              costo: +item[0]['prezzo_negozio'],
              marca_telefono: item[0]['marca'],
              tipo_prodotto: this.userDataModalService.getTipoProdotto(
                item[0]['grado']
              ),
            });
            // prettier-ignore
            callModalToast(this.messageService, 'Completato', 'Dati valorizzati');
          } else {
            // prettier-ignore
            callModalToast(this.messageService, 'Errore', 'Quantità articolo a zero', 'error');
          }
        } else {
          // prettier-ignore
          callModalToast(this.messageService, 'Attenzione', 'IMEI non presente', 'warn');
        }
      });
  }

  findInvalidControls() {
    findInvalidControls(this.formData);
  }

  enterCheck() {
    if (this.mode === 'Edit' && this.formData.valid && this.formData.dirty) {
      this.updateIntervento();
    }
    if (this.mode === 'Add' && this.formData.valid) {
      this.addIntervento();
    }
  }

  dateFieldsFix() {
    if (this.formData.value['data_consegna_riparazione']) {
      let valueDataConsegnaRiparazione = new Date(
        this.formData.value['data_consegna_riparazione']
      );
      this.formData.patchValue({
        data_consegna_riparazione: valueDataConsegnaRiparazione,
      });
    }
    if (this.formData.value['data_rest_dispositivo_cliente']) {
      let valueDataRestDispositivoCliente = new Date(
        this.formData.value['data_rest_dispositivo_cliente']
      );
      this.formData.patchValue({
        data_rest_dispositivo_cliente: valueDataRestDispositivoCliente,
      });
    }
  }

  myModelChanged(event) {}
}
