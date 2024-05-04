import { Component, isDevMode, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { map } from 'rxjs';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import {
  garanzia,
  gradoInventario,
  marcaInventario,
  negozioInventario,
} from 'src/app/shared/utils/common-enums';
import {
  callModalToast,
  getBreadcrumbHome,
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-inventario-item-list',
  templateUrl: './inventario-item-list.component.html',
  styleUrls: ['./inventario-item-list.component.scss'],
  providers: [ConfirmationService],
})
export class InventarioItemListComponent implements OnInit, OnDestroy {
  items: MenuItem[] | undefined = [
    { label: 'Inventario', routerLink: '/inventario' },
  ];
  home: MenuItem | undefined = getBreadcrumbHome();

  itemsInventario: InventarioItemModel[] = [];
  inventarioResults = this.firebaseStoreService
    .getUsersStatsResults()
    .snapshotChanges();
  loading = false;
  showModal = false;
  isInfo = false;
  selectedItem: InventarioItemModel;
  itemForm: FormGroup;
  modalTitle: string;
  devmode: boolean = false;
  key: string;
  subscription;
  isAdmin = false;
  negozioSwitch = false; // false: Negozio I, true: Negozio B
  isFilterNegozio = false;

  selectNegozio: string[];
  selectMarca: string[];
  selectGrado: string[];
  selectGaranzia: string[];

  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    //load items in memory
    this.key = '';
    this.subscription = this.retrieveData();
    this.initForm();
    this.selectNegozio = Object.keys(negozioInventario).filter((key) =>
      isNaN(+key)
    );
    this.selectMarca = Object.keys(marcaInventario).filter((key) =>
      isNaN(+key)
    );
    this.selectGrado = Object.keys(gradoInventario).filter((key) =>
      isNaN(+key)
    );
    this.selectGaranzia = Object.keys(garanzia).filter((key) => isNaN(+key));
    this.isAdmin = this.authService.getIsAdmin();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onRowSelect(event) {
    this.key = event.data.key;
    this.editItemModal();
  }

  editItemModal() {
    this.initForm();
    this.itemForm.patchValue(this.selectedItem);
    this.showModalFunction(
      this.isAdmin ? 'Modifica Articolo' : 'Visualizza Articolo',
      true
    );
  }

  editItem() {
    let updatedItem = new InventarioItemModel(this.itemForm.value);
    this.firebaseStoreService.editArticoloInventario(updatedItem, this.key);
    callModalToast(
      this.messageService,
      'Modificato',
      'Dati articolo modificati',
      'warn'
    );
    this.selectedItem = null;
    this.showModal = !this.showModal;
  }
  /**
   * Metodo per mostrare la modale in modalità di inserimento
   * @returns {any}
   **/
  addItemModal(): any {
    this.initForm();
    this.showModalFunction('Aggiungi Articolo', false);
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

  confirmDeleteItem(key: string) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler procedere?',
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.firebaseStoreService.deleteArticoloInventario(key);
        callModalToast(
          this.messageService,
          'Eliminato',
          'Intervento rimosso',
          'info'
        );
      },
      reject: (type: ConfirmEventType) => {
        callModalToast(
          this.messageService,
          'Interrotto',
          'Rimozione interrotta',
          'warn'
        );
      },
    });
  }

  /**
   * Metodo di init della modale
   * @returns {any}
   **/
  initForm() {
    this.itemForm = new FormGroup({
      nome: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      colore: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      memoria: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      grado: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      prezzo_acquisto: new FormControl(0, Validators.required),
      fornitore: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      perc_batteria: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      garanzia_mesi: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      marca: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      negozio: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      prezzo: new FormControl(
        { value: 0, disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      prezzo_online: new FormControl(
        { value: 0, disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      prezzo_negozio: new FormControl(
        { value: 0, disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      quantita: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      imei: new FormControl(
        { value: '', disabled: this.isAdmin ? false : true },
        Validators.required
      ),
      data: new FormControl(''),
    });
    this.devmode = isDevMode();
  }

  /**
   * Metodo per far vedere il modale per Aggiunta/modifica utente
   * @returns {any}
   **/
  showModalFunction(modalTitle: string, isinfo: boolean): any {
    this.showModal = !this.showModal;
    this.modalTitle = modalTitle;
    this.isInfo = isinfo;
  }

  enterCheck() {
    if (this.isInfo && this.itemForm.valid && this.itemForm.dirty) {
      // this.editUser();
    }
    if (!this.isInfo && this.itemForm.valid) {
      this.addNewItem();
    }
  }

  /**
   * Metodo per recuperare dati da database
   */
  private retrieveData() {
    this.loading = true;
    this.firebaseStoreService
      .getInventario()
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe((data) => {
        this.itemsInventario = data;
        this.loading = false;
      });
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

  closeDialog() {
    this.selectedItem = null;
  }

  clear(table: Table) {
    table.clear();
    this.isFilterNegozio = false;
    this.negozioSwitch = false;
  }

  filterNegozio(dt1: Table) {
    this.negozioSwitch = !this.negozioSwitch;
    this.isFilterNegozio = true;
    dt1.filterGlobal(this.negozioSwitch ? 'Negozio B' : 'Negozio I', 'equals');
    this.checkFilterNegozio(dt1);
  }

  checkFilterNegozio(dt1: Table) {
    const hasFilters = dt1.hasFilter();
    console.log(hasFilters);
    if (hasFilters) {
      const filters = dt1.filters;
      let values = Object.values(filters['global']);
      let result;
      values.forEach((item) => {
        item === 'Negozio B' || 'Negozio I' ? true : false;
      });
      return result;
    }
    return false;
  }
}
