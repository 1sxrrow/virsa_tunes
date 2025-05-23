import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { finalize, map, Subscription } from 'rxjs';
import { InventarioItemModel } from 'src/app/shared/models/inventarioItem.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import {
  callModalToast,
  getBreadcrumbHome,
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { InventarioModalStorage } from '../inventario-modal/inventario-modal-storage.service';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { UserDataService } from '../../users/user-data/user-data.service';

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
  showExcelUploadModal: boolean = false;

  key: string;
  subscription: Subscription;
  negozioSwitch = false; // false: Negozio I, true: Negozio B
  isFilterNegozio = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private userDataService: UserDataService,
    private confirmationService: ConfirmationService,
    private firebaseStoreService: FirebaseStoreService,
    private inventarioModalStorage: InventarioModalStorage
  ) {}

  ngOnInit(): void {
    const invetarioListSession = sessionStorage.getItem(
      'invetarioList-session'
    );
    if (invetarioListSession) {
      const sessionObj = JSON.parse(invetarioListSession);
      if (sessionObj.filters && sessionObj.filters?.global) {
        sessionStorage.removeItem('invetarioList-session');
      } else {
        delete sessionObj.filters;
        delete sessionObj.selection;
        sessionStorage.setItem(
          'invetarioList-session',
          JSON.stringify(sessionObj)
        );
      }
    }

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
  confirmDeleteItem(key: string, item: any) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler procedere?',
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (item['idUtente']) {
          this.subscription.add(
            this.firebaseStoreService
              .GetUser(item['idUtente'])
              .valueChanges()
              .subscribe((user: UserModel) => {
                if (user && user.specific_data) {
                  let intervento = user.specific_data.find(
                    (itemIntervento) => itemIntervento['idArticolo'] === key
                  );
                  this.userDataService.deleteIntervento(intervento.id, user);
                  this.firebaseStoreService.deleteArticoloInventario(key);
                  callModalToast(
                    this.messageService,
                    'Eliminato',
                    'Articolo rimosso',
                    'info'
                  );
                } else {
                  this.firebaseStoreService.deleteArticoloInventario(key);
                  callModalToast(
                    this.messageService,
                    'Eliminato con errore',
                    'Articolo rimosso ma non su entry utente',
                    'warn'
                  );
                }
              })
          );
        } else {
          this.firebaseStoreService.deleteArticoloInventario(key);
          callModalToast(
            this.messageService,
            'Eliminato',
            'Articolo rimosso',
            'info'
          );
        }
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

  openExcelUploadModal() {
    this.showExcelUploadModal = !this.showExcelUploadModal;
  }

  handleShowExcelUploadModalChange(show: boolean) {
    this.showExcelUploadModal = show;
  }
}
