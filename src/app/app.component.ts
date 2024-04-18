import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { TranslateCustomService } from './shared/services/translation/translate-custom-service.service';
import { fadeInAnimation } from './shared/utils/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fadeInAnimation],
})
export class AppComponent implements OnInit {
  isSidenavOpen = false;
  animate = false;
  constructor(
    private translateCustomService: TranslateCustomService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
