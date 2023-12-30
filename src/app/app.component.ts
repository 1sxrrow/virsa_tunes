import { Component, OnInit } from '@angular/core';
import { ChildrenOutletContexts } from '@angular/router';
import { TranslateCustomService } from './shared/services/translation/translate-custom-service.service';
import { slideInAnimation } from './shared/utils/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [slideInAnimation],
})
export class AppComponent implements OnInit {
  constructor(
    private translateCustomService: TranslateCustomService,
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

  title = 'virsa_tunes';
}
