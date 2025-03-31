import { formatDate } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';
import { IS_DEV_MODE } from 'src/app/app.module';
import { costoStorico } from 'src/app/shared/models/custom-interfaces';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { FirebaseListService } from 'src/app/shared/services/firebase/firebase-list.service';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { selectDataSet } from 'src/app/shared/types/custom-types';
import {
  callModalToast,
  createForm,
  findInvalidControls,
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { InventarioModalStorage } from './inventario-modal-storage.service';

@Component({
  selector: 'inventario-modal',
  templateUrl: './inventario-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class InventarioModalComponent implements OnInit, OnDestroy {
  @Input() formData: FormGroup = undefined;
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter();

  isAdmin: boolean = false;
  loading: boolean = false;

  modalTitle: string;
  mode: string;

  listaStorico: costoStorico[] = [];

  private negozioDataSetSubject = new BehaviorSubject<selectDataSet[]>([]);
  public negozioDataSet$: Observable<selectDataSet[]> =
    this.negozioDataSetSubject.asObservable();
  private gradoDataSetSubject = new BehaviorSubject<selectDataSet[]>([]);
  public gradoDataSet$: Observable<selectDataSet[]> =
    this.gradoDataSetSubject.asObservable();
  private garanziaDataSetSubject = new BehaviorSubject<selectDataSet[]>([]);
  public garanziaDataSet$: Observable<selectDataSet[]> =
    this.garanziaDataSetSubject.asObservable();
  private marcaDataSetSubject = new BehaviorSubject<selectDataSet[]>([]);
  public marcaDataSet$: Observable<selectDataSet[]> =
    this.marcaDataSetSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private storage: InventarioModalStorage,
    private firebaseListService: FirebaseListService,
    private firebaseStoreService: FirebaseStoreService,
    @Inject(IS_DEV_MODE) public isDevMode: boolean,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  ngOnInit(): void {
    this.firebaseListService.getListValue('negozio').subscribe((data) => {
      this.negozioDataSetSubject.next(data);
    });
    this.firebaseListService.getListValue('grado').subscribe((data) => {
      this.gradoDataSetSubject.next(data);
    });
    this.firebaseListService.getListValue('garanzia').subscribe((data) => {
      this.garanziaDataSetSubject.next(data);
    });
    this.firebaseListService.getListValue('marca').subscribe((data) => {
      this.marcaDataSetSubject.next(data);
    });

    this.isAdmin = this.authService.getIsAdmin();
    this.mode = this.storage.input.mode;
    if (this.mode === 'Edit') {
      if (this.storage.input.key && this.storage.input.selectedItem) {
        this.formData = createForm(
          'inventario',
          this.fb,
          this.storage.input.selectedItem,
          undefined
        );
        this.modalTitle = this.isAdmin
          ? 'Modifica Articolo'
          : 'Visualizza Articolo';
        this.setListaStorico();
      }

      if (this.formData.value['dataAcquistoInventario']) {
        let valuedataAcquistoInventario = new Date(
          this.formData.value['dataAcquistoInventario']
        );
        this.formData.patchValue({
          dataAcquistoInventario: valuedataAcquistoInventario,
        });
      }
    } else {
      this.initForm();
      this.modalTitle = 'Aggiungi Articolo';
    }
    this.forceUpdateSelectValues();
  }

  ngOnDestroy(): void {
    this.formData.reset();
  }

  handleClose() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
  }

  /**
   * Metodo di init della modale
   **/
  initForm() {
    // prettier-ignore
    this.formData = this.fb.group({
      nome: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      colore: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      memoria: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      grado: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      prezzo_acquisto: new FormControl({ value: 0, disabled: !this.isAdmin }, Validators.required),
      fornitore: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      perc_batteria: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      garanzia_mesi: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      marca: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      negozio: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      prezzo: new FormControl({ value: 0, disabled: !this.isAdmin }, Validators.required),
      prezzo_online: new FormControl({ value: 0, disabled: !this.isAdmin }, Validators.required),
      prezzo_negozio: new FormControl({ value: 0, disabled: !this.isAdmin }, Validators.required),
      quantita: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      imei: new FormControl({ value: '', disabled: !this.isAdmin }, Validators.required),
      dataAcquistoInventario: new FormControl({ value: '', disabled: !this.isAdmin }),
      data: new FormControl(''),
    });
  }

  /**
   * Metodo per aggiungere a database oggetto
   * @returns {any}
   **/
  addNewItem(): any {
    this.loading = true;
    this.firebaseStoreService
      .imeiArticolo(this.formData.value['imei'])
      .then((data) => {
        if (data) {
          callModalToast(
            this.messageService,
            'Errore',
            'IMEI già presente',
            'error'
          );
          this.loading = false;
        } else {
          this.formData.patchValue({ data: new Date().toISOString() });
          if (this.formData.value['dataAcquistoInventario'] !== '') {
            this.formData.patchValue({
              dataAcquistoInventario: new Date(
                this.formData.value['dataAcquistoInventario']
              ).toISOString(),
            });
          }
          let item: InventarioItemModel = new InventarioItemModel(
            this.formData.value
          );
          item.listaStorico = this.listaStorico;
          this.firebaseStoreService.addArticoloInventario(item);
          this.showModal = !this.showModal;
          callModalToast(
            this.messageService,
            'Aggiunto',
            'Nuovo articolo aggiunto'
          );
        }
      });
  }

  editItem() {
    let updatedItem: InventarioItemModel = new InventarioItemModel(
      this.formData.value
    );
    updatedItem.listaStorico = this.listaStorico;
    this.firebaseStoreService.editArticoloInventario(
      updatedItem,
      this.storage.input.key
    );
    callModalToast(
      this.messageService,
      'Modificato',
      'Dati articolo modificati',
      'warn'
    );
    this.handleClose();
  }

  enterCheck() {
    if (this.mode === 'Edit' && this.formData.valid && this.formData.dirty) {
      // this.editUser();
    }
    if (this.mode === 'Add' && this.formData.valid) {
      this.addNewItem();
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

  addCostoStoricoList() {
    this.listaStorico.push({
      id: Math.random().toString(36).substr(2, 9),
      prezzo: this.formData.get('prezzo_acquisto')?.value,
      data: formatDate(new Date(), 'dd/MM/yyyy', this.locale),
    });
  }

  get listaStoricoLength() {
    return this.listaStorico.length;
  }

  public findInvalidControls() {
    findInvalidControls(this.formData);
  }

  private forceUpdateSelectValues(): void {
    const controlsToUpdate = ['negozio', 'marca', 'grado', 'garanzia_mesi'];
    controlsToUpdate.forEach((controlName) => {
      const control = this.formData.get(controlName);
      if (control) {
        control.setValue(control.value, { emitEvent: true });
      }
    });
  }
}
