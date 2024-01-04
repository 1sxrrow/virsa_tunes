import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../login/auth.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('rotate', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('default <=> rotated', animate('500ms ease-out')),
    ]),
  ],
})
export class HeaderComponent implements AfterViewInit {
  @Output() isSidenavOpen = new EventEmitter<boolean>();
  isSidenavOpenChange = false;
  isLogin = true;
  isRotated = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngAfterViewInit(): void {
    // Check if route is login
    this.router.events.subscribe((event) => {
      event instanceof NavigationEnd
        ? (this.isLogin =
            event.urlAfterRedirects === '/login'
              ? (this.isLogin = true)
              : false)
        : null;
    });
  }

  goHome() {
    if (this.authService.getUserState()) {
      this.router.navigate(['/']);
    }
  }

  setSidenavState() {
    this.isRotated = !this.isRotated;
    this.isSidenavOpenChange = !this.isSidenavOpenChange;
    this.isSidenavOpen.emit(this.isSidenavOpenChange);
  }
}
