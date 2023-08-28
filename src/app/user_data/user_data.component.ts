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
import { MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';

@Component({
  selector: 'app-user-data',
  templateUrl: './user_data.component.html',
  styleUrls: ['./User_data.component.css'],
  providers: [MessageService],
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

  constructor(
    private userDataService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.valEnums();

    this.storedSub = this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.userData = this.userDataService.getUserData(this.id);
    });
    if (this._specificData.length === 0) {
      this._specificData = this.userDataService.getListOfSpecificData(this.id);
    }
    this.storedSubSpecificData =
      this.userDataService.specificDataChanged.subscribe(
        (specificData: SpecificDataModel[]) => {
          this._specificData = specificData;
        }
      );

    this.loading = false;
    this.showModal = false;
    this.initForm();
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
    this.modifyIntervento(event.data.id);
  }

  goBack() {
    this.router.navigate(['../']);
  }

  deleteIntervento(id_intervento: number) {
    this.userDataService.deleteSpecificData(this.id, id_intervento);
  }

  newIntervento() {
    this.initForm();
    this.showModalFunction('Aggiungi Intervento', false);
  }

  modifyIntervento(id: number) {
    this.specificDataForm = new FormGroup({
      canale_com: new FormControl(this.selectedSpecificData.canale_com),
      costo: new FormControl(this.selectedSpecificData.costo),
      data_intervento: new FormControl(
        this.selectedSpecificData.data_intervento
      ),
      modalita_pagamento: new FormControl(
        this.selectedSpecificData.modalita_pagamento
      ),
      marca_telefono: new FormControl(
        this.selectedSpecificData.modello_telefono.marca
      ),
      modello_telefono: new FormControl(
        this.selectedSpecificData.modello_telefono.modello
      ),
      tipo_intervento: new FormControl(
        this.selectedSpecificData.tipo_intervento
      ),
      tipo_prodotto: new FormControl(this.selectedSpecificData.tipo_prodotto),
    });
    this.showModalFunction('Modifica Intervento', true, id);
  }

  addNewIntervento() {
    this.userDataService.addNewIntervento(
      1,
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
        : this.specificDataForm.value['costo']
    );
    this.showModal = !this.showModal;
    this.callModalSuccess('Aggiunto', 'Nuovo utente aggiunto');
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
      canale_com: new FormControl(''),
      costo: new FormControl(''),
      data_intervento: new FormControl(''),
      modalita_pagamento: new FormControl(''),
      marca_telefono: new FormControl(''),
      modello_telefono: new FormControl(''),
      tipo_intervento: new FormControl(''),
      tipo_prodotto: new FormControl(''),
    });
  }
  /**
   * Mostra toast dialog a destra
   * @param {string} summary -> titolo
   * @param {string} detail -> descrizion
   * @param {string} serverity? -> success , info , warn , error
   * @returns {any}
   **/
  callModalSuccess(summary: string, detail: string, severity?: string) {
    console.log(severity);
    this.messageService.add({
      severity: severity === undefined ? 'success' : severity,
      summary: summary,
      detail: detail,
    });
  }
}
