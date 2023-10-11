import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  constructor(private router: Router, private authService: AuthService) {}

  goHome() {
    if (this.authService.userState) {
      console.log(this.authService.userState);
      this.router.navigate(['/']);
    }
  }
}
