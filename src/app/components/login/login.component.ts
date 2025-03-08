import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { updateProfile } from 'firebase/auth';
import { appName, IS_DEV_MODE } from 'src/app/app.module';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  appName: string;
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
    private authService: AuthService,
    private router: Router,
    @Inject(IS_DEV_MODE) public isDevMode: boolean
  ) {}

  ngOnInit(): void {
    this.appName = appName;
    this.autoLogin();
  }

  CheckLogin() {
    this.loading = true;
    this.authService.login(this.emailValue, this.passwordValue).subscribe(
      (result) => {
        this.checkUsername(result.user);
        this.router.navigate(['/users']);
      },
      (error) => {
        this.loading = false;
        this.checkError(error);
      }
    );
  }

  checkError(error) {
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
      case 'Firebase: Error (auth/invalid-login-credentials).':
        this.errorMessage = 'Credenziali errate';
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

  private autoLogin() {
    if (this.isDevMode && process.env.AUTO_LOGIN == 'true') {
      this.emailValue = process.env.SECOND_ADMIN_USER;
      this.passwordValue = process.env.SECOND_ADMIN_PWD;
      this.CheckLogin();
    }
  }
}
