import { Component, Input } from '@angular/core';
import { UserModel } from '../user_data.model';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent {
  @Input('isInfo') isInfo: boolean;
  @Input('user') user: UserModel;

  utenteInserimento: string;
  utenteUltimaModifica: string;
  constructor() {
    this.user.utenteInserimento = this.utenteInserimento;
    this.user.ultimoUtenteModifica = this.utenteUltimaModifica;
  }
}
