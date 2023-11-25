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
import { prodottiAggiuntivi } from '../shared/prodottiAggiuntivi.model';
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
  condizioniProdotto: string[];
  tipoPagamento: string[];
  _specificData: SpecificDataModel[] = [];

  @ViewChild('tipoInterventoDropdown') tipoInterventoDropdown: Dropdown;
  @ViewChild('navdrop_tipo_intervento') t: ElementRef;

  @ViewChild('quantitaProdottoInput') quantitaProdottoInput: ElementRef;
  @ViewChild('nomeProdottoInput') nomeProdottoInput: ElementRef;
  @ViewChild('costoProdottoInput') costoProdottoInput: ElementRef;

  @ViewChild('checkedProdottiAggiuntiviElementRef')
  checkedProdottiAggiuntiviElementRef: any;

  checkedProdottiAggiuntivi: boolean = false;

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

  prodottiAggiuntivi: prodottiAggiuntivi[] = [];

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
    console.log(!(this.specificDataForm.valid && this.specificDataForm.dirty));
    console.log(!this.checkedProdottiAggiuntivi);
  }

  verifyAuthModify(): boolean {
    return this.checkedProdottiAggiuntivi
      ? false
      : this.specificDataForm.valid && this.specificDataForm.dirty
      ? false
      : true;
  }

  // ON HOLD - da rifare il controllo della checkbox e la sua gestione.
  // get checkedProdottiAggiuntivi() {
  //   console.log(this.checkedProdottiAggiuntiviElementRef);
  //   return this.isModify
  //     ? this.selectedSpecificData.checkedProdottiAggiuntivi
  //     : this.checkedProdottiAggiuntiviElementRef === undefined
  //     ? false
  //     : this.checkedProdottiAggiuntiviElementRef.value;
  // }

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
        let specific_data = this.userData.specific_data;
        let mapped: SpecificDataModel[];
        mapped = specific_data ? Object.values(specific_data) : [];
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

  myModelChanged(event) {
    console.log(event);
  }

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
    this.checkedProdottiAggiuntivi =
      this.selectedSpecificData.checkedProdottiAggiuntivi;
    console.log(
      this.checkedProdottiAggiuntivi,
      this.selectedSpecificData.checkedProdottiAggiuntivi
    );
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
        checkedProdottiAggiuntivi: new FormControl(
          this.selectedSpecificData.checkedProdottiAggiuntivi === undefined
            ? false
            : true
        ),
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
        checkedProdottiAggiuntivi: new FormControl(
          this.selectedSpecificData.checkedProdottiAggiuntivi === undefined
            ? false
            : true
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
        this.specificDataForm.value['garanzia'],
        null,
        null,
        this.checkCongruenzaProdottiAggiuntivi(),
        this.prodottiAggiuntivi,
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
        this.specificDataForm.value['problema'],
        this.specificDataForm.value['tipo_parte'],
        this.checkCongruenzaProdottiAggiuntivi(),
        this.prodottiAggiuntivi,
        null,
        this.userData
      );
    }

    this.showModal = !this.showModal;
    this.callModalToast('Aggiunto', 'Nuovo utente aggiunto');
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
    if (this.getIntervento() === 'Vendita') {
      this.userDataService.modifyIntervento(
        this.userData.id,
        this.modifyInterventoId,
        this.specificDataForm.value['tipo_intervento'],
        this.specificDataForm.value['marca_telefono'],
        this.specificDataForm.value['modello_telefono'],
        this.specificDataForm.value['modalita_pagamento'],
        this.specificDataForm.value['tipo_prodotto'],
        new Date(),
        this.specificDataForm.value['costo'],
        this.specificDataForm.value['imei'],
        this.specificDataForm.value['garanzia'],
        null,
        null,
        this.specificDataForm.value['costo_sconto'],
        this.checkCongruenzaProdottiAggiuntivi(),
        this.prodottiAggiuntivi,
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
        new Date(),
        this.specificDataForm.value['costo'],
        this.specificDataForm.value['imei'],
        null,
        this.specificDataForm.value['problema'],
        this.specificDataForm.value['tipo_parte'],
        null,
        this.checkCongruenzaProdottiAggiuntivi(),
        this.prodottiAggiuntivi,
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
    this.prodottiAggiuntivi = [];
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
        checkedProdottiAggiuntivi: new FormControl(''),
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
        checkedProdottiAggiuntivi: new FormControl(''),
      });
    }
  }

  private getIntervento() {
    return this.specificDataForm.value['tipo_intervento'];
  }

  toggleNavdrop(element) {}

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
          worksheet.getCell('E16').value = this.userData.canale_com; // social / canale com
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
          let costoTotaleProdottiAggiuntivi: number = 0;
          if (
            specificData.checkedProdottiAggiuntivi &&
            Object.keys(specificData.prodottiAggiuntivi).length > 0
          ) {
            console.log('ho prodotti aggiuntivi');
            Object.values(specificData.prodottiAggiuntivi).forEach((x, i) => {
              if (i === 0) {
                worksheet.getCell('B20').value = x.quantita;
                worksheet.getCell('H20').value = worksheet.getCell(
                  'F20'
                ).value = Number(x.costo);
                worksheet.getCell('D20').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
              if (i === 1) {
                worksheet.getCell('B21').value = x.quantita;
                worksheet.getCell('H21').value = worksheet.getCell(
                  'F21'
                ).value = Number(x.costo);
                worksheet.getCell('D21').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
              if (i === 2) {
                worksheet.getCell('B22').value = x.quantita;
                worksheet.getCell('H22').value = worksheet.getCell(
                  'F22'
                ).value = Number(x.costo);
                worksheet.getCell('D22').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
              if (i === 3) {
                worksheet.getCell('B23').value = x.quantita;
                worksheet.getCell('H23').value = worksheet.getCell(
                  'F23'
                ).value = Number(x.costo);
                worksheet.getCell('D23').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
            });
          }
          worksheet.getCell('H31').value =
            Number(specificData.costo) + Number(costoTotaleProdottiAggiuntivi); // subtotale
          worksheet.getCell('H33').value =
            Number(discounted) + Number(costoTotaleProdottiAggiuntivi); // totale

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
          let costoTotaleProdottiAggiuntivi: number = 0;
          if (
            specificData.checkedProdottiAggiuntivi &&
            specificData.prodottiAggiuntivi.length > 0
          ) {
            console.log('ho prodotti aggiuntivi');
            specificData.prodottiAggiuntivi.forEach((x, i) => {
              if (i === 0) {
                worksheet.getCell('F12').value = x.costo;
                worksheet.getCell('B12').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += x.costo;
              }
              if (i === 1) {
                worksheet.getCell('F13').value = x.costo;
                worksheet.getCell('B13').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += x.costo;
              }
              if (i === 2) {
                worksheet.getCell('F14').value = x.costo;
                worksheet.getCell('B14').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += x.costo;
              }
            });
          }
          worksheet.getCell('F11').value = specificData.costo;
          worksheet.getCell('F27').value =
            worksheet.getCell('F20').value =
            worksheet.getCell('F16').value =
              specificData.costo + costoTotaleProdottiAggiuntivi;
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
