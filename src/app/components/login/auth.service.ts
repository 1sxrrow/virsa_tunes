import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAdmin = false;
  private userState: any;
  private userStatus = new BehaviorSubject<boolean>(false);
  constructor(public afAuth: AngularFireAuth) {}

  setUserState(userState: any) {
    this.userState = userState;
    this.isAdmin =
      userState &&
      (userState.email === process.env.ADMIN_USER ||
        userState.email === process.env.SECOND_ADMIN_USER);
  }

  getUserState() {
    return this.userState;
  }

  getIsAdmin() {
    return this.isAdmin;
  }

  getUserStatus(): Observable<boolean> {
    return this.userStatus.asObservable();
  }

  login(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then((result) => {
          this.setUserState(result.user);
          //set user in memory
          localStorage.setItem('user', JSON.stringify(this.getUserState()));
          JSON.parse(localStorage.getItem('user'));
          this.userStatus.next(true);
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  logout(): void {
    this.afAuth.signOut();
    localStorage.removeItem('user');
    this.userStatus.next(false);
  }
}
