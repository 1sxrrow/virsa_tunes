import { Injectable } from '@angular/core';
import { from, map, mergeMap, toArray } from 'rxjs';
import { Incassov2 } from 'src/app/shared/models/custom-interfaces';
import { FirebaseStoreService } from 'src/app/shared/services/firebase/firebase-store.service';

@Injectable({
  providedIn: 'root',
})
export class ListIncassiModalService {
  constructor(private firebaseStoreService: FirebaseStoreService) {}

  getListIncassiFromMonth(meseInput: string) {
    return this.firebaseStoreService
      .GetIncassiv2()
      .snapshotChanges()
      .pipe(
        map((data) =>
          data.filter(
            (item) => (item.payload.val() as Incassov2).mese === meseInput
          )
        ),
        mergeMap((filteredData) =>
          from(filteredData).pipe(
            mergeMap((item) =>
              from(this.firebaseStoreService.getArticoloFromIncasso(item.key))
            ),
            toArray()
          )
        )
      );
  }
}
