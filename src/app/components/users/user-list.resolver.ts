// users-with-interventi.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { UserDataService } from './user-data/user-data.service';

export const usersWithInterventiResolver: ResolveFn<any> = () => {
  const usersService = inject(UserDataService);
  let t = usersService.getUsersWithInterventiObservable();
  console.log(t);
  return t;
};
