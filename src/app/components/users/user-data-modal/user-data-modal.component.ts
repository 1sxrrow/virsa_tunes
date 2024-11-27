import { formatDate } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
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
import { finalize } from 'rxjs';
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
import { costoStorico } from 'src/app/shared/models/custom-interfaces';

@Component({
  selector: 'user-data-modal',
  templateUrl: 'user-data-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class UserDataModalComponent implements OnInit {
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

  listaStorico: costoStorico[] = [];
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
        this.translate
          .get('user_data.title.USER_DATA_MODAL_ADD_TITLE')
          .subscribe((res) => {
            this.modalTitle = res;
          });
        this.handleInitialAddMode();
        break;
      case 'Edit':
        this.translate
          .get('user_data.title.USER_DATA_MODAL_EDIT_TITLE')
          .subscribe((res) => {
            this.modalTitle = res;
          });
        this.handleEditMode(
          this.userDataModalService.getIntervento(this.formData)
        );
        break;
    }

    keylistener(this.isDevMode);
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
    this.formData.get('tipo_intervento').valueChanges.subscribe((value) => {});
  }

  handleAddMode(type: string): void {
    switch (type) {
      case 'Vendita':
        this.initVenditaFormGroup();
        break;
      case 'Riparazione':
        this.initRiparazioneFormGroup();
        break;
    }
  }

  handleEditMode(type: string): void {
    this.setInterventiAggiuntivi();
    this.setListaStorico();
    switch (type) {
      case 'Vendita':
        this.checkedPermuta = this.formData.get('checkedPermuta').value;
        this.formData.get('checkedPermuta').valueChanges.subscribe((value) => {
          this.checkedPermuta = value;
        });
        if (this.checkedPermuta) {
          if (this.storage.input.selectedItem.files) {
            this.uploadedFiles = Object.values(
              this.storage.input.selectedItem.files
            );
          }
        }
        this.checkedProdottiAggiuntivi = this.formData.get(
          'checkedProdottiAggiuntivi'
        ).value;
        this.formData
          .get('checkedProdottiAggiuntivi')
          .valueChanges.subscribe((value) => {
            this.checkedProdottiAggiuntivi = value;
          });
        this.initVenditaFormGroup();
        break;
      case 'Riparazione':
        this.initRiparazioneFormGroup();
        break;
    }
  }

  initVenditaFormGroup() {
    this.showFields = true;
    this.showFieldsRiparazione = false;
    this.showFieldsVendita = true;
    if (!this.formData) {
      this.formData = new FormGroup({
        tipo_intervento: new FormControl(
          this.userDataModalService.getIntervento(this.formData),
          Validators.required
        ),
        costo: new FormControl('', Validators.required),
        costo_sconto: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        modalita_pagamento: new FormControl('', Validators.required),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        tipo_prodotto: new FormControl('', Validators.required),
        imei: new FormControl('', []),
        garanzia: new FormControl('', Validators.required),
        checkedProdottiAggiuntivi: new FormControl(''),
        checkedPermuta: new FormControl('', []),
        costoPermuta: new FormControl('', []),
        negozio: new FormControl('', Validators.required),
      });
    }
  }
  initRiparazioneFormGroup() {
    this.showFields = true;
    this.showFieldsVendita = false;
    this.showFieldsRiparazione = true;
    if (!this.formData) {
      this.formData = new FormGroup({
        tipo_intervento: new FormControl(
          this.userDataModalService.getIntervento(this.formData),
          Validators.required
        ),
        problema: new FormControl('', Validators.required),
        tipo_parte: new FormControl('', Validators.required),
        costo: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        imei: new FormControl('', []),
        checkedProdottiAggiuntivi: new FormControl(''),
        data_consegna_riparazione: new FormControl('', Validators.required),
        codice_sblocco: new FormControl(''),
        caparra: new FormControl(''),
        nome_fornitore_pezzo: new FormControl(''),
        data_rest_dispositivo_cliente: new FormControl(''),
        costoCambio: new FormControl(''),
        negozio: new FormControl(''),
        note: new FormControl(''),
      });
    }
  }

  private setInterventiAggiuntivi() {
    if (this.storage.input.selectedItem.prodottiAggiuntivi) {
      let array = Object.values(
        this.storage.input.selectedItem.prodottiAggiuntivi
      );
      array.forEach((item) => {
        if (!item.id) {
          item.id = Math.random().toString(36).substr(2, 9);
        }
      });
      this.prodottiAggiuntivi = array;
    } else {
      this.prodottiAggiuntivi = [];
    }
  }

  private setListaStorico() {
    if (this.storage.input.selectedItem.listaStorico) {
      let array = Object.values(this.storage.input.selectedItem.listaStorico);
      array.forEach((item) => {
        if (!item.id) {
          item.id = Math.random().toString(36).substr(2, 9);
        }
      });
      this.listaStorico = array;
    } else {
      this.listaStorico = [];
    }
  }

  get listaStoricoLength() {
    return this.listaStorico.length;
  }

  addCostoStoricoList() {
    this.listaStorico.push({
      id: Math.random().toString(36).substr(2, 9),
      prezzo: this.formData.get('costo').value,
      data: formatDate(new Date(), 'dd/MM/yyyy', this.locale),
    });
  }

  async addNewInterventoModal() {
    await this.userDataService
      .addNewIntervento(
        new SpecificDataModel(this.formData.value),
        this.storage.input.userData,
        this.prodottiAggiuntivi,
        this.uploadedFiles,
        this.listaStorico
      )
      .then((result) => {
        if (result) {
          this.showModal = !this.showModal;
          callModalToast(
            this.messageService,
            'Aggiunto',
            'Nuovo intervento aggiunto'
          );
        } else {
          callModalToast(
            this.messageService,
            'Errore',
            'Articolo non disponibile',
            'error'
          );
        }
      });
  }

  //Metodo di modifica scatenato alla pressione del pulsante di modifica nel componentø
  modifyUserIntervento() {
    this.userDataService.modifyIntervento(
      this.storage.input.id,
      new SpecificDataModel(this.formData.getRawValue()),
      this.prodottiAggiuntivi,
      this.storage.input.userData,
      this.uploadedFiles,
      this.listaStorico
    );

    this.showModal = !this.showModal;
    callModalToast(
      this.messageService,
      'Modificato',
      'Utente modificato',
      'info'
    );
  }

  onOptionSelected(selectEventEmitterObject: selectEventEmitterObject) {
    this.formData
      .get(selectEventEmitterObject.formControlName)
      .setValue(selectEventEmitterObject.value);
    if (selectEventEmitterObject.formControlName === 'tipo_intervento') {
      this.setValuesForm();
    }
  }

  private setValuesForm() {
    if (this.userDataModalService.getIntervento(this.formData) == 'Vendita') {
      this.showFields = true;
      this.showFieldsRiparazione = false;
      this.showFieldsVendita = true;
      this.formData = new FormGroup({
        tipo_intervento: new FormControl(
          this.userDataModalService.getIntervento(this.formData),
          Validators.required
        ),
        costo: new FormControl('', Validators.required),
        costo_sconto: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        modalita_pagamento: new FormControl('', Validators.required),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        tipo_prodotto: new FormControl('', Validators.required),
        imei: new FormControl('', []),
        garanzia: new FormControl('', Validators.required),
        checkedProdottiAggiuntivi: new FormControl(''),
        checkedPermuta: new FormControl('', []),
        costoPermuta: new FormControl('', []),
        negozio: new FormControl('', Validators.required),
      });
    } else {
      this.showFields = true;
      this.showFieldsVendita = false;
      this.showFieldsRiparazione = true;
      this.formData = new FormGroup({
        tipo_intervento: new FormControl(
          this.userDataModalService.getIntervento(this.formData),
          Validators.required
        ),
        problema: new FormControl('', Validators.required),
        tipo_parte: new FormControl('', Validators.required),
        costo: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        imei: new FormControl('', []),
        checkedProdottiAggiuntivi: new FormControl(''),
        data_consegna_riparazione: new FormControl('', Validators.required),
        codice_sblocco: new FormControl(''),
        caparra: new FormControl(''),
        nome_fornitore_pezzo: new FormControl(''),
        data_rest_dispositivo_cliente: new FormControl(''),
        costoCambio: new FormControl(''),
        negozio: new FormControl(''),
        note: new FormControl(''),
      });
    }
  }

  checkCongruenzaProdottiAggiuntivi() {
    let checkedValue = this.formData.value['checkedProdottiAggiuntivi'];
    if (checkedValue && this.prodottiAggiuntivi.length < 1) {
      checkedValue = false;
    }
    return checkedValue;
  }

  // Metodi per p-FileUpload
  onUpload(event: UploadEvent) {
    for (let file of event.files) {
      this.uploadedFilesDone = false;
      this.isUploading = true;
      // Storage path && upload task
      const filePath = `files/${this.storage.input.id}/${this.storage.input.userData.nome}_${this.storage.input.userData.cognome}_${file.name}`;
      const storageRef = this.firebaseStorage.ref(filePath);
      const uploadTask = this.firebaseStorage.upload(filePath, file);
      // Monitor uploading process
      uploadTask.percentageChanges().subscribe((percentage) => {
        this.percentage = Math.round(percentage);
        if (percentage === 100) {
          this.percentage = 0;
          this.isUploading = false;
        }
      });

      uploadTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
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
              callModalToast(
                this.messageService,
                'File Caricato',
                'Il file è stato caricato correttamente',
                'info'
              );
            });
          })
        )
        .subscribe();
    }
  }

  onRemove(event: FileRemoveEvent) {
    // X su singolo elemento della lista
    this.uploadedFiles.forEach((item) => {
      if (item.file.filename === event.file.name) {
        this.firebaseStorage.storage
          .refFromURL(item.uploadURL)
          .delete()
          .then(() => {
            callModalToast(
              this.messageService,
              'File Rimosso',
              'Il file è stato rimosso',
              'info'
            );
            console.log('File deleted successfully');
          })
          .catch((error) => {
            callModalToast(
              this.messageService,
              'Errore rimozione',
              'Il file non è stato rimosso',
              'error'
            );
          });
        this.uploadedFiles.splice(this.uploadedFiles.indexOf(item), 1);
      }
    });
  }

  onClear(event: Event) {
    // X per rimozione di tutti gli elementi
    this.uploadedFiles.forEach((item) => {
      this.firebaseStorage.storage
        .refFromURL(item.uploadURL)
        .delete()
        .then(() => {
          callModalToast(
            this.messageService,
            'File Rimosso',
            'Il file è stato rimosso',
            'info'
          );
          console.log('File deleted successfully');
        })
        .catch((error) => {
          callModalToast(
            this.messageService,
            'Errore rimozione',
            'Il file non è stato rimosso',
            'error'
          );
        });
    });
    this.uploadedFiles = [];
  }

  downloadFile(downloadUrl: string) {
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
          console.log(item);
          this.formData.patchValue({
            modello_telefono: item[0]['nome'],
            costo: +item[0]['prezzo_negozio'],
            marca_telefono: item[0]['marca'],
            tipo_prodotto: this.determineTipoProdotto(item[0]['grado']),
          });
          callModalToast(this.messageService, 'Completato', 'Dati valorizzati');
        } else {
          callModalToast(
            this.messageService,
            'Attenzione',
            'IMEI non presente',
            'warn'
          );
        }
      });
  }

  determineTipoProdotto(grado: string): string {
    return grado === 'Nuovo' ? 'Nuovo' : 'Usato';
  }

  findInvalidControls() {
    findInvalidControls(this.formData);
  }

  myModelChanged(event) {}
}
