import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from './user_data.service';
import { UserModel } from '../shared/user_data.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecificDataModel } from '../shared/specific_data.model';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-data',
  templateUrl: './user_data.component.html',
  styleUrls: ['./User_data.component.css'],
})
export class UserDataComponent implements OnInit, OnDestroy {
  userData: UserModel;
  tipoIntervento: string[];
  canaleComunicazioni: string[];
  condizioniProdotto: string[];
  tipoPagamento: string[];
  _specificData: SpecificDataModel[] = [];

  // Per modale
  showModal = false;
  visible = false;
  modalTitle: string;
  isModify = false;
  savedSpecificDataId: number;
  specificDataForm: FormGroup;

  selectedSpecificData!: SpecificDataModel;
  storedSub: Subscription;
  storedSubSpecificData: Subscription;

  id: number;
  loading = true;

  constructor(
    private _userDataService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.valEnums();

    this.storedSub = this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.userData = this._userDataService.getUserData(this.id);
    });
    if (this._specificData.length === 0) {
      this._specificData = this._userDataService.getListOfSpecificData(this.id);
    }
    this.storedSubSpecificData =
      this._userDataService.specificDataChanged.subscribe(
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

  private valEnums() {
    this.tipoIntervento = Object.keys(
      this._userDataService.tipoIntervento
    ).filter((key) => isNaN(+key));

    this.canaleComunicazioni = Object.keys(
      this._userDataService.canaleComunicazione
    ).filter((key) => isNaN(+key));

    this.condizioniProdotto = Object.keys(
      this._userDataService.condizioniProdotto
    ).filter((key) => isNaN(+key));

    this.tipoPagamento = Object.keys(
      this._userDataService.tipoPagamento
    ).filter((key) => isNaN(+key));
  }

  onRowSelect(event: any) {
    this.modifyIntervento(event.data.id);
  }

  goBack() {
    this.router.navigate(['../']);
  }

  deleteIntervento(id_intervento: number) {
    this._userDataService.deleteSpecificData(this.id, id_intervento);
  }

  newIntervento() {
    this.showModalFunction('Aggiungi Intervento', false);
  }

  modifyIntervento(id: number) {
    this.showModalFunction('Modifica Intervento', true, id);
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
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      numero_telefono: new FormControl(''),
      indirizzo: new FormControl(''),
    });
  }
}
