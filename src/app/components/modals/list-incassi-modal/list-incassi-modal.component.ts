import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SpecificDataModel } from 'src/app/shared/models/specific-data.model';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { ListIncassiModalService } from './list-incassi-modal.service';

@Component({
  selector: 'list-incassi-modal',
  templateUrl: './list-incassi-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ListIncassiModalComponent implements OnInit, OnDestroy {
  @Input() showIncassiModal: boolean;
  @Input() meseInput: string = '';
  @Output() showIncassiModalChange = new EventEmitter<boolean>();

  filteredMeseIncassi: { user: UserModel; data: SpecificDataModel }[] = [];
  private subscriptions: Subscription = new Subscription();

  loading: boolean = false;

  constructor(private listIncassiModalService: ListIncassiModalService) {}

  ngOnInit(): void {
    this.loading = true;
    this.subscriptions.add(
      this.listIncassiModalService
        .getListIncassiFromMonth(this.meseInput)
        .subscribe((dataResult) => {
          this.filteredMeseIncassi = dataResult;
          this.loading = false;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleClose() {
    this.showIncassiModal = false;
    this.showIncassiModalChange.emit(this.showIncassiModal);
  }
}
