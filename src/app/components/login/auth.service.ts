import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAdmin = false;
  private userState: any;
  constructor() {}

  setUserState(userState: any) {
    this.userState = userState;
    this.isAdmin =
      userState &&
      (userState.email === 'virsatunes20@gmail.com' ||
        userState.email === 'test@test.com');
  }

  getUserState() {
    return this.userState;
  }

  getIsAdmin() {
    return this.isAdmin;
  }
}
