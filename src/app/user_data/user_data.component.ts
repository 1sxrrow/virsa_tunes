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
  MessageService,
} from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { FirebaseStoreService } from '../shared/firebase.store.service';
import { SpecificDataModel } from '../shared/specific_data.model';
import { UserModel } from '../shared/user_data.model';
import { UserDataService } from './user_data.service';
import { Workbook } from 'exceljs';
import { HttpClient } from '@angular/common/http';
import * as fs from 'file-saver';
import { formatDate } from '@angular/common';
import { arrayBufferToBufferCycle, keylistener } from '../shared/utils';
@Component({
  selector: 'app-user-data',
  templateUrl: './user_data.component.html',
  styleUrls: ['./user_data.component.css'],
  providers: [
    ConfirmationService,
    MessageService,
    { provide: LOCALE_ID, useValue: 'it' },
  ],
})
export class UserDataComponent implements OnInit, OnDestroy, AfterViewInit {
  userData: UserModel;
  tipoIntervento: string[];
  tipoParte: string[];
  mesiGaranzia: string[];
  canaleComunicazioni: string[];
  condizioniProdotto: string[];
  tipoPagamento: string[];
  _specificData: SpecificDataModel[] = [];

  @ViewChild('tipoInterventoDropdown') tipoInterventoDropdown: Dropdown;
  @ViewChild('navdrop_tipo_intervento') t: ElementRef;
  // Per modale
  showModal = false;
  visible = false;
  modalTitle: string;
  isModify = false;
  savedSpecificDataId: number;
  specificDataForm: FormGroup;
  selectedItem = '';
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
  devmode = false;

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
    private http: HttpClient,
    private authService: AuthService,
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
        tipo_parte: new FormControl(
          this.selectedSpecificData.tipo_parte,
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
        null,
        this.specificDataForm.value['costo_sconto'],
        this.userData
      );
    } else {
      console.log(this.specificDataForm.value['tipo_parte']);
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
        this.specificDataForm.value['problema'],
        this.specificDataForm.value['tipo_parte'],
        null,
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
        this.specificDataForm.value['tipo_parte'],
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
        tipo_parte: new FormControl('', Validators.required),
        costo: new FormControl('', Validators.required),
        data_intervento: new FormControl(''),
        marca_telefono: new FormControl('', Validators.required),
        modello_telefono: new FormControl('', Validators.required),
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

  toggleNavdrop(element) {}

  public createExcel(specificData: SpecificDataModel) {
    const path =
      specificData.tipo_intervento === 'Vendita'
        ? '/assets/template_vendita.xlsx'
        : '/assets/template_riparazione.xlsx';

    this.http.get(path, { responseType: 'blob' }).subscribe((res) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        console.log();
        const workbook = new Workbook();
        let y = arrayBufferToBufferCycle(e.target.result);
        // carico buffer excel
        await workbook.xlsx.load(y, {
          ignoreNodes: [
            'dataValidations', // ignores the workbook's Data Validations
            'autoFilter',
            'drawings',
          ],
        });
        var worksheet = workbook.getWorksheet('RICEVUTA');
        console.log(this.locale);
        let formatDateVar = formatDate(
          specificData.data_intervento,
          'd MMMM yyyy',
          this.locale
        );
        if (specificData.tipo_intervento === 'Vendita') {
          worksheet.getRow(2).height = 66;
          const imageSrc = '/assets/logovirsa.png';
          const img = await fetch(imageSrc);
          const buffer = await img.arrayBuffer();
          const logo = workbook.addImage({
            buffer: buffer,
            extension: 'png',
          });
          worksheet.addImage(logo, {
            tl: { col: 1.15, row: 1.05 },
            ext: { width: 88, height: 100 },
          });
          worksheet.getCell('B19').value = '1'; // quantità
          worksheet.getCell('H5').value = formatDateVar; // data
          worksheet.getCell('D9').value =
            this.userData.nome + ' ' + this.userData.cognome; //nome cognome + gestione celle merged
          worksheet.getCell('D10').value = this.userData.indirizzo; // //indirizzo + gestione celle merged
          worksheet.getCell('D11').value =
            this.userData.citta + ' / ' + this.userData.cap; //citta e cap + gestione celle merged
          worksheet.getCell('D12').value = this.userData.numero_telefono; //telefono + gestione celle merged
          worksheet.getCell('B16').value = specificData.modalita_pagamento; //metodo di pagamento + gestione celle merged
          worksheet.getCell('F16').value = specificData.tipo_prodotto; //condizioni + gestione celle merged
          worksheet.getCell('E16').value = specificData.canale_com; // social / canale com
          worksheet.getCell('E33').value = specificData.garanzia; //garanzia + gestione celle merged
          worksheet.getCell('D19').value =
            specificData.modello_telefono.marca +
            ' ' +
            specificData.modello_telefono.modello; // modello telefono
          worksheet.getCell('E19').value = specificData.imei; // imei
          worksheet.getCell('F19').value = specificData.costo; // costo
          worksheet.getCell('G19').value = specificData.costo_sconto; // sconto
          worksheet.getCell('H30').value = specificData.costo_sconto; // sconto
          let discounted =
            specificData.costo - Number(specificData.costo_sconto);
          worksheet.getCell('H19').value = discounted; // totale riga
          worksheet.getCell('H31').value = specificData.costo; // subtotale
          worksheet.getCell('H33').value = discounted; // totale
          console.log('scrittura dati fatta');
        } else {
          worksheet.getCell('C24').value = worksheet.getCell('C4').value =
            this.userData.nome + ' ' + this.userData.cognome;
          worksheet.getCell('C25').value = worksheet.getCell('C5').value =
            this.userData.indirizzo;
          worksheet.getCell('C6').value = this.userData.cap;
          worksheet.getCell('C26').value = worksheet.getCell('C7').value =
            this.userData.citta;
          worksheet.getCell('C27').value = worksheet.getCell('C8').value =
            this.userData.numero_telefono;
          console.log(specificData.tipo_parte);
          worksheet.getCell('D24').value = worksheet.getCell('D8').value =
            specificData.tipo_parte;
          worksheet.getCell('B11').value = specificData.problema;
          worksheet.getCell('D11').value = specificData.imei;
          worksheet.getCell('F27').value =
            worksheet.getCell('F20').value =
            worksheet.getCell('F16').value =
            worksheet.getCell('F11').value =
              specificData.costo;
          worksheet.getCell('F5').value =
            specificData.modello_telefono.marca +
            ' ' +
            specificData.modello_telefono.modello;
        }
        // Creazione Excel modificato
        workbook.xlsx.writeBuffer().then((data) => {
          console.log(data);
          let blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          console.log(blob);
          fs.saveAs(
            blob,
            (specificData.tipo_intervento === 'Vendita'
              ? 'Vendita_'
              : 'Riparazione_') +
              this.userData.nome +
              '_' +
              this.userData.cognome +
              '_' +
              formatDateVar +
              '.xlsx'
          );
        });
      };
      reader.readAsArrayBuffer(res);
    });
  }
}
