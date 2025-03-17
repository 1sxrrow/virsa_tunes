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
import { ListeModalService } from './liste-modal.service';
import { callModalToast } from 'src/app/shared/utils/common-utils';
import { MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';

interface ListValues {
  listName: string;
  values: any[];
}

@Component({
  selector: 'liste-modal',
  templateUrl: './liste-modal.component.html',
  styleUrls: ['liste-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ListeModalComponent implements OnInit, OnDestroy {
  @ViewChild('table') table: Table;
  @ViewChild('opAdd') opAdd: OverlayPanel;
  @ViewChild('opEdit') opEdit: OverlayPanel;
  @Input() showListeModal: boolean = false;
  @Output() showListeModalChange = new EventEmitter<boolean>();

  listeShow$: Observable<any>;
  listeSubscription: Subscription;

  showListListeModal: boolean = false;

  resultData: ListValues[] = [];

  loadingTable: boolean = true;
  listValue: string;
  private editId: string;
  private editList: string;

  constructor(
    private listeModalService: ListeModalService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.listeShow$ = this.listeModalService.getListe();
    this.listeSubscription = this.listeShow$.subscribe((data: ListValues[]) => {
      this.resultData = data;
      this.loadingTable = false;
    });
  }

  ngOnDestroy(): void {
    this.listeSubscription.unsubscribe();
  }

  handleClose() {
    this.showListeModal = false;
    this.showListeModalChange.emit(this.showListeModal);
  }

  handleShowListListeModalChange(show: boolean) {
    this.showListListeModal = show;
  }

  opAddWrap($event: any, value: string) {
    this.listValue = value;
    this.opAdd.toggle($event);
  }

  opEditWrap($event: any, value: string, id: string, editList: string) {
    this.editId = id;
    this.editList = editList;
    this.listValue = value;
    this.opEdit.toggle($event);
  }

  addItemList($event: any, listName: string) {
    this.listeModalService.setValoreInLista(listName, this.listValue);
    this.opAdd.toggle($event);
    callModalToast(
      this.messageService,
      'Aggiunto',
      `Valore ${this.listValue} aggiunto a lista ${listName}`
    );
    this.listValue = '';
  }

  editItemList() {
    this.listeModalService.updateValoreInLista(
      this.editList,
      this.listValue,
      this.editId
    );
    callModalToast(
      this.messageService,
      'Modificato',
      `Valore ${this.listValue} modificato correttamente`,
      'info'
    );
    this.listValue = '';
  }

  removeItemList(listName: string, id: string) {
    this.listeModalService.deleteValoreInLista(listName, id);
    callModalToast(this.messageService, 'Eliminato', 'Valore rimosso', 'info');
  }
}
