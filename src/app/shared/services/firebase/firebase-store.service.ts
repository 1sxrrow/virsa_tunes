import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { FirebaseOperation } from '@angular/fire/compat/database/interfaces';
import { Incasso } from '../../models/incasso.model';
import { InventarioItemModel } from '../../models/inventarioItem.model';
import { SpesaFissa } from '../../models/spesaFissa.model';
import { UserModel } from '../../models/user-data.model';
import { createIncasso } from '../../utils/common-utils';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseStoreService {
  UsersRef: AngularFireList<any>;
  IncassiRef: AngularFireList<any>;
  StatsUsersRef: AngularFireList<any>;
  StatsCanaleComRef: AngularFireList<any>;

  UserRef: AngularFireObject<any>;
  IncassoRef: AngularFireObject<any>;
  InventarioListRef: AngularFireList<any>;
  InventarioRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) {
    this.IncassiRef = this.db.list('incassi');
    this.InventarioListRef = this.db.list('inventario');
    this.UsersRef = this.db.list('users');
    this.StatsUsersRef = this.db.list('stats/users'); // Fix: Change the type to AngularFireList<any>
    this.StatsUsersRef = this.db.list('stats/canale_com'); // Fix: Change the type to AngularFireList<any>
  }

  GetIncassi() {
    return this.IncassiRef;
  }

  getInventario() {
    return this.InventarioListRef;
  }

  getUsersStatsResults() {
    return this.StatsUsersRef;
  }
  getCanaleComStatsResults() {
    return this.StatsCanaleComRef;
  }

  GetUserList() {
    return this.UsersRef;
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

  getSpeseFisse(mese: string): Observable<any> {
    return from(
      this.IncassiRef.query.orderByChild('mese').equalTo(mese).once('value')
    );
  }

  AddSpesaFissa(meseIncassoFisso: string, spesaFissa: SpesaFissa) {
    spesaFissa.id = this.db.createPushId();
    this.IncassiRef.query
      .orderByChild('mese')
      .equalTo(meseIncassoFisso)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let incassoObject = snapshot.val();
          let incasso: Incasso = Object.values(incassoObject)[0] as Incasso;
          incasso.spesaFissa = incasso.spesaFissa || [];
          incasso.spesaFissa.push(spesaFissa);
          this.UpdateIncasso(incasso);
        }
      });
  }

  UpdateSpesaFissa(
    id: string,
    meseIncassoFisso: string,
    spesaFissa: SpesaFissa
  ) {
    this.IncassiRef.query
      .orderByChild('mese')
      .equalTo(meseIncassoFisso)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let incassoObject = snapshot.val();
          let incasso: Incasso = Object.values(incassoObject)[0] as Incasso;
          let retrievedSpesaFissa: SpesaFissa[] = incasso.spesaFissa;

          retrievedSpesaFissa.forEach((spesa: SpesaFissa, index: number) => {
            if (spesa.id === id) {
              retrievedSpesaFissa[index] = spesaFissa;
            }
          });

          incasso.spesaFissa = retrievedSpesaFissa;
          this.UpdateIncasso(incasso);
        }
      });
  }

  DeleteSpesaFissa(id: string, meseIncassoFisso: string) {
    this.IncassiRef.query
      .orderByChild('mese')
      .equalTo(meseIncassoFisso)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let incassoObject = snapshot.val();
          let incasso: Incasso = Object.values(incassoObject)[0] as Incasso;
          incasso.spesaFissa = incasso.spesaFissa || [];
          incasso.spesaFissa.forEach((spesa: SpesaFissa, index: number) => {
            if (spesa.id === id) {
              incasso.spesaFissa.splice(index, 1);
            }
          });
          this.UpdateIncasso(incasso);
        }
      });
  }

  UpdateIncasso(incasso: Incasso) {
    this.IncassoRef = this.db.object(`incassi/${incasso.mese}`);
    this.IncassoRef.update(incasso);
  }

  // User CRUD
  AddUser(user: UserModel): string {
    let id: FirebaseOperation = user.id.toString();
    this.UsersRef.set(id, user);
    return id.toString();
  }

  GetUser(id: string | number) {
    typeof id === 'number' ? id.toString() : id;
    this.UserRef = this.db.object(`users/${id}`);
    return this.UserRef;
  }

  UpdateUser(user: UserModel) {
    this.UserRef = this.db.object(`users/${user.id}`);
    this.UserRef.update(user);
  }

  DeleteUser(id: string) {
    this.UserRef = this.db.object(`users/${id}`);
    this.UserRef.remove();
  }

  // Inventario CRUD
  getArticoloInventario(key: string) {
    this.InventarioRef = this.db.object(`inventario/${key}`);
    return this.InventarioRef.valueChanges();
  }

  deleteArticoloInventario(key: string) {
    this.InventarioRef = this.db.object(`inventario/${key}`);
    this.InventarioRef.remove();
  }

  addArticoloInventario(item: InventarioItemModel) {
    const generatedId = this.db.createPushId(); // Generate a unique ID
    this.InventarioRef = this.db.object(`inventario/${generatedId}`);
    this.InventarioRef.set(item);
  }

  editArticoloInventario(item: InventarioItemModel, key: string) {
    this.InventarioRef = this.db.object(`inventario/${key}`);
    this.InventarioRef.update(item);
    console.log('Item updated successfully!');
  }

  imeiArticolo(imei: string) {
    return this.InventarioListRef.query
      .orderByChild('imei')
      .equalTo(imei)
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        } else {
          return null;
        }
      });
  }
}
