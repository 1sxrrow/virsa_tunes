import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ListeModalService {
  ListeRef: AngularFireList<any>;
  UserRef: AngularFireList<any>;

  ListaRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) {
    this.ListeRef = this.db.list('liste');
  }

  getListe(): Observable<any> {
    return this.ListeRef.snapshotChanges().pipe(
      map((data) => {
        return data.map((item) => {
          const values = [];
          for (const [key, value] of Object.entries(item.payload.toJSON())) {
            values.push({ id: key, value });
          }
          let listName = item.key;
          return { listName, values };
        });
      })
    );
  }

  setValoreInLista(lista: string, value: string) {
    const ListaRef = this.db.list(`/liste/${lista}`);
    ListaRef.push(value);
  }

  updateValoreInLista(lista: string, value: string, id: string) {
    this.ListaRef = this.db.object(`/liste/${lista}`);
    const updatedObject = { [id]: value };
    this.ListaRef.update(updatedObject);
  }

  deleteValoreInLista(lista: string, value: string) {
    this.ListeRef.query
      .orderByKey()
      .equalTo(lista)
      .once('value', (snapshot) => {
        if (snapshot.exists()) {
          const listKey = Object.keys(snapshot.val())[0];
          const listRef = this.db.list(`liste/${listKey}`);
          listRef.remove(value);
        }
      });
  }
}
