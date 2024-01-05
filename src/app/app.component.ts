import { Component, OnInit } from '@angular/core';
import {
  ChildrenOutletContexts,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { PrintService } from './shared/services/print/recipe-print.service';
import { TranslateCustomService } from './shared/services/translation/translate-custom-service.service';
import { fadeInAnimation } from './shared/utils/animations';
import { filter } from 'rxjs';

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
    private printService: PrintService,
    private contexts: ChildrenOutletContexts,
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

  onSidenavToggle(state: boolean) {
    console.log('onSidenavToggle', state);
    this.isSidenavOpen = state;
  }

  setPrinterDevice() {
    this.printService.chooseDevice();
  }

  title = 'virsa_tunes';
}
