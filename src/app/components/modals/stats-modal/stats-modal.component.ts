import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { calculateMese } from 'src/app/shared/utils/common-utils';
import { UserDataService } from '../../users/user-data/user-data.service';
import { StatsModalService } from './stats-modal.service';

@Component({
  selector: 'stats-modal',
  templateUrl: 'stats-modal.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StatsModalComponent implements OnInit, OnDestroy {
  @Input() showStatsModal: boolean;
  @Output() showStatsModalChange = new EventEmitter<boolean>();

  loading = false;

  listaUtenti: UserModel[] = [];
  mesiStats: { [monthYear: string]: { [canale: string]: number } } = {};
  statsArray: { mese: string; canale: string; count: number }[] = [];
  canali: string[] = [];
  pivotData: any[] = [];

  canaleComResults$: Observable<{ name: string; value: number }[]>;
  placeholder = [{ test: 'test' }];

  private noDataPrefix = 'Nessuna Data Presente';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private userDataService: UserDataService,
    private statsModalService: StatsModalService
  ) {}

  ngOnInit(): void {
    this.getStats();
    this.canaleComResults$ =
      this.statsModalService.getcanaleComunicazioniResultObservable();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleClose() {
    this.showStatsModal = false;
    this.showStatsModalChange.emit(this.showStatsModal);
  }

  getStats() {
    this.loading = true;
    this.subscriptions.add(
      this.userDataService.fetchUsersWithInterventi().subscribe((users) => {
        this.listaUtenti = users;
        // Costruisco la mappa (mese-anno -> canale -> contatore)
        users.forEach((user) => {
          if (user.dataInserimento) {
            // Estraggo mese e anno
            const parts = user.dataInserimento.split('/');
            if (parts.length === 3) {
              const month = parts[1];
              const year = parts[2];
              const monthYear = `${month}-${year}`;
              // Inizializzo struttura se non esiste
              if (!this.mesiStats[monthYear]) {
                this.mesiStats[monthYear] = {};
              }
              const canale = user.canale_com || 'Sconosciuto';
              if (!this.mesiStats[monthYear][canale]) {
                this.mesiStats[monthYear][canale] = 0;
              }
              this.mesiStats[monthYear][canale]++;
            }
          } else if (!user.dataInserimento) {
            if (!this.mesiStats[this.noDataPrefix]) {
              this.mesiStats[this.noDataPrefix] = {};
            }
            const canale = user.canale_com || 'Sconosciuto';
            if (!this.mesiStats[this.noDataPrefix][canale]) {
              this.mesiStats[this.noDataPrefix][canale] = 0;
            }
            this.mesiStats[this.noDataPrefix][canale]++;
          }
        });
        Object.keys(this.mesiStats).forEach((meseKey) => {
          Object.keys(this.mesiStats[meseKey]).forEach((canaleKey) => {
            this.statsArray.push({
              mese: meseKey,
              canale: canaleKey,
              count: this.mesiStats[meseKey][canaleKey],
            });
          });
        });

        const canaleSet = new Set<string>();
        this.statsArray.forEach((item) => canaleSet.add(item.canale));
        this.canali = Array.from(canaleSet);

        // Pivot the data so each mese is a row, each canale is a column
        const meseMap: { [meseKey: string]: any } = {};

        this.statsArray.forEach(({ mese, canale, count }) => {
          if (!meseMap[mese]) {
            meseMap[mese] = { mese };
          }
          meseMap[mese][canale] = count;
        });

        this.pivotData = Object.values(meseMap);

        this.loading = false;
      })
    );
  }
}
