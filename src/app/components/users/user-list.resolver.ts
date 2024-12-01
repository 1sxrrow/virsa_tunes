// users-with-interventi.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { UserDataService } from './user-data/user-data.service';
import { UserCacheService } from 'src/app/shared/services/user-cache.service';

export const usersWithInterventiResolver: ResolveFn<any> = () => {
  const usersService = inject(UserDataService);
  const userCacheService = inject(UserCacheService);
  return usersService.fetchUsersWithInterventi().pipe(
    tap((data) => {
      const cachedData = userCacheService.getCachedData('usersWithInterventi');
      if (
        userCacheService.hasDataChanged('usersWithInterventi', data) ||
        cachedData.length === 0
      ) {
        console.log(
          'Data has changed or no cached data found, fetching new data.'
        );
        userCacheService.cacheData('usersWithInterventi', data);
        usersService.setUsersWithInterventi(data);
      } else {
        console.log('Data has not changed, using cached data.');
        usersService.setUsersWithInterventi(cachedData);
      }
    }),
    catchError((error) => {
      console.error('Error in resolver:', error);
      const cachedData = userCacheService.getCachedData('usersWithInterventi');
      if (cachedData) {
        return of(cachedData);
      } else {
        return usersService.getUsersWithInterventiObservable().pipe(
          switchMap((newData) => {
            userCacheService.cacheData('usersWithInterventi', newData);
            return of(newData);
          })
        );
      }
    })
  );
};
