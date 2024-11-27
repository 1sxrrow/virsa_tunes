import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { Table } from 'primeng/table';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import {
  callModalToast,
  getBreadcrumbHome,
} from 'src/app/shared/utils/common-utils';
import { AuthService } from '../../login/auth.service';
import { UserDataStorage } from '../user-data/user-data-storage.service';
import { UserDataService } from '../user-data/user-data.service';
import { UserListModalStorage } from '../user-list-modal/user-list-modal-storage.service';
import { UserCacheService } from 'src/app/shared/services/user-cache.service';

interface UserModelWithInterventi extends UserModel {
  interventiCount: number;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UserListComponent implements OnInit {
  items: MenuItem[] | undefined = [{ label: 'Database', routerLink: '/users' }];
  home: MenuItem | undefined = getBreadcrumbHome();

  interventiCounts: { [userId: number]: number } = {};
  usersWithInterventi$: Observable<UserModelWithInterventi[]>;

  showModal = false;
  showAdminModal = false;

  savedUserId: number;

  users: UserModel[] = [];
  listaInterventi: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private printService: PrintService,
    private messageService: MessageService,
    private userDataStorage: UserDataStorage,
    private userDataService: UserDataService,
    private userCacheService: UserCacheService,
    private userListModalStorage: UserListModalStorage,
    private confirmationService: ConfirmationService,
    private firebaseStoreService: FirebaseStoreService
  ) {}

  ngOnInit(): void {
    // Inizializza il servizio di stampa
    this.initializePrintService();
    const cachedUsers = this.userCacheService.getCachedUsers();
    this.usersWithInterventi$ = this.route.data.pipe(
      map((data) => {
        const usersWithInterventi = data['usersWithInterventi'];
        if (this.userCacheService.hasDataChanged(usersWithInterventi)) {
          console.log('User data has changed, updating cache.');
          this.userCacheService.cacheUsers(usersWithInterventi);
        } else {
          console.log('User data has not changed, using cached data.');
        }
        return usersWithInterventi;
      }),
      catchError((error) => {
        console.log('Error in component:', error);
        return of(cachedUsers);
      })
    );
  }

  initializePrintService() {
    // Seleziona la stampante
    if (!this.printService.getDevice()) {
      if (!this.printService.isDeviceChosen()) {
        this.printService.chooseDevice();
        this.printService.setDeviceChosen(true);
      }
    }
  }

  handleShowModalChange(show: boolean) {
    this.showModal = show;
  }

  handleShowAdminModalChange(show: boolean) {
    this.showAdminModal = show;
  }

  showAdminToolsModal() {
    this.showAdminModal = !this.showAdminModal;
  }

  /**
   * Metodo lanciato per aprire modale per inserire cliente
   */
  addUser() {
    this.userListModalStorage.reset();
    this.showModal = !this.showModal;
  }

  /**
   * Elimina utente, lancia modale per rimozione
   * @param {number} user_id
   * @returns {any}
   **/
  deleteUser(user_id: number) {
    this.userDataService.deleteUser(user_id);
  }

  /**
   * Metodo lanciato per aprire modale con dati cliente per modificarli
   */
  editUser(user: any) {
    delete user.$key;
    this.userListModalStorage.reset();
    this.userListModalStorage.input.selectedItem = user;
    this.userListModalStorage.input.id = user.id;
    this.showModal = !this.showModal;
  }

  updateUsers() {
    this.users = this.userDataService.getUserDatas();
  }

  clear(table: Table) {
    table.clear();
  }

  onRowSelect(event: any) {
    this.userDataStorage.reset();
    this.userDataStorage.input.interventiTotali = event.data.interventiCount;
    this.router.navigate(['users', event.data.id]);
  }

  confirmDeleteUser(user_id: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler procedere?',
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user_id);
        callModalToast(
          this.messageService,
          'Eliminato',
          'Utente rimosso',
          'info'
        );
      },
      reject: (type: ConfirmEventType) => {
        callModalToast(
          this.messageService,
          'Interrotto',
          'Rimozione utente interrotta',
          'warn'
        );
      },
    });
  }

  myModelChanged(event) {}
}
