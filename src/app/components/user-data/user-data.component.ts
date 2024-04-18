import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  ViewChild,
  isDevMode,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmEventType,
  ConfirmationService,
  MenuItem,
  MessageService,
} from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { SpecificDataModel } from '../../shared/models/specific-data.model';
import { UserModel } from '../../shared/models/user-data.model';
import { FirebaseStoreService } from '../../shared/services/firebase/firebase-store.service';
import { UserDataService } from './user-data.service';

import EscPosEncoder from '@manhnd/esc-pos-encoder';
import { TranslateService } from '@ngx-translate/core';
import { UppercaseFirstLetterPipe } from 'src/app/shared/pipes/uppercase.pipe';
import { PrintService } from 'src/app/shared/services/print/recipe-print.service';
import { fadeInOutAnimation } from 'src/app/shared/utils/animations';
import { prodottiAggiuntivi } from '../../shared/models/prodotti-aggiuntivi.model';
import {
  callModalToast,
  createExcel,
  createMultiScontrino,
  createScontrino,
  getBreadcrumbHome,
  getTotalOfProduct,
  keylistener,
} from '../../shared/utils/common-utils';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.scss'],
  providers: [ConfirmationService, { provide: LOCALE_ID, useValue: 'it' }],
  animations: [fadeInOutAnimation],
})
export class UserDataComponent implements OnInit, OnDestroy, AfterViewInit {
  items: MenuItem[] | undefined = [{ label: 'Database', routerLink: '/users' }];
  home: MenuItem | undefined = getBreadcrumbHome();

  totale: number = 0;
  userData: UserModel;
  tipoIntervento: string[];
  tipoParte: string[];
  mesiGaranzia: string[];
  condizioniProdotto: string[];
  tipoPagamento: string[];
  _specificData: SpecificDataModel[] = [];

  @ViewChild('tipoInterventoDropdown') tipoInterventoDropdown: Dropdown;
  @ViewChild('navdrop_tipo_intervento') t: ElementRef;

  @ViewChild('quantitaProdottoInput') quantitaProdottoInput: ElementRef;
  @ViewChild('nomeProdottoInput') nomeProdottoInput: ElementRef;
  @ViewChild('costoProdottoInput') costoProdottoInput: ElementRef;

  checkedProdottiAggiuntivi: boolean = false;
  checkedPermuta: boolean = false;

  // Per modale
  showModal = false;
  showPrintModal = false;
  visible = false;
  modalTitle: string;
  isModify = false;
  savedSpecificDataId: number;
  specificDataForm: FormGroup;
  selectedItem = '';
  showFields = false;

  selectedSpecificData!: SpecificDataModel;
  selectedSpecificDataScontrino: SpecificDataModel[] = [];
  storedSub: Subscription;
  storedSubSpecificData: Subscription;
  multipleSelection = false;

  id: number;
  loading = true;
  nome: string;
  cognome: string;
  fullName: string;

  isInfo = false;
  utenteInserimento: string;
  utenteUltimaModifica: string;
  devmode = false;
  modifyInterventoId: number;

  showFieldsVendita = false;
  showFieldsRiparazione = false;

  prodottiAggiuntivi: prodottiAggiuntivi[] = [];

  constructor(
    private userDataService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private firebaseStoreService: FirebaseStoreService,
    private printService: PrintService,
    private router: Router,
    private http: HttpClient,

    private translateService: TranslateService,
    @Inject(LOCALE_ID) public locale: string
  ) {}

  // metodo per verificare quale dato nel form non funziona
  public findInvalidControls() {
    const invalid = [];
    const controls = this.specificDataForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log(invalid);
  }

  verifyAuthModify(): boolean {
    let e = this.checkedProdottiAggiuntivi
      ? false
      : this.specificDataForm.valid && this.specificDataForm.dirty
      ? false
      : true;
    if (this.checkedPermuta) {
      e = false;
    }
    return e;
  }

  //alla chiusura del dialog viene deselezionato la riga
  closeDialog() {
    this.selectedSpecificData = null;
  }

  changeLang(lang: string) {
    this.translateService.use(lang);
  }

  ngOnInit(): void {
    this.valEnums();
    this.initForm();
    this.loading = true;
    // recupero dati utente da database Firebase.
    this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      let s = this.firebaseStoreService.GetUser(this.id);
      s.snapshotChanges().subscribe((data) => {
        this.userData = data.payload.toJSON() as UserModel;
        this.nome = this.userData.nome;
        this.cognome = this.userData.cognome;
        let specific_data = this.userData.specific_data;
        let mapped: SpecificDataModel[];
        mapped = specific_data ? Object.values(specific_data) : [];
        this._specificData = mapped;
        this.setBreadCrumb();
        this.loading = false;
      });
    });
    this.storedSubSpecificData =
      this.userDataService.specificDataChanged.subscribe(
        (specificData: SpecificDataModel[]) => {
          this._specificData = specificData;
        }
      );
    this.showModal = false;
    this.devmode = isDevMode();
    keylistener(this.devmode);
  }

  ngOnDestroy(): void {
    this.storedSubSpecificData.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.tipoInterventoDropdown) {
      (this.tipoInterventoDropdown.filterBy as any) = {
        split: (_: any) => [(item: any) => item],
      };
    }
  }

  myModelChanged(event) {}

  private valEnums() {
    this.tipoIntervento = Object.keys(
      this.userDataService.tipoIntervento
    ).filter((key) => isNaN(+key));

    this.condizioniProdotto = Object.keys(
      this.userDataService.condizioniProdotto
    ).filter((key) => isNaN(+key));

    this.tipoPagamento = Object.keys(this.userDataService.tipoPagamento).filter(
      (key) => isNaN(+key)
    );

    this.mesiGaranzia = Object.keys(this.userDataService.mesiGaranzia).filter(
      (key) => isNaN(+key)
    );

    this.tipoParte = Object.keys(this.userDataService.tipoParte).filter((key) =>
      isNaN(+key)
    );
  }

  onRowSelect(event: any) {
    this.isInfo = false;
    this.showDataIntervento(event.data.id);
  }

  onHide() {
    this.selectedSpecificData = null;
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
    //this.userDataService.deleteSpecificData(this.id, id_intervento);
    this.userDataService.deleteIntervento(id_intervento, this.userData);
  }

  newIntervento() {
    this.isInfo = true;
    this.checkedProdottiAggiuntivi = false;
    this.initForm();
    this.showModalFunction('Aggiungi Intervento', false);
  }

  showDataIntervento(id: number) {
    this.initForm();
    this.modifyInterventoId = id;
    // if (Array.isArray(this.selectedSpecificData)) {
    //   this.selectedSpecificData = this.selectedSpecificData[0];
    // }
    this.checkedProdottiAggiuntivi =
      this.selectedSpecificData.checkedProdottiAggiuntivi !== undefined
        ? this.selectedSpecificData.checkedProdottiAggiuntivi
        : false;
    this.checkedPermuta =
      this.selectedSpecificData.checkedPermuta !== undefined
        ? this.selectedSpecificData.checkedPermuta
        : false;

    if (this.selectedSpecificData.tipo_intervento === 'Vendita') {
      this.showFieldsVendita = true;
      this.showFieldsRiparazione = false;
      this.specificDataForm = new FormGroup({
        costo: new FormControl(
          this.selectedSpecificData.costo,
          Validators.required
        ),
        costo_sconto: new FormControl(
          this.selectedSpecificData.costo_sconto,
          Validators.required
        ),
        data_intervento: new FormControl(
          this.selectedSpecificData.data_intervento
        ),
        modalita_pagamento: new FormControl(
          this.selectedSpecificData.modalita_pagamento,
          Validators.required
        ),
        marca_telefono: new FormControl(
          this.selectedSpecificData.marca_telefono,
          Validators.required
        ),
        modello_telefono: new FormControl(
          this.selectedSpecificData.modello_telefono,
          Validators.required
        ),
        tipo_intervento: new FormControl(
          this.selectedSpecificData.tipo_intervento,
          Validators.required
        ),
        tipo_prodotto: new FormControl(
          this.selectedSpecificData.tipo_prodotto,
          Validators.required
        ),
        imei: new FormControl(this.selectedSpecificData.imei, [
          // Validators.required,
          // Validators.minLength(15),
          // Validators.maxLength(15),
        ]),
        garanzia: new FormControl(this.selectedSpecificData.garanzia, [
          Validators.required,
        ]),
        checkedProdottiAggiuntivi: new FormControl(
          this.checkedProdottiAggiuntivi
        ),
        checkedPermuta: new FormControl(this.checkedPermuta),
        costoPermuta: new FormControl(this.selectedSpecificData.costoPermuta),
      });
    } else {
      this.showFieldsRiparazione = true;
      this.showFieldsVendita = false;
      this.specificDataForm = new FormGroup({
        costo: new FormControl(
          this.selectedSpecificData.costo,
          Validators.required
        ),
        data_intervento: new FormControl(
          this.selectedSpecificData.data_intervento
        ),
        marca_telefono: new FormControl(
          this.selectedSpecificData.marca_telefono,
          Validators.required
        ),
        modello_telefono: new FormControl(
          this.selectedSpecificData.modello_telefono,
          Validators.required
        ),
        tipo_intervento: new FormControl(
          this.selectedSpecificData.tipo_intervento,
          Validators.required
        ),
        tipo_parte: new FormControl(
          this.selectedSpecificData.tipo_parte,
          Validators.required
        ),
        imei: new FormControl(this.selectedSpecificData.imei, [
          // Validators.required,
          // Validators.minLength(15),
          // Validators.maxLength(15),
        ]),
        problema: new FormControl(this.selectedSpecificData.problema, [
          Validators.required,
        ]),
        checkedProdottiAggiuntivi: new FormControl(
          this.checkedProdottiAggiuntivi
        ),
        data_consegna_riparazione: new FormControl(
          this.selectedSpecificData.data_consegna_riparazione
            ? new Date(this.selectedSpecificData.data_consegna_riparazione)
            : '',
          Validators.required
        ),
        codice_sblocco: new FormControl(
          this.selectedSpecificData.codice_sblocco
        ),
        caparra: new FormControl(this.selectedSpecificData.caparra),
        data_rest_dispositivo_cliente: new FormControl(
          this.selectedSpecificData.data_rest_dispositivo_cliente
        ),
        nome_fornitore_pezzo: new FormControl(
          this.selectedSpecificData.nome_fornitore_pezzo
        ),
      });
    }
    this.prodottiAggiuntivi =
      this.selectedSpecificData.prodottiAggiuntivi !== undefined
        ? Object.values(this.selectedSpecificData.prodottiAggiuntivi)
        : [];
    this.showFields = true;
    this.utenteInserimento = this.userData.utenteInserimento;
    this.utenteUltimaModifica = this.userData.ultimoUtenteModifica;
    this.showModalFunction('Modifica Intervento', true, id);
  }

  addNewIntervento() {
    this.userDataService.addNewIntervento(
      new SpecificDataModel(this.specificDataForm.value),
      this.userData,
      this.prodottiAggiuntivi
    );

    this.showModal = !this.showModal;
    callModalToast(this.messageService, 'Aggiunto', 'Nuovo utente aggiunto');
  }

  checkCongruenzaProdottiAggiuntivi() {
    let checkedValue = this.specificDataForm.value['checkedProdottiAggiuntivi'];
    if (checkedValue && this.prodottiAggiuntivi.length < 1) {
      checkedValue = false;
    }
    return checkedValue;
  }

  //Metodo di modifica scatenato alla pressione del pulsante di modifica nel componentø
  modifyUserIntervento() {
    this.userDataService.modifyIntervento(
      this.modifyInterventoId,
      new SpecificDataModel(this.specificDataForm.value),
      this.prodottiAggiuntivi,
      this.userData
    );

    this.showModal = !this.showModal;
    callModalToast(
      this.messageService,
      'Modificato',
      'Utente modificato',
      'info'
    );
  }

  showModalFunction(modalTitle: string, isModify: boolean, id?: number) {
    this.showModal = !this.showModal;
    this.modalTitle = modalTitle;
    this.isModify = isModify;
    if (this.isModify) {
      this.savedSpecificDataId = id;
    }
  }

  /**
   * Metodo lanciato per inizializzare dati del form del modale
   * @returns {any}
   **/
  initForm() {
    this.showFields = false;
    this.showFieldsRiparazione = false;
    this.showFieldsVendita = false;
    this.prodottiAggiuntivi = [];
    this.specificDataForm = new FormGroup({
      tipo_intervento: new FormControl('', Validators.required),
    });
    this.utenteInserimento = undefined;
    this.utenteUltimaModifica = undefined;
  }

  checkValueIntervento() {
    if (this.getIntervento() == 'Vendita') {
      this.showFields = true;
      this.showFieldsRiparazione = false;
      this.showFieldsVendita = true;
      this.specificDataForm = new FormGroup({
        tipo_intervento: new FormControl(
          this.getIntervento(),
          Validators.required
        ),
        costo: new FormControl('', Validators.required),
        costo_sconto: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        modalita_pagamento: new FormControl('', Validators.required),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        tipo_prodotto: new FormControl('', Validators.required),
        imei: new FormControl('', [
          // Validators.required,
          // Validators.minLength(15),
          // Validators.maxLength(15),
        ]),
        garanzia: new FormControl('', Validators.required),
        checkedProdottiAggiuntivi: new FormControl(''),
        checkedPermuta: new FormControl(''),
        costoPermuta: new FormControl(''),
      });
    } else {
      this.showFields = true;
      this.showFieldsVendita = false;
      this.showFieldsRiparazione = true;
      this.specificDataForm = new FormGroup({
        tipo_intervento: new FormControl(
          this.getIntervento(),
          Validators.required
        ),
        problema: new FormControl('', Validators.required),
        tipo_parte: new FormControl('', Validators.required),
        costo: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        imei: new FormControl('', [
          // Validators.required,
          // Validators.minLength(15),
          // Validators.maxLength(15),
        ]),
        checkedProdottiAggiuntivi: new FormControl(''),
        data_consegna_riparazione: new FormControl('', Validators.required),
        codice_sblocco: new FormControl(''),
        caparra: new FormControl(''),
        nome_fornitore_pezzo: new FormControl(''),
        data_rest_dispositivo_cliente: new FormControl(''),
      });
    }
  }

  private getIntervento() {
    return this.specificDataForm.value['tipo_intervento'];
  }

  addProdottoAggiuntivi(quantita: number, nome: string, costo: number) {
    if (quantita != 0 && nome != '' && costo != 0) {
      this.prodottiAggiuntivi.push({
        quantita: quantita,
        nomeProdotto: nome,
        costo: costo,
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

  createExcelFile(specificData: SpecificDataModel) {
    createExcel(specificData);
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
    return getTotalOfProduct(specificData);
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
    // BreadCrumb nome e cognome
    let uppercaseFirstLetterPipe = new UppercaseFirstLetterPipe();
    this.fullName =
      uppercaseFirstLetterPipe.transform(this.nome) +
      ' ' +
      uppercaseFirstLetterPipe.transform(this.cognome);

    this.items.push({
      label: this.fullName,
    });
    this.items.push({ label: 'Lista Interventi' });
  }

  getInterventi(id: number) {
    return this.userDataService.getTotalInterventi(id);
  }

  checkImei() {
    this.firebaseStoreService
      .imeiArticolo(this.specificDataForm.value['imei'])
      .then((data) => {
        if (data) {
          let item = Object.values(data);
          console.log(item);
          this.specificDataForm.patchValue({
            modello_telefono: item[0]['nome'],
            costo: +item[0]['costo'],
            marca_telefono: item[0]['marca'],
          });
          console.log(this.specificDataForm.value);
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
}
