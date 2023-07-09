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
  _specificData: SpecificDataModel[];

  selectedSpecificData!: SpecificDataModel;
  private storedSub: Subscription;

  id: number;
  loading: boolean = true;

  constructor(
    private _userDataService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.storedSub = this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.userData = this._userDataService.getUserData(this.id);
    });

    this.valEnums();

    this._specificData = this.getListOfSpecificData();

    this.loading = false;
  }

  ngOnDestroy(): void {
    this.storedSub.unsubscribe();
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
    this.router.navigate(['users', event.data.id - 1]);
  }

  goBack() {
    this.router.navigate(['../']);
  }

  getListOfSpecificData() {
    return this.userData.specific_data.slice();
  }
}
