import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UserDataService } from './user_data.service';
import { UserModel } from '../shared/user_data.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecificDataModel } from '../shared/specific_data.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ConfirmEventType,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { FirebaseStoreService } from '../shared/firebase.store.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user_data.component.html',
  styleUrls: ['./user_data.component.css'],
  providers: [ConfirmationService, MessageService],
})
export class UserDataComponent implements OnInit, OnDestroy, AfterViewInit {
  userData: UserModel;
  tipoIntervento: string[];
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

  selectedSpecificData!: SpecificDataModel;
  selectedIntervento: string;
  storedSub: Subscription;
  storedSubSpecificData: Subscription;

  id: number;
  loading = true;
  nome: string;
  cognome: string;
  isInfo = false;

  modifyInterventoId: number;

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
        console.log(specific_data);
        const mapped: SpecificDataModel[] = Object.values(specific_data);
        console.log(mapped);
        this._specificData = mapped;
      });
    });
    console.log('prima di specific data subscribe');
    this.storedSubSpecificData =
      this.userDataService.specificDataChanged.subscribe(
        (specificData: SpecificDataModel[]) => {
          console.log(specificData);
          this._specificData = specificData;
        }
      );
    this.showModal = false;
    this.initForm();
    console.log(this.authService.userState);
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
    });
    this.showModalFunction('Modifica Intervento', true, id);
  }

  addNewIntervento() {
    this.userDataService.addNewIntervento(
      this.userData.id,
      this.specificDataForm.value['tipo_intervento'],
      this.specificDataForm.value['marca_telefono'] === undefined
        ? undefined
        : this.specificDataForm.value['marca_telefono'],
      this.specificDataForm.value['modello_telefono'] === undefined
        ? undefined
        : this.specificDataForm.value['modello_telefono'],
      this.specificDataForm.value['modalita_pagamento'] === undefined
        ? undefined
        : this.specificDataForm.value['modalita_pagamento'],
      this.specificDataForm.value['tipo_prodotto'] === undefined
        ? undefined
        : this.specificDataForm.value['tipo_prodotto'],
      this.specificDataForm.value['canale_com'] === undefined
        ? undefined
        : this.specificDataForm.value['canale_com'],
      new Date(),
      this.specificDataForm.value['costo'] === undefined
        ? undefined
        : this.specificDataForm.value['costo'],
      this.userData
    );
    this.showModal = !this.showModal;
    this.callModalToast('Aggiunto', 'Nuovo utente aggiunto');
  }

  //Metodo di modifica scatenato alla pressione del pulsante di modifica nel componentø
  modifyUserIntervento() {
    this.userDataService.modifyIntervento(
      this.userData.id,
      this.modifyInterventoId,
      this.specificDataForm.value['tipo_intervento'],
      this.specificDataForm.value['marca_telefono'] === undefined
        ? undefined
        : this.specificDataForm.value['marca_telefono'],
      this.specificDataForm.value['modello_telefono'] === undefined
        ? undefined
        : this.specificDataForm.value['modello_telefono'],
      this.specificDataForm.value['modalita_pagamento'] === undefined
        ? undefined
        : this.specificDataForm.value['modalita_pagamento'],
      this.specificDataForm.value['tipo_prodotto'] === undefined
        ? undefined
        : this.specificDataForm.value['tipo_prodotto'],
      this.specificDataForm.value['canale_com'] === undefined
        ? undefined
        : this.specificDataForm.value['canale_com'],
      new Date(),
      this.specificDataForm.value['costo'] === undefined
        ? undefined
        : this.specificDataForm.value['costo'],
      this.userData
    );
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
    this.specificDataForm = new FormGroup({
      canale_com: new FormControl('', Validators.required),
      costo: new FormControl('', Validators.required),
      data_intervento: new FormControl(''),
      modalita_pagamento: new FormControl('', Validators.required),
      marca_telefono: new FormControl('', Validators.required),
      modello_telefono: new FormControl('', Validators.required),
      tipo_intervento: new FormControl('', Validators.required),
      tipo_prodotto: new FormControl('', Validators.required),
    });
  }
  ngValue;
  /**
   * Mostra toast dialog a destra
   * @param {string} summary -> titolo
   * @param {string} detail -> descrizion
   * @param {string} serverity? -> success , info , warn , error
   * @returns {any}
   **/
  callModalToast(summary: string, detail: string, severity?: string) {
    console.log(severity);
    this.messageService.add({
      severity: severity === undefined ? 'success' : severity,
      summary: summary,
      detail: detail,
    });
  }
}
