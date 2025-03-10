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
import {
  devFirebaseConfig,
  prodFirebaseConfig,
} from 'src/environments/environment';
import { Incasso, Incassov2, SpesaFissa } from '../../models/custom-interfaces';
import { InventarioItemModel } from '../../models/inventarioItem.model';
import { UserModel } from '../../models/user-data.model';
import { createIncasso } from '../../utils/common-utils';
import { formatDate } from '@angular/common';
import { map, Observable } from 'rxjs';
export interface resultAcquistInterface {
  cliente: String;
  dataAcquistoInventario: String;
  marca: String;
  garanzia: String;
  colore: String;
  fornitore: String;
  quantita: Number;
  memoria: Number;
  grado: String;
  percentuale: Number;
  prezzo_acquisto: Number;
  prezzo_online: Number;
  prezzo_negozio: Number;
  imei: String;
}

@Injectable({ providedIn: 'root' })
export class FirebaseStoreService {
  UsersRef: AngularFireList<UserModel>;
  IncassiRef: AngularFireList<any>;
  IncassiRefv2: AngularFireList<any>;
  StatsUsersRef: AngularFireList<any>;
  StatsCanaleComRef: AngularFireList<any>;
  InventarioListRef: AngularFireList<any>;

  UserRef: AngularFireObject<any>;
  IncassoRef: AngularFireObject<any>;
  IncassoRefv2: AngularFireObject<any>;
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
              foundNegozio.netto = (foundNegozio.incasso -
                foundNegozio.spese) as Number;
            } else {
              if (incasso.negozi.length > 0) {
                incasso.negozi.push(negozioIntervento);
              } else {
                incasso.negozi = [];
                incasso.negozi.push(negozioIntervento);
              }
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

  AddIncassov2(idDbIncasso: string, incassoObject: Incassov2) {
    const IncassoRefv2 = this.db.object(`/incassi/${idDbIncasso}`);
    IncassoRefv2.set(incassoObject);
  }

  GetIncassiv2() {
    const IncassiRefv2 = this.db.list<Incassov2>(`/incassi`);
    return IncassiRefv2;
  }

  GetIncassov2(idDbIncasso: string) {
    const IncassoRefv2 = this.db.object(`/incassi/${idDbIncasso}`);
    return IncassoRefv2.valueChanges();
  }

  UpdateIncassov2(idDbIncasso: string, incassoObject: Incassov2) {
    const IncassoRefv2 = this.db.object(`/incassi/${idDbIncasso}`);
    IncassoRefv2.update(incassoObject);
  }

  deleteIncassov2(idDbIncasso: string) {
    const InventarioRef = this.db.object(`/incassi/${idDbIncasso}`);
    InventarioRef.remove();
  }

  getSpeseFisseMese(mese: string) {
    const spesaFissaList = this.db.list<SpesaFissa>(`/speseFisse/${mese}`);
    return spesaFissaList;
  }

  getSpeseFisse() {
    const spesaFissaList = this.db.list<SpesaFissa>(`/speseFisse/`);
    return spesaFissaList;
  }

  AddSpesaFissa(meseIncassoFisso: string, spesaFissa: SpesaFissa) {
    spesaFissa.id = this.db.createPushId();
    const spesaFissaList = this.db.object(
      `/speseFisse/${meseIncassoFisso}/${spesaFissa.id}`
    );
    spesaFissaList.set(spesaFissa);
  }

  UpdateSpesaFissa(
    id: string,
    meseIncassoFisso: string,
    spesaFissa: SpesaFissa
  ) {
    const spesaFissaList = this.db.object(
      `/speseFisse/${meseIncassoFisso}/${id}`
    );
    spesaFissaList.update(spesaFissa);
  }

  DeleteSpesaFissa(id: string, meseIncassoFisso: string) {
    const spesaFissaList = this.db.object(
      `/speseFisse/${meseIncassoFisso}/${id}`
    );
    spesaFissaList.remove();
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
    return generatedId;
  }

  editArticoloInventario(item: InventarioItemModel, key: string) {
    this.InventarioRef = this.db.object(`inventario/${key}`);
    this.InventarioRef.update(item);
    console.log('Item updated successfully!');
  }

  async imeiArticolo(imei: string) {
    const snapshot = await this.InventarioListRef.query
      .orderByChild('imei')
      .equalTo(imei)
      .once('value');

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
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

  generateId() {
    return this.db.createPushId(); // Generate a unique ID
  }

  async getArticoloFromIncasso(idIncassoInput: string) {
    const snapshot = await this.UsersRef.query.orderByChild('id').once('value');
    if (snapshot.exists()) {
      const users: UserModel[] = Object.values(snapshot.val());
      for (const user of users) {
        if (user.specific_data) {
          for (const item of user.specific_data) {
            if (item.idDbIncasso && item.idDbIncasso === idIncassoInput) {
              item.data_intervento = formatDate(
                new Date(item.data_intervento),
                'dd/MM/yyyy',
                'it-IT'
              );
              return { user, data: item };
            }
          }
        }
      }
    }
  }

  getAcquistiClienti(): Observable<resultAcquistInterface[]> {
    return this.UsersRef.snapshotChanges().pipe(
      map((changes) =>
        changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
      ),
      map((users: UserModel[]) => {
        const result: resultAcquistInterface[] = [];
        users.forEach((user) => {
          if (user.specific_data) {
            user.specific_data.forEach((item) => {
              if (item['idArticolo']) {
                const itemResult = {
                  cliente: `${user.nome} ${user.cognome}`,
                  dataAcquistoInventario: item['dataAcquistoInventario'],
                  marca: item['marca'],
                  garanzia: item['garanzia_mesi'],
                  colore: item['colore'],
                  fornitore: item['fornitore'],
                  quantita: item['quantita'],
                  memoria: item['memoria'],
                  grado: item['grado'],
                  percentuale: item['perc_batteria'],
                  prezzo_acquisto: item['prezzo_acquisto'],
                  prezzo_online: item['prezzo_online'],
                  prezzo_negozio: item['prezzo_negozio'],
                  negozio: item['negozio'],
                  imei: `${item['imei']}`,
                };
                result.push(itemResult);
              }
            });
          }
        });
        return result;
      })
    );
  }

  getTelefoniClienti() {
    return this.UsersRef.snapshotChanges().pipe(
      map((changes) =>
        changes.map((c) => ({ key: c.payload.key, ...c.payload.val() }))
      ),
      map((users: UserModel[]) => {
        const result = [];
        users.forEach((user) => {
          const itemResult = {
            cliente: `${user.nome} ${user.cognome}`,
            telefono: user.numero_telefono,
          };
          result.push(itemResult);
        });
        return result;
      })
    );
  }
}
