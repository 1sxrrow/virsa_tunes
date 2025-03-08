import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Table } from 'primeng/table';
import { Observable, Subscription } from 'rxjs';
import {
  FirebaseStoreService,
  resultAcquistInterface,
} from 'src/app/shared/services/firebase/firebase-store.service';

@Component({
  selector: 'acquisti-modal',
  templateUrl: './acquisti-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AcquistiModalComponent implements OnInit, OnDestroy {
  @ViewChild('table') table: Table;
  @Input() showAcquistiModal: boolean = false;
  @Output() showAcquistiModalChange = new EventEmitter<boolean>();

  acquistiShow$: Observable<resultAcquistInterface[]>;
  acquistiSubscription: Subscription;

  showListAcquistiModal: boolean = false;

  loadingTable: boolean = true;

  constructor(private firebaseStoreService: FirebaseStoreService) {}

  ngOnInit(): void {
    this.acquistiShow$ = this.firebaseStoreService.getAcquistiClienti();
    this.acquistiSubscription = this.acquistiShow$.subscribe(() => {
      this.loadingTable = false;
    });
  }

  ngOnDestroy(): void {
    this.acquistiSubscription.unsubscribe();
  }

  handleClose() {
    this.showAcquistiModal = false;
    this.showAcquistiModalChange.emit(this.showAcquistiModal);
  }

  handleShowListAcquistiModalChange(show: boolean) {
    this.showListAcquistiModal = show;
  }

  filterAcquisti() {
    this.loadingTable = true;
  }
}
