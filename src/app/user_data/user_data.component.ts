import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConfirmEventType,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { FirebaseStoreService } from '../shared/firebase.store.service';
import { SpecificDataModel } from '../shared/specific_data.model';
import { UserModel } from '../shared/user_data.model';
import { UserDataService } from './user_data.service';

require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime');

@Component({
  selector: 'app-user-data',
  templateUrl: './user_data.component.html',
  styleUrls: ['./user_data.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class UserDataComponent implements OnInit, OnDestroy, AfterViewInit {
  userData: UserModel;
  tipoIntervento: string[];
  mesiGaranzia: string[];
  canaleComunicazioni: string[];
  condizioniProdotto: string[];
  tipoPagamento: string[];
  _specificData: SpecificDataModel[] = [];

  @ViewChild('tipoInterventoDropdown') tipoInterventoDropdown: Dropdown;
  // Per modale
  showModal = false;
  visible = false;
  modalTitle: string;
  isModify = false;
  savedSpecificDataId: number;
  specificDataForm: FormGroup;

  showFields = false;

  selectedSpecificData!: SpecificDataModel;
  storedSub: Subscription;
  storedSubSpecificData: Subscription;

  id: number;
  loading = true;
  nome: string;
  cognome: string;
  isInfo = false;
  utenteInserimento: string;
  utenteUltimaModifica: string;

  modifyInterventoId: number;

  showFieldsVendita = false;
  showFieldsRiparazione = false;

  constructor(
    private userDataService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private firebaseStoreService: FirebaseStoreService,
    private router: Router,
    private authService: AuthService
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

  //alla chiusura del dialog viene deselezionato la riga
  closeDialog() {
    this.selectedSpecificData = null;
  }

  ngOnInit(): void {
    this.valEnums();
    this.initForm();
    // recupero dati utente da database Firebase.
    this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      let s = this.firebaseStoreService.GetUser(this.id);
      s.snapshotChanges().subscribe((data) => {
        this.userData = data.payload.toJSON() as UserModel;
        this.nome = this.userData.nome;
        this.cognome = this.userData.cognome;
        this.loading = false;
        // TODO Mappare oggetto specific_data in array perchè firebase lo crea in un object
        let specific_data = this.userData.specific_data;
        let mapped: SpecificDataModel[];
        if (specific_data) {
          mapped = Object.values(specific_data);
        } else {
          mapped = [];
        }
        this._specificData = mapped;
      });
    });
    this.storedSubSpecificData =
      this.userDataService.specificDataChanged.subscribe(
        (specificData: SpecificDataModel[]) => {
          this._specificData = specificData;
        }
      );
    this.showModal = false;
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

  private valEnums() {
    this.tipoIntervento = Object.keys(
      this.userDataService.tipoIntervento
    ).filter((key) => isNaN(+key));

    this.canaleComunicazioni = Object.keys(
      this.userDataService.canaleComunicazione
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
        this.callModalToast('Eliminato', 'Intervento rimosso', 'info');
      },
      reject: (type: ConfirmEventType) => {
        this.callModalToast('Interrotto', 'Rimozione interrotta', 'warn');
      },
    });
  }

  deleteIntervento(id_intervento: number) {
    //this.userDataService.deleteSpecificData(this.id, id_intervento);
    this.userDataService.deleteIntervento(id_intervento, this.userData);
  }

  newIntervento() {
    this.isInfo = true;
    this.initForm();
    this.showModalFunction('Aggiungi Intervento', false);
  }

  showDataIntervento(id: number) {
    this.modifyInterventoId = id;

    if (this.selectedSpecificData.tipo_intervento === 'Vendita') {
      this.showFieldsVendita = true;
      this.showFieldsRiparazione = false;
      this.specificDataForm = new FormGroup({
        canale_com: new FormControl(
          this.selectedSpecificData.canale_com,
          Validators.required
        ),
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
          this.selectedSpecificData.modello_telefono.marca,
          Validators.required
        ),
        modello_telefono: new FormControl(
          this.selectedSpecificData.modello_telefono.modello,
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
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(15),
        ]),
        garanzia: new FormControl(this.selectedSpecificData.garanzia, [
          Validators.required,
        ]),
      });
    } else {
      this.showFieldsRiparazione = true;
      this.showFieldsVendita = false;
      this.specificDataForm = new FormGroup({
        canale_com: new FormControl(
          this.selectedSpecificData.canale_com,
          Validators.required
        ),
        costo: new FormControl(
          this.selectedSpecificData.costo,
          Validators.required
        ),
        data_intervento: new FormControl(
          this.selectedSpecificData.data_intervento
        ),
        marca_telefono: new FormControl(
          this.selectedSpecificData.modello_telefono.marca,
          Validators.required
        ),
        modello_telefono: new FormControl(
          this.selectedSpecificData.modello_telefono.modello,
          Validators.required
        ),
        tipo_intervento: new FormControl(
          this.selectedSpecificData.tipo_intervento,
          Validators.required
        ),
        imei: new FormControl(this.selectedSpecificData.imei, [
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(15),
        ]),
        problema: new FormControl(this.selectedSpecificData.problema, [
          Validators.required,
        ]),
      });
    }
    this.showFields = true;
    this.utenteInserimento = this.userData.utenteInserimento;
    this.utenteUltimaModifica = this.userData.ultimoUtenteModifica;
    this.showModalFunction('Modifica Intervento', true, id);
  }

  addNewIntervento() {
    if (this.getIntervento() === 'Vendita') {
      this.userDataService.addNewIntervento(
        this.userData.id,
        this.specificDataForm.value['tipo_intervento'],
        this.specificDataForm.value['marca_telefono'],
        this.specificDataForm.value['modello_telefono'],
        this.specificDataForm.value['tipo_prodotto'],
        new Date(),
        this.specificDataForm.value['costo'],
        this.specificDataForm.value['imei'],
        this.specificDataForm.value['modalita_pagamento'],
        this.specificDataForm.value['canale_com'],
        this.specificDataForm.value['garanzia'],
        null,
        this.specificDataForm.value['costo_sconto'],
        this.userData
      );
    } else {
      this.userDataService.addNewIntervento(
        this.userData.id,
        this.specificDataForm.value['tipo_intervento'],
        this.specificDataForm.value['marca_telefono'],
        this.specificDataForm.value['modello_telefono'],
        null,
        new Date(),
        this.specificDataForm.value['costo'],
        this.specificDataForm.value['imei'],
        null,
        null,
        null,
        null,
        this.specificDataForm.value['costo_sconto'],
        this.userData
      );
    }

    this.showModal = !this.showModal;
    this.callModalToast('Aggiunto', 'Nuovo utente aggiunto');
  }

  //Metodo di modifica scatenato alla pressione del pulsante di modifica nel componentø
  modifyUserIntervento() {
    if (this.getIntervento() === 'Vendita') {
      this.userDataService.modifyIntervento(
        this.userData.id,
        this.modifyInterventoId,
        this.specificDataForm.value['tipo_intervento'],
        this.specificDataForm.value['marca_telefono'],
        this.specificDataForm.value['modello_telefono'],
        this.specificDataForm.value['modalita_pagamento'],
        this.specificDataForm.value['tipo_prodotto'],
        this.specificDataForm.value['canale_com'],
        new Date(),
        this.specificDataForm.value['costo'],
        this.specificDataForm.value['imei'],
        this.specificDataForm.value['garanzia'],
        null,
        this.specificDataForm.value['costo_sconto'],
        this.userData
      );
    } else {
      this.userDataService.modifyIntervento(
        this.userData.id,
        this.modifyInterventoId,
        this.specificDataForm.value['tipo_intervento'],
        this.specificDataForm.value['marca_telefono'],
        this.specificDataForm.value['modello_telefono'],
        null,
        null,
        null,
        new Date(),
        this.specificDataForm.value['costo'],
        this.specificDataForm.value['imei'],
        null,
        this.specificDataForm.value['problema'],
        null,
        this.userData
      );
    }

    this.showModal = !this.showModal;
    this.callModalToast('Modificato', 'Utente modificato', 'info');
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
    this.specificDataForm = new FormGroup({
      tipo_intervento: new FormControl('', Validators.required),
    });
    this.utenteInserimento = undefined;
    this.utenteUltimaModifica = undefined;
  }

  /**
   * Mostra toast dialog a destra
   * @param {string} summary -> titolo
   * @param {string} detail -> descrizion
   * @param {string} serverity? -> success , info , warn , error
   * @returns {any}
   **/
  callModalToast(summary: string, detail: string, severity?: string) {
    this.messageService.add({
      severity: severity === undefined ? 'success' : severity,
      summary: summary,
      detail: detail,
    });
  }

  checkValueIntervento() {
    if (this.getIntervento() == 'Vendita') {
      this.showFields = true;
      this.showFieldsRiparazione = false;
      this.showFieldsVendita = true;
      console.log(this.showFieldsVendita);
      this.specificDataForm = new FormGroup({
        tipo_intervento: new FormControl(
          this.getIntervento(),
          Validators.required
        ),
        canale_com: new FormControl('', Validators.required),
        costo: new FormControl('', Validators.required),
        costo_sconto: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        modalita_pagamento: new FormControl('', Validators.required),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        tipo_prodotto: new FormControl('', Validators.required),
        imei: new FormControl('', [
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(15),
        ]),
        garanzia: new FormControl('', Validators.required),
      });
    } else {
      this.showFields = true;
      this.showFieldsVendita = false;
      this.showFieldsRiparazione = true;
      console.log(this.showFieldsRiparazione);
      this.specificDataForm = new FormGroup({
        tipo_intervento: new FormControl(
          this.getIntervento(),
          Validators.required
        ),
        problema: new FormControl('', Validators.required),
        costo: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
        tipo_prodotto: new FormControl('', Validators.required),
        imei: new FormControl('', [
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(15),
        ]),
      });
    }
  }

  private getIntervento() {
    return this.specificDataForm.value['tipo_intervento'];
  }

  public createExcel() {
    const ExcelJS = require('exceljs/dist/es5');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Virsa Tunes';
    workbook.lastModifiedBy = this.authService.userState.displayName;
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    workbook.properties.date1904 = true;
    workbook.calcProperties.fullCalcOnLoad = true;
    workbook.views = [
      {
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 1, visibility: 'visible'
      }
    ]
    const sheet = workbook.addWorksheet('My Sheet');
  }
}
