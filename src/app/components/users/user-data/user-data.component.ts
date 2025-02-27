import {
  Component,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import EscPosEncoder from '@manhnd/esc-pos-encoder';
import { TranslateService } from '@ngx-translate/core';
import {
  ConfirmationService,
  ConfirmEventType,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { Subscription } from 'rxjs';
import { UppercaseFirstLetterPipe } from 'src/app/shared/pipes/uppercase.pipe';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import { fadeInOutAnimation } from 'src/app/shared/utils/animations';

import { SpecificDataModel } from 'src/app/shared/models/specific-data.model';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { CreateExcelService } from 'src/app/shared/services/excel/create-excel.service';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';
import {
  callModalToast,
  createMultiScontrino,
  createScontrino,
  getBreadcrumbHome,
  getTotalOfProduct,
} from '../../../shared/utils/common-utils';
import { userDataModalStorage } from '../user-data-modal/user-data-modal-storage.service';
import { UserDataStorage } from './user-data-storage.service';
import { UserDataService } from './user-data.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss'],
  providers: [ConfirmationService, { provide: LOCALE_ID, useValue: 'it' }],
  animations: [fadeInOutAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class UserDataComponent implements OnInit, OnDestroy {
  // prettier-ignore
  breadCrumbItems: MenuItem[] | undefined = [{ label: 'Database', routerLink: '/users'},];
  home: MenuItem | undefined = getBreadcrumbHome();

  userData: UserModel;

  _specificData: SpecificDataModel[] = [];

  interventiTotali: number;

  // Per modale
  showModal = false;
  showPrintModal = false;
  specificDataForm: FormGroup;

  selectedSpecificData!: SpecificDataModel;
  selectedSpecificDataScontrino: SpecificDataModel[] = [];
  storedSub: Subscription;
  storedSubSpecificData: Subscription = new Subscription();
  multipleSelection = false;

  id: number;
  loading = true;
  nome: string;
  cognome: string;
  fullName: string;

  private breadCrumbSet = false; // Add this flag

  constructor(
    private router: Router,
    private storage: UserDataStorage,
    private excel: CreateExcelService,
    private printService: PrintService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private userDataService: UserDataService,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService,
    private firebaseStoreService: FirebaseStoreService,
    private userDataModalStorage: userDataModalStorage,
    @Inject(LOCALE_ID) public locale: string
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state;
    state?.newUser
      ? setTimeout(() => {
          callModalToast(
            this.messageService,
            'Aggiunto',
            'Nuovo utente aggiunto'
          );
        }, 500)
      : null;
  }

  handleShowModalChange(show: boolean) {
    this.showModal = show;
    if (this.selectedSpecificData) {
      this.selectedSpecificData = null;
    }
  }

  //alla chiusura del dialog viene deselezionato la riga
  closeDialog() {
    this.selectedSpecificData = null;
  }

  changeLang(lang: string) {
    this.translateService.use(lang);
  }

  ngOnInit(): void {
    this.loading = true;
    // recupero dati utente da database Firebase.
    this.storedSubSpecificData.add(
      this.activatedRoute.params.subscribe((params) => {
        this.id = +params['id'];
        // recupero numero interventi
        this.storedSubSpecificData.add(
          this.userDataService.interventiCountsSubject.subscribe((item) => {
            this.interventiTotali = item[this.id];
          })
        );
        this.storedSubSpecificData.add(
          this.firebaseStoreService
            .GetUser(this.id)
            .snapshotChanges()
            .subscribe((data) => {
              this.userData = data.payload.toJSON() as UserModel;
              this.nome = this.userData.nome;
              this.cognome = this.userData.cognome;
              let specific_data = this.userData.specific_data;
              let mapped: SpecificDataModel[];
              mapped = specific_data ? Object.values(specific_data) : [];
              this._specificData = mapped;
              if (!this.breadCrumbSet) {
                // Check the flag
                this.setBreadCrumb();
                this.breadCrumbSet = true;
              }
              this.loading = false;
            })
        );
      })
    );
    this.storedSubSpecificData.add(
      this.userDataService.specificDataSubject.subscribe(
        (specificData: SpecificDataModel[]) => {
          this._specificData = specificData;
        }
      )
    );
    this.showModal = false;
  }

  ngOnDestroy(): void {
    if (this.storedSubSpecificData) {
      this.storedSubSpecificData.unsubscribe();
    }
    this.messageService.clear();
  }

  onRowSelect(event: any) {
    this.userDataModalStorage.reset();
    this.userDataModalStorage.input.id = event.data.id;
    this.userDataModalStorage.input.selectedItem = this.selectedSpecificData;
    this.userDataModalStorage.input.userData = this.userData;
    this.showModal = !this.showModal;
  }

  goBack() {
    this.router.navigate(['../']);
  }

  confirmDeleteIntervento(id_intervento: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler procedere?',
      header: 'Conferma',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteIntervento(id_intervento);
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

  deleteIntervento(id_intervento: number) {
    let intervento = Object.values(this.userData.specific_data).find(
      (item) => item.id === id_intervento
    );
    if (intervento.tipo_intervento === 'Acquisto') {
      this.firebaseStoreService.deleteArticoloInventario(
        intervento['idArticolo']
      );
    }
    this.userDataService.deleteIntervento(id_intervento, this.userData);
  }

  newIntervento() {
    this.userDataModalStorage.reset();
    this.userDataModalStorage.input.userData = this.userData;
    this.showModal = !this.showModal;
  }

  createExcelFile(specificData: SpecificDataModel) {
    this.excel.createExcel(specificData, this.userData);
  }

  print(specificData: SpecificDataModel) {
    let result = createScontrino(specificData, this.userData);
    this.printScontrino(result);
  }

  multiPrint(selectedSpecificData: SpecificDataModel[]) {
    let result = createMultiScontrino(selectedSpecificData, this.userData);
    this.printScontrino(result);
  }

  private printScontrino(result: EscPosEncoder) {
    try {
      if (this.printService.getDevice() === undefined) {
        callModalToast(
          this.messageService,
          'Non Stampato',
          'Nessuna stampante rilevata',
          'error'
        );
      } else {
        this.printService.printRecipe(this.printService.getDevice(), result);
        callModalToast(
          this.messageService,
          'Stampato',
          'Scontrino stampato',
          'success'
        );
      }
    } catch (error) {
      console.log(error);
      callModalToast(
        this.messageService,
        'Non Stampato',
        'Errore nella stampa',
        'error'
      );
    }
  }

  getTotalOfProduct(specificData: SpecificDataModel): number {
    if (specificData.tipo_intervento !== 'Acquisto') {
      return getTotalOfProduct(specificData);
    } else {
      const obj: Object = specificData;
      return obj['prezzo_negozio'];
    }
  }

  selezioneScontrinoMultiplo() {
    this.multipleSelection = !this.multipleSelection;
    if (this.multipleSelection === false) {
      this.selectedSpecificData = undefined;
    }
  }

  checkEnableStampaMultiScontrino() {
    return Array.isArray(this.selectedSpecificData)
      ? this.selectedSpecificData.length >= 1
        ? false
        : true
      : true;
  }

  openModalScontrino() {
    this.showPrintModal = true;
    this.selectedSpecificDataScontrino = [];
    return Array.isArray(this.selectedSpecificData)
      ? this.selectedSpecificData.forEach((item) => {
          this.selectedSpecificDataScontrino.push(item);
        })
      : null;
  }

  setBreadCrumb() {
    // Verifica esistenza breadcrumb utente
    let foundBreadCrumbUserItem = this.breadCrumbItems.find((n) => {
      n.label === this.fullName;
    });
    // Se già presente non aggiungere
    if (!foundBreadCrumbUserItem) {
      // BreadCrumb nome e cognome
      let uppercaseFirstLetterPipe = new UppercaseFirstLetterPipe();
      this.fullName =
        uppercaseFirstLetterPipe.transform(this.nome) +
        ' ' +
        uppercaseFirstLetterPipe.transform(this.cognome);
      // prettier-ignore
      this.breadCrumbItems.push({
        label: this.fullName,
        id: 'userFullName',
        styleClass: "userBreadcrumb",
      });
      this.breadCrumbItems.push({
        label: 'Lista Interventi',
      });
    }
  }

  getInterventi(id: number) {
    return 0;
    // return this.userDataService.getTotalInterventi(id);
  }

  getNomeElemento(specificData): string {
    if (specificData.modello_telefono) {
      return specificData.modello_telefono;
    } else {
      return specificData['nome'];
    }
  }
}
