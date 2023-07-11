import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from './user_data.service';
import { UserModel } from '../shared/user_data.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecificDataModel } from '../shared/specific_data.model';
import { Subscription } from 'rxjs';

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
  newInt = false;
  visible = false;

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
    this.newInt = false;
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
    console.log(event.data.id);
  }

  goBack() {
    this.router.navigate(['../']);
  }

  deleteIntervento(id_intervento: number) {
    this._userDataService.deleteSpecificData(this.id, id_intervento);
  }

  newIntervento() {
    this.newInt = true;
  }
}
