import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './components/login/auth.service';
import { TranslateCustomService } from './shared/services/translation/translate-custom-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('0.7s', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  isSidenavOpen = false;
  isUserSignedin = false;
  animate = false;
  constructor(
    private translateCustomService: TranslateCustomService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.getUserStatus().subscribe((result) => {
      this.isUserSignedin = result;
    });
    this.translateCustomService;
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.animate = false; // reset the animation state
        setTimeout(() => (this.animate = true), 0); // start the animation on the next tick
      });
  }

  isScrollbarPresent(): boolean {
    return document.body.scrollHeight > window.innerHeight;
  }

  title = 'virsa_tunes';
}
