import { Component, OnInit } from '@angular/core';
import { UserDataService } from './user_data.service';
import { UserModel } from '../shared/user_data.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecificDataModel } from '../shared/specific_data.model';

@Component({
  selector: 'app-user-data',
  templateUrl: './user_data.component.html',
  styleUrls: ['./User_data.component.css'],
})
export class UserDataComponent implements OnInit {
  userData: UserModel;
  tipoIntervento: string[];
  canaleComunicazioni: string[];
  condizioniProdotto: string[];
  tipoPagamento: string[];
  _specificData: SpecificDataModel[];
  id: number;

  constructor(
    private _userDataService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.userData = this._userDataService.getUserData(this.id);
    });

    this.valEnums();

    this._specificData = this.getListOfSpecificData();
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

  goBack() {
    this.router.navigate(['../']);
  }

  getListOfSpecificData() {
    console.log(this.userData.specific_data);
    return this.userData.specific_data.slice();
  }
}
