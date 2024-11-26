// users-with-interventi.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { UserDataService } from './user-data/user-data.service';

export const usersWithInterventiResolver: ResolveFn<any> = () => {
  const usersService = inject(UserDataService);
  return usersService.fetchUsersWithInterventi().pipe(
    switchMap(() => usersService.getUsersWithInterventiObservable()),
    catchError((error) => {
      console.error('Error in resolver:', error);
      return of([]);
    })
  );
};
