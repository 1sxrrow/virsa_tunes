import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { map, Subscription } from 'rxjs';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import {
  callModalToast,
  getBreadcrumbHome,
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { InventarioModalStorage } from '../inventario-modal/inventario-modal-storage.service';

@Component({
  selector: 'app-inventario-item-list',
  templateUrl: './inventario-item-list.component.html',
  providers: [ConfirmationService],
  encapsulation: ViewEncapsulation.None,
})
export class InventarioItemListComponent implements OnInit, OnDestroy {
  items: MenuItem[] | undefined = [
    { label: 'Inventario', routerLink: '/inventario' },
  ];
  home: MenuItem | undefined = getBreadcrumbHome();

  itemsInventario: InventarioItemModel[] = [];

  loading = false;
  isAdmin = false;

  selectedItem: InventarioItemModel;
  showModal: boolean = false;
  key: string;
  subscription: Subscription;
  negozioSwitch = false; // false: Negozio I, true: Negozio B
  isFilterNegozio = false;

  constructor(
    private firebaseStoreService: FirebaseStoreService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private inventarioModalStorage: InventarioModalStorage,
  ) {}

  ngOnInit(): void {
    //load items in memory
    this.key = '';
    this.retrieveData();
    this.isAdmin = this.authService.getIsAdmin();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Gestione chiusura modale
   **/
  handleShowModalChange(show: boolean) {
    this.showModal = show;
    if (this.selectedItem) {
      this.selectedItem = null;
    }
  }

  /**
   * Mostra modale in modalità di modifica / visualizzazione
   **/
  onRowSelect(event) {
    this.inventarioModalStorage.reset();
    this.inventarioModalStorage.input.key = event.data.key;
    this.inventarioModalStorage.input.selectedItem = this.selectedItem;
    this.inventarioModalStorage.input.mode = 'Edit';
    this.showModal = !this.showModal;
  }

  /**
   * Mostra modale in modalità di inserimento
   **/
  addItemModal() {
    this.inventarioModalStorage.reset();
    this.inventarioModalStorage.input.mode = 'Add';
    this.showModal = !this.showModal;
  }

  /**
   * Cancella articolo
   **/
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
   * Metodo per recuperare dati da database
   */
  private retrieveData() {
    this.loading = true;
    this.subscription = this.firebaseStoreService
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

  clear(table: Table) {
    table.clear();
    this.isFilterNegozio = false;
    this.negozioSwitch = false;
  }

  filterNegozio(dt1: Table) {
    this.negozioSwitch = !this.negozioSwitch;
    this.isFilterNegozio = true;
    dt1.filterGlobal(this.negozioSwitch ? 'Negozio B' : 'Negozio I', 'equals');
    const hasFilters = dt1.hasFilter();
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
