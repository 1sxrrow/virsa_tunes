import {
  Component,
  EventEmitter,
  Input,
  isDevMode,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { callModalToast } from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { MessageService } from 'primeng/api';
import { InventarioModalStorage } from './inventario-modal.service';
import {
  garanzia,
  gradoInventario,
  marcaInventario,
  negozioInventario,
} from 'src/app/shared/utils/common-enums';

@Component({
  selector: 'inventario-modal',
  templateUrl: './inventario-modal.component.html',
  styleUrls: ['./inventario-modal.component.scss'],
})
export class InventarioModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter();

  devmode: boolean = false;
  isAdmin: boolean = false;
  loading: boolean = false;

  itemForm: FormGroup = new FormGroup({});

  modalTitle: string;
  mode: string;

  selectNegozio: string[];
  selectMarca: string[];
  selectGrado: string[];
  selectGaranzia: string[];

  constructor(
    private storage: InventarioModalStorage,
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.devmode = isDevMode();
    this.isAdmin = this.authService.getIsAdmin();
    this.mode = this.storage.input.mode;
    // prettier-ignore
    {
      this.selectNegozio = Object.keys(negozioInventario).filter((key) => isNaN(+key));
      this.selectMarca = Object.keys(marcaInventario).filter((key) => isNaN(+key));
      this.selectGrado = Object.keys(gradoInventario).filter((key) => isNaN(+key));
      this.selectGaranzia = Object.keys(garanzia).filter((key) => isNaN(+key));
    }

    if (this.mode === 'Edit') {
      if (this.storage.input.key && this.storage.input.selectedItem) {
        this.createForm(this.storage.input.selectedItem);
        this.modalTitle = this.isAdmin
          ? 'Modifica Articolo'
          : 'Visualizza Articolo';
      }
    } else {
      this.initForm();
      this.modalTitle = 'Aggiungi Articolo';
    }
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
    this.itemForm = new FormGroup({
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
      data: new FormControl(''),
    });
  }

  /**
   * Metodo per creare il form dinamicamente
   **/
  createForm(item: any) {
    const formGroup: any = {};
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
        formGroup[key] = new FormControl(item[key], Validators.required);
      }
    }
    this.itemForm = new FormGroup(formGroup);
  }

  /**
   * Metodo per aggiungere a database oggetto
   * @returns {any}
   **/
  addNewItem(): any {
    this.loading = true;
    this.firebaseStoreService
      .imeiArticolo(this.itemForm.value['imei'])
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
          this.itemForm.patchValue({ data: new Date().toISOString() });
          let item = new InventarioItemModel(this.itemForm.value);
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
    let updatedItem = new InventarioItemModel(this.itemForm.value);
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
    if (this.mode === 'Edit' && this.itemForm.valid && this.itemForm.dirty) {
      // this.editUser();
    }
    if (this.mode === 'Add' && this.itemForm.valid) {
      this.addNewItem();
    }
  }

  // metodo per verificare quale dato nel form non funziona
  public findInvalidControls() {
    const invalid = [];
    const controls = this.itemForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log(invalid);
  }
}
