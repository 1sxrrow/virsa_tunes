import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserListModalStorage } from './user-list-modal-storage.service';
import { UserListModalService } from './user-list-modal.service';
import { UserModel } from 'src/app/shared/models/user-data.model';
import { UserDataService } from '../user-data/user-data.service';
import { callModalToast, createForm } from 'src/app/shared/utils/common-utils';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'user-list-modal',
  templateUrl: 'user-list-modal.component.html',
  styleUrls: ['user-list-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UserListModalComponent implements OnInit {
  @Input() formData: FormGroup = undefined;
  @Input() showModal: boolean = false;
  @Output() showModalChange = new EventEmitter();

  modalTitle: string = '';
  protected mode: string = '';

  checkedFattura: boolean = false;

  utenteUltimaModifica: string;
  utenteInserimento: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storage: UserListModalStorage,
    private userDataService: UserDataService,
    private messageService: MessageService,
    private userListModalService: UserListModalService
  ) {}
  ngOnInit(): void {
    if (this.storage.input.selectedItem) {
      this.mode = 'Edit';
      this.modalTitle = 'Info Cliente';
      this.formData = createForm(
        this.fb,
        this.storage.input.selectedItem,
        undefined
      );
    } else {
      this.mode = 'Add';
      this.modalTitle = 'Aggiungi Cliente';
      this.initForm();
    }
    try {
      let datiFatturaStructure = this.formData.get('datiFattura')?.value;
      if (typeof datiFatturaStructure === 'object') {
        // prettier-ignore
        {
          this.formData.setControl('datiFattura', new FormControl(datiFatturaStructure.datiFattura));
          this.formData.setControl('partitaIva', new FormControl(datiFatturaStructure.partitaIva));
          this.formData.setControl('codiceFiscale', new FormControl(datiFatturaStructure.codiceFiscale));
          this.formData.setControl('codiceUnivoco', new FormControl(datiFatturaStructure.codiceUnivoco));
          this.formData.setControl('denominazione', new FormControl(datiFatturaStructure.denominazione));
          this.formData.setControl('indirizzoFatturazione', new FormControl(datiFatturaStructure.indirizzoFatturazione));
          this.formData.setControl('cittaFatturazione', new FormControl(datiFatturaStructure.cittaFatturazione));
          this.formData.setControl('pec', new FormControl(datiFatturaStructure.pec));
        }
        this.checkedFattura = datiFatturaStructure.datiFattura ? true : false;
      } else {
        this.checkedFattura = this.formData.get('datiFattura')?.value;
      }
    } catch {
      this.checkedFattura = false;
      this.formData.setControl('datiFattura', new FormControl(''));
      this.formData.setControl('partitaIva', new FormControl(''));
      this.formData.setControl('codiceFiscale', new FormControl(''));
      this.formData.setControl('codiceUnivoco', new FormControl(''));
      this.formData.setControl('denominazione', new FormControl(''));
      this.formData.setControl('indirizzoFatturazione', new FormControl(''));
      this.formData.setControl('cittaFatturazione', new FormControl(''));
      this.formData.setControl('pec', new FormControl(''));
    }
    this.formData.get('datiFattura')?.valueChanges.subscribe((value) => {
      this.checkedFattura = value;
    });
  }

  get canaleComunicazioniDataSet() {
    return this.userListModalService.getTipoInterventoDataSet();
  }

  /**
   * Metodo lanciato per inizializzare dati del form del modale
   * @returns {any}
   **/
  initForm() {
    this.formData = new FormGroup({
      nome: new FormControl('', Validators.required),
      cognome: new FormControl('', Validators.required),
      numero_telefono: new FormControl(''),
      indirizzo: new FormControl(''),
      citta: new FormControl(''),
      cap: new FormControl('', [
        Validators.minLength(5),
        Validators.maxLength(5),
      ]),
      canale_com: new FormControl('', Validators.required),
      utente_inserimento: new FormControl(''),
      utente_ultima_modifica: new FormControl(''),
      partitaIva: new FormControl(''),
      pec: new FormControl(''),
      codiceUnivoco: new FormControl(''),
      codiceFiscale: new FormControl(''),
      datiFattura: new FormControl(false),
      denominazione: new FormControl(''),
      indirizzoFatturazione: new FormControl(''),
      cittaFatturazione: new FormControl(''),
    });
    this.utenteInserimento = undefined;
    this.utenteUltimaModifica = undefined;
  }

  handleClose() {
    this.showModal = false;
    this.showModalChange.emit(this.showModal);
  }

  /**
   * Metodo per aggiunta di un utente
   * @returns {any}
   **/
  addNewUser() {
    let datiFattura;
    this.checkedFattura
      ? (datiFattura = {
          partitaIva: this.formData.value['partitaIva'],
          pec: this.formData.value['pec'],
          codiceUnivoco: this.formData.value['codiceUnivoco'],
          codiceFiscale: this.formData.value['codiceFiscale'],
          datiFattura: this.formData.value['datiFattura'],
          denominazione: this.formData.value['denominazione'],
          indirizzoFatturazione: this.formData.value['indirizzoFatturazione'],
          cittaFatturazione: this.formData.value['cittaFatturazione'],
        })
      : (datiFattura = {});
    let user = new UserModel({
      ...this.formData.value,
      datiFattura: datiFattura,
    });
    let idReturned = this.userDataService.addUser(user);
    this.showModal = !this.showModal;
    //TODO: VERIFICARE COME AGGIORNARE NUMERO INTERVENTI
    this.router.navigate(['users', idReturned], { state: { newUser: true } });
  }

  /**
   * Modifica i dati base dell'utente
   * @returns {any}
   **/
  editUser() {
    let user = new UserModel({
      ...this.formData.value,
    });
    this.userDataService.editUser(user);
    callModalToast(
      this.messageService,
      'Modificato',
      'Dati utente modificati',
      'warn'
    );
    this.showModal = !this.showModal;
  }

  enterCheck() {
    if (this.mode === 'Edit' && this.formData.valid && this.formData.dirty) {
      this.editUser();
    }
    if (this.mode === 'Add' && this.formData.valid) {
      this.addNewUser();
    }
  }
}
