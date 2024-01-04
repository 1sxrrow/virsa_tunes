import { Component, OnInit } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { TranslateCustomService } from './shared/services/translation/translate-custom-service.service';
import { slideInAnimation } from './shared/utils/animations';
import { PrintService } from './shared/services/print/recipe-print.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation],
})
export class AppComponent implements OnInit {
  isSidenavOpen = false;

  constructor(
    private translateCustomService: TranslateCustomService,
    private printService: PrintService,
    private contexts: ChildrenOutletContexts
  ) {}

  ngOnInit(): void {
    this.translateCustomService;
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
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
