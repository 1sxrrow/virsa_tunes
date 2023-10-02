import {
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User, getAuth, updateProfile } from 'firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  emailMessage = false;
  passwordMessage = false;
  passwordValue: string;
  emailValue: string;

  @ViewChild('emailInput') emailInput: ElementRef;
  @ViewChild('passwordInput') passwordInput: ElementRef;
  @ViewChild('passwordHelp') passwordHelp: ElementRef;
  @ViewChild('emailHelp') emailHelp: ElementRef;

  constructor(
    public afAuth: AngularFireAuth,
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router
  ) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.authService.userState = user;
        localStorage.setItem(
          'user',
          JSON.stringify(this.authService.userState)
        );
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    });
  }

  ngAfterViewInit() {
    console.log('afterinit');
  }

  CheckLogin() {
    return this.afAuth
      .signInWithEmailAndPassword(this.emailValue, this.passwordValue)
      .then((result) => {
        console.log(result);
        this.checkUsername(result.user);
        this.router.navigate(['/users']);
      })
      .catch((error) => {
        this.checkError(error);
      });
  }

  checkError(error) {
    console.log(error.message);
    switch (error.message) {
      case 'Firebase: Error (auth/missing-email).':
        console.log('entrato in case');
        this.emailInput.nativeElement.className += ' ng-invalid ng-dirty';
        this.renderer.appendChild(
          this.emailHelp.nativeElement,
          this.renderer.createText('Campo email obbligatorio')
        );
        this.emailMessage = !this.emailMessage;
        setTimeout(() => {
          this.renderer.removeClass(this.emailInput.nativeElement, 'ng-dirty');
          this.renderer.removeClass(
            this.emailInput.nativeElement,
            'ng-invalid'
          );
          this.emailMessage = !this.emailMessage;
        }, 5000);
        break;
      case 'Firebase: A non-empty password must be provided (auth/missing-password).':
        console.log('entrato in case');
        this.passwordInput.nativeElement.className += ' ng-invalid ng-dirty';
        this.renderer.appendChild(
          this.passwordHelp.nativeElement,
          this.renderer.createText('Campo password obbligatorio')
        );
        this.passwordMessage = !this.passwordMessage;
        setTimeout(() => {
          this.renderer.removeClass(
            this.passwordInput.nativeElement,
            'ng-dirty'
          );
          this.renderer.removeClass(
            this.passwordInput.nativeElement,
            'ng-invalid'
          );
          this.passwordMessage = !this.passwordMessage;
        }, 5000);
      case 'Firebase: The password is invalid or the user does not have a password. (auth/wrong-password).':
        console.log('entrato in case');
        this.passwordInput.nativeElement.className += ' ng-invalid ng-dirty';
        this.renderer.appendChild(
          this.passwordHelp.nativeElement,
          this.renderer.createText('Password errata')
        );
        this.passwordMessage = !this.passwordMessage;
        setTimeout(() => {
          this.renderer.removeClass(
            this.passwordInput.nativeElement,
            'ng-dirty'
          );
          this.renderer.removeClass(
            this.passwordInput.nativeElement,
            'ng-invalid'
          );
          this.passwordMessage = !this.passwordMessage;
        }, 5000);
        break;
      case 'Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).':
        console.log('entrato in case');
        this.emailInput.nativeElement.className += ' ng-invalid ng-dirty';
        this.passwordInput.nativeElement.className += ' ng-invalid ng-dirty';
        this.renderer.appendChild(
          this.passwordHelp.nativeElement,
          this.renderer.createText('Credenziali errate')
        );
        this.emailMessage = !this.emailMessage;
        this.passwordMessage = !this.passwordMessage;
        setTimeout(() => {
          this.renderer.removeClass(
            this.passwordInput.nativeElement,
            'ng-dirty'
          );
          this.renderer.removeClass(
            this.passwordInput.nativeElement,
            'ng-invalid'
          );
          this.renderer.removeClass(this.emailInput.nativeElement, 'ng-dirty');
          this.renderer.removeClass(
            this.emailInput.nativeElement,
            'ng-invalid'
          );
          this.passwordMessage = !this.passwordMessage;
          this.emailMessage = !this.emailMessage;
        }, 5000);
      default:
        console.log('entrato in default');
        break;
    }
  }

  hideAfterChange(input: ElementRef, boolVal: boolean) {
    //Rimuovere ng-dirty ng-invalid dopo 5 sec.
  }

  checkUsername(user: any) {
    if (!user.displayName) {
      updateProfile(this.authService.userState, {
        displayName: user.email.substring(0, user.email.indexOf('@')),
      }).then(() => {
        console.log('profile updated');
      });
    } else {
      console.log('profile has displayName already set!');
    }
  }
}
