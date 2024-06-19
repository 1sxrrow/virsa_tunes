import {
  Component,
  ElementRef,
  isDevMode,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { updateProfile } from 'firebase/auth';
import { environmentValues } from 'src/app/shared/utils/enviromentValues';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  passwordValue: string;
  emailValue: string;
  emailError = false;
  passwordError = false;
  loading = false;
  errorMessage;

  @ViewChild('emailInput') emailInput: ElementRef;
  @ViewChild('passwordInput') passwordInput: ElementRef;
  @ViewChild('passwordHelp') passwordHelp: ElementRef;
  @ViewChild('emailHelp') emailHelp: ElementRef;

  constructor(
    public afAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router
  ) {
    if (isDevMode()) {
      this.emailValue = environmentValues.emailValue;
      this.passwordValue = environmentValues.passwordValue;
      this.CheckLogin();
    }
  }

  CheckLogin() {
    this.loading = true;
    this.afAuth
      .signInWithEmailAndPassword(this.emailValue, this.passwordValue)
      .then((result) => {
        this.authService.setUserState(result.user);
        //set user in memory
        localStorage.setItem(
          'user',
          JSON.stringify(this.authService.getUserState())
        );
        JSON.parse(localStorage.getItem('user'));

        this.checkUsername(result.user);
        this.router.navigate(['/users']);
      })
      .catch((error) => {
        this.loading = false;
        this.checkError(error);
      });
  }

  checkError(error) {
    console.log(error.message);
    //TODO controllare che se presente 1 errore non faccio rivedre errore (forse meglio usare un booleano)
    switch (error.message) {
      case 'Firebase: Error (auth/missing-email).':
        this.errorMessage = 'Campo Email obbligatorio';
        this.emailError = true;
        break;
      case 'Firebase: A non-empty password must be provided (auth/missing-password).':
        this.errorMessage = 'Campo password obbligatorio';
        this.passwordError = true;
      case 'Firebase: The password is invalid or the user does not have a password. (auth/wrong-password).':
        this.errorMessage = 'password errata';
        this.passwordError = true;
        break;
      case 'Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).':
        this.errorMessage = 'Credenziali errate';
        this.emailError = true;
        break;
      case 'Firebase: The email address is badly formatted. (auth/invalid-email).':
        this.errorMessage = 'Campo email errato';
        this.emailError = true;
        break;
      default:
        console.log('entrato in default');
        break;
    }
    setTimeout(() => {
      this.emailError = false;
      this.passwordError = false;
      this.errorMessage = '';
    }, 5000); // remove the class after 5 seconds
  }

  checkUsername(user: any) {
    if (!user.displayName) {
      updateProfile(this.authService.getUserState(), {
        displayName: user.email.substring(0, user.email.indexOf('@')),
      }).then(() => {
        console.log('profile updated');
      });
    } else {
      console.log('displayName already set!');
    }
  }
}
