import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { FirebaseOperation } from '@angular/fire/compat/database/interfaces';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { saveAs } from 'file-saver';
import firebase from 'firebase/compat/app';
import { from, Observable } from 'rxjs';
import {
  devFirebaseConfig,
  prodFirebaseConfig,
} from 'src/environments/environment';
import { Incasso } from '../../models/incasso.model';
import { InventarioItemModel } from '../../models/inventarioItem.model';
import { SpesaFissa } from '../../models/spesaFissa.model';
import { UserModel } from '../../models/user-data.model';
import { createIncasso } from '../../utils/common-utils';

@Injectable({ providedIn: 'root' })
export class FirebaseStoreService {

  UsersRef: AngularFireList<any>;
  IncassiRef: AngularFireList<any>;
  StatsUsersRef: AngularFireList<any>;
  StatsCanaleComRef: AngularFireList<any>;
  InventarioListRef: AngularFireList<any>;

  UserRef: AngularFireObject<any>;
  IncassoRef: AngularFireObject<any>;
  InventarioRef: AngularFireObject<any>;

  private currentApp: firebase.app.App;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private afs: AngularFireStorage
  ) {
    this.IncassiRef = this.db.list('incassi');
    this.InventarioListRef = this.db.list('inventario');
    this.UsersRef = this.db.list('users');
    this.StatsUsersRef = this.db.list('stats/users');
  }

  switchProject(projectKey: string) {
    const config =
      projectKey === 'test' ? devFirebaseConfig : prodFirebaseConfig;
    if (!config) {
      throw new Error('Invalid project key');
    }

    if (firebase.apps.length > 1) {
      firebase
        .app(projectKey)
        .delete()
        .then(() => {
          this.currentApp = firebase.initializeApp(config, projectKey);
        });
    } else {
      this.currentApp = firebase.initializeApp(config, projectKey);
    }

    // this.afAuth.useEmulator(this.currentApp.auth().useEmulator);
    // this.afs.firestore.settings({
    //   host: `${this.currentApp.options.projectId}.firebaseapp.com`,
    // });
  }

  async exportDatabaseToJSON() {
    const snapshot = await this.db.database.ref().once('value');
    const data = snapshot.val();
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const filename = `database_export_${new Date().toLocaleDateString()}.json`;
    saveAs(blob, filename);
  }

  async importDatabaseFromJSON(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      const data = JSON.parse(reader.result as string);
      await this.db.database.ref().set(data);
    };
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

  AddIncasso(incasso_intervento: Incasso, mese: string, negozio: string) {
    this.GetIncassi();
    let incasso: Incasso;
    this.IncassiRef.query
      .orderByChild('mese')
      .equalTo(mese)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let incassoObject = snapshot.val();
          let incasso: Incasso = Object.values(incassoObject)[0] as Incasso;
          incasso_intervento.negozi.forEach((negozioIntervento) => {
            let foundNegozio = undefined;
            if (incasso.negozi) {
              foundNegozio = incasso.negozi.find(
                (n) => n.negozio === negozioIntervento.negozio
              );
            }
            if (foundNegozio) {
              foundNegozio.incasso += +negozioIntervento.incasso;
              foundNegozio.spese += +negozioIntervento.spese;
              foundNegozio.netto = foundNegozio.incasso - foundNegozio.spese;
            } else {
              incasso.negozi = [];
              incasso.negozi.push(negozioIntervento);
            }
          });

          incasso.incassoTotale += incasso_intervento.incassoTotale;
          incasso.speseTotale += incasso_intervento.speseTotale;
          incasso.nettoTotale = incasso.incassoTotale - incasso.speseTotale;
          this.UpdateIncasso(incasso);
        } else {
          incasso = createIncasso(
            incasso_intervento.incassoTotale,
            mese,
            incasso_intervento.speseTotale,
            negozio
          );
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

  updateArticoloImei(imei: string, item: InventarioItemModel) {
    this.InventarioListRef.query
      .orderByChild('imei')
      .equalTo(imei)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          let key = Object.keys(snapshot.val())[0];
          this.InventarioListRef.update(key, item);
        }
      });
  }
}
