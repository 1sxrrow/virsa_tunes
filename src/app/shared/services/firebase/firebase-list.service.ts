import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, Observable } from 'rxjs';
import { selectDataSet } from '../../types/custom-types';

@Injectable({ providedIn: 'root' })
export class FirebaseListService {
  constructor(private db: AngularFireDatabase) {}

  getListValue(lista: string): Observable<selectDataSet[]> {
    const ListaRef = this.db.list(`/liste/${lista}`);
    return ListaRef.snapshotChanges().pipe(
      map((data) => {
        const values: selectDataSet[] = [];
        data.map((item) => {
          const value = item.payload.toJSON().toString();
          const valueItem = { label: value, value };
          values.push(valueItem);
        });
        return values;
      })
    );
  }
}
