import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { FirebaseOperation } from '@angular/fire/compat/database/interfaces';
import { UserModel } from '../../models/user-data.model';
import { Incasso } from '../../models/incasso.model';
import { createIncasso } from '../../utils/common-utils';

@Injectable({ providedIn: 'root' })
export class FirebaseStoreService {
  UsersRef: AngularFireList<any>;
  IncassiRef: AngularFireList<any>;
  UserRef: AngularFireObject<any>;
  IncassoRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) {}

  GetIncassi() {
    this.IncassiRef = this.db.list('incassi');
    return this.IncassiRef;
  }

  AddIncasso(incasso_i: number, mese: string) {
    this.GetIncassi();
    let incasso: Incasso;
    this.IncassiRef.query
      .orderByChild('mese')
      .equalTo(mese)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let incassoObject = snapshot.val();
          let incasso: Incasso = Object.values(incassoObject)[0] as Incasso;
          incasso.incassoTotale += incasso_i;
          this.UpdateIncasso(incasso);
        } else {
          incasso = createIncasso(incasso_i, mese);
          let id: FirebaseOperation = incasso.mese.toString();
          this.IncassiRef.set(id, incasso);
        }
      });
  }

  UpdateIncasso(incasso: Incasso) {
    this.IncassoRef = this.db.object('incassi/' + incasso.mese);
    this.IncassoRef.update(incasso);
  }

  AddUser(user: UserModel) {
    let id: FirebaseOperation = user.id.toString();
    this.UsersRef.set(id, user);
  }
  // Fetch Single User Object
  GetUser(id: string | number) {
    if (typeof id === 'number') {
      id = id.toString();
    }
    this.UserRef = this.db.object('users/' + id);
    return this.UserRef;
  }
  // Fetch Users List
  GetUserList() {
    this.UsersRef = this.db.list('users');
    return this.UsersRef;
  }
  // Update User Object
  UpdateUser(user: UserModel) {
    this.UserRef = this.db.object('users/' + user.id);
    this.UserRef.update(user);
  }
  // Delete User
  DeleteUser(id: string) {
    this.UserRef = this.db.object('users/' + id);
    this.UserRef.remove();
  }
}
