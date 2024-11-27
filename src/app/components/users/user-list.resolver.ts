// users-with-interventi.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { UserDataService } from './user-data/user-data.service';
import { UserCacheService } from 'src/app/shared/services/user-cache.service';

export const usersWithInterventiResolver: ResolveFn<any> = () => {
  const usersService = inject(UserDataService);
  const userCacheService = inject(UserCacheService);
  return usersService.fetchUsersWithInterventi().pipe(
    switchMap((data) => {
      if (userCacheService.hasDataChanged(data.users)) {
        console.log('User data has changed, fetching new data.');
        return usersService.getUsersWithInterventiObservable();
      } else {
        console.log('User data has not changed, using cached data.');
        return of(userCacheService.getCachedUsers());
      }
    }),
    catchError((error) => {
      console.error('Error in resolver:', error);
      return of(userCacheService.getCachedUsers());
    })
  );
};
