import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { FirebaseOperation } from '@angular/fire/compat/database/interfaces';
import { UserModel } from './user_data.model';

@Injectable({ providedIn: 'root' })
export class FirebaseStoreService {
  UsersRef: AngularFireList<any>;
  UserRef: AngularFireObject<any>;
  constructor(private db: AngularFireDatabase) {}
  AddUser(user: UserModel) {
    let id: FirebaseOperation = user.id.toString();
    this.UsersRef.set(id, {
      nome: user.nome,
      cognome: user.cognome,
      indirizzo: user.indirizzo,
      numero_telefono: user.numero_telefono,
      id: user.id,
    });
  }
  // Fetch Single User Object
  GetUser(id: string) {
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
    this.UserRef.update({
      nome: user.nome,
      cognome: user.cognome,
      indirizzo: user.indirizzo,
      numero_telefono: user.numero_telefono,
      id: user.id,
    });
  }
  // Delete User
  DeleteUser(id: string) {
    this.UserRef = this.db.object('userModel/' + id);
    this.UserRef.remove();
  }
}
