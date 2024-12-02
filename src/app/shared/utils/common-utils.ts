import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import EscPosEncoder from 'esc-pos-encoder';
import { MessageService } from 'primeng/api';
import { Incasso, Incassov2 } from '../models/custom-interfaces';
import { InventarioItemModel } from '../models/inventarioItem.model';
import { prodottiAggiuntivi } from '../models/prodotti-aggiuntivi.model';
import { SpecificDataModel } from '../models/specific-data.model';
import { UserModel } from '../models/user-data.model';
import { FirebaseStoreService } from '../services/firebase/firebase-store.service';

export type FileUpload = {
  file: { filename: string; filetype: string; filesize: number; addDate: Date };
  filePath: string;
  uploadURL: string;
};

export type Negozio = {
  negozio: string;
  incasso: number;
  spese: number;
  netto: number;
};
export function getMonthNumber(monthStr: string): number {
  const monthMap: { [key: string]: number } = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12,
  };

  return monthMap[monthStr] || 0; // Returns 0 if the monthStr is not found
}
export interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
export function arrayBufferToBufferCycle(ab): Buffer {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

export function keylistener(mode: boolean) {
  if (mode) {
    document.addEventListener('keydown', keyPressed);
    function keyPressed(e) {
      console.log(e.code);
    }
  }
}

export async function calculateIncassoIntervento(
  specificData: SpecificDataModel,
  firebaseStoreService: FirebaseStoreService
): Promise<Incasso> {
  let incassoInterventoValue: number = 0;
  if (specificData.costo_sconto) {
    incassoInterventoValue = specificData.costo - specificData.costo_sconto;
  } else {
    incassoInterventoValue = specificData.costo;
  }
  let speseValue: number = 0;
  // Verifico presenza dato costoCambio e se presente aggiungo alla spesa
  if (specificData.costoCambio) {
    speseValue += Number(specificData.costoCambio);
  }
  // Se intervento vendita recupero da imei articolo e aggiungo alla spesa
  if (specificData.imei && specificData.tipo_intervento === 'Vendita') {
    let data = await firebaseStoreService.imeiArticolo(specificData.imei);
    if (data) {
      let articolo: InventarioItemModel = Object.values(
        data
      )[0] as InventarioItemModel;
      if (speseValue === 0) {
        speseValue = Number(articolo.prezzo_acquisto);
      } else {
        speseValue += Number(articolo.prezzo_acquisto);
      }
    }
  }
  // Verifica presenza prodotti aggiuntivi
  if (specificData.prodottiAggiuntivi.length > 0) {
    specificData.prodottiAggiuntivi.forEach((x: prodottiAggiuntivi) => {
      incassoInterventoValue += Number(x.quantita) * Number(x.costo);
    });
  }

  let dataInervento = new Date(specificData.data_intervento);
  let incasso: Incasso = {
    incassoTotale: incassoInterventoValue,
    mese: dataInervento.getMonth().toString(),
    speseTotale: speseValue,
    nettoTotale: (incassoInterventoValue - speseValue) as number,
    negozi: [
      {
        negozio: specificData.negozio,
        incasso: incassoInterventoValue,
        spese: speseValue,
        netto: (incassoInterventoValue - speseValue) as number,
      },
    ],
  };
  return incasso;
}

export async function calculateIncassoInterventov2(
  specificData: SpecificDataModel,
  firebaseStoreService: FirebaseStoreService
): Promise<Incassov2> {
  let incassoInterventoValue: number = 0;
  if (specificData.costo_sconto) {
    incassoInterventoValue = specificData.costo - specificData.costo_sconto;
  } else {
    incassoInterventoValue = specificData.costo;
  }
  let speseValue: number = 0;
  // Verifico presenza dato costoCambio e se presente aggiungo alla spesa
  if (specificData.costoCambio) {
    speseValue += Number(specificData.costoCambio);
  }
  // Se intervento vendita recupero da imei articolo e aggiungo alla spesa
  if (specificData.imei && specificData.tipo_intervento === 'Vendita') {
    let data = await firebaseStoreService.imeiArticolo(specificData.imei);
    if (data) {
      let articolo: InventarioItemModel = Object.values(
        data
      )[0] as InventarioItemModel;
      if (speseValue === 0) {
        speseValue = Number(articolo.prezzo_acquisto);
      } else {
        speseValue += Number(articolo.prezzo_acquisto);
      }
    }
  }
  // Verifica presenza prodotti aggiuntivi
  if (specificData.prodottiAggiuntivi.length > 0) {
    specificData.prodottiAggiuntivi.forEach((x: prodottiAggiuntivi) => {
      incassoInterventoValue += Number(x.quantita) * Number(x.costo);
    });
  }
  let incasso: Incassov2 = {
    incasso: incassoInterventoValue,
    mese: calculateMese(new Date(specificData.data_intervento)),
    spese: speseValue,
    netto: (incassoInterventoValue - speseValue) as number,
    negozio: specificData.negozio,
    tipo_intervento: specificData.tipo_intervento,
  };
  return incasso;
}

export function createIncasso(
  incassoTotale: number,
  mese: string,
  spese?: number,
  negozio?: string
) {
  return {
    incassoTotale: incassoTotale,
    mese: mese,
    speseTotale: spese,
    nettoTotale: incassoTotale - spese,
    negozi: [
      {
        negozio: negozio,
        spese: spese,
        incasso: incassoTotale,
        netto: incassoTotale - spese,
      },
    ],
  };
}

export function createScontrino(
  specificData: SpecificDataModel,
  userData: UserModel
): EscPosEncoder {
  debugger
  let encoder: EscPosEncoder = new EscPosEncoder();
  let prodottiAggiuntiviTmp: [string, string, string][] = [];
  let totale: number = +specificData.costo;
  let permuta: [string, string, string][] = [];
  let sconto: [string, string, string][] = [];
  if (specificData.prodottiAggiuntivi != undefined) {
    Object.values(specificData.prodottiAggiuntivi).forEach((x) => {
      totale += +x.costo;
      prodottiAggiuntiviTmp.push([
        x.nomeProdotto,
        '',
        x.costo.toString() + ',00 €',
      ]);
    });
  }

  if (specificData.costo_sconto > 0 && specificData.costo_sconto) {
    totale -= +specificData.costo_sconto;
  }

  if (specificData.checkedPermuta) {
    totale -= +specificData.costoPermuta;
    permuta.push(
      ['Permuta', '', 'Prezzo(€)'],
      ['Si', '', specificData.costoPermuta + ',00 €']
    );
  }

  if (specificData.costo_sconto) {
    sconto.push(['Sconto:', '', specificData.costo_sconto + ',00 €']);
  }
  specificData.caparra ? (totale -= +specificData.caparra) : null;
  let via: string;
  let posto: string;
  let telefono: string;
  if (specificData.negozio === 'Negozio I') {
    via = 'VIA MIROLTE N. 54';
    posto = '25049 ISEO (BS)';
    telefono = 'tel: +39  3313017069';
  } else {
    via = 'VIA TRENTO 49A';
    posto = '25128 BRESCIA';
    telefono = 'tel: +39  3202258681';
  }
  switch (specificData.tipo_intervento) {
    case 'Riparazione':
      return encoder
        .align('center')
        .size('normal')
        .width(2)
        .height(2)
        .line('VIRSA TUNES Srls')
        .align('center')
        .width(1)
        .height(1)
        .line(via)
        .line(posto)
        .line('P. IVA 04548020983')
        .line(telefono)
        .line('')
        .align('center')
        .size('normal')
        .width(1)
        .height(2)
        .line('DOCUMENTO COMMERICALE')
        .line('di vendita o prestazione')
        .line('')
        .align('left')
        .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
        .line('')
        .align('center')
        .width(1)
        .height(1)
        .codepage('auto')
        .table(
          [
            { width: 20, marginRight: 2, align: 'left' },
            { width: 15, marginRight: 2, align: 'left' },
            { width: 9, align: 'right' },
          ],
          [
            ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
            [
              specificData.modello_telefono,
              specificData.imei,
              specificData.costo + ',00 €',
            ],
            ['', '', ''],
            ['Problema', 'Codice Sblocco', 'Tipo Ric.'],
            [
              specificData.problema,
              specificData.codice_sblocco,
              specificData.tipo_parte === 'Compatibile'
                ? 'Compat.'
                : specificData.tipo_parte === 'Originale'
                ? 'Originale'
                : '',
            ],
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
            ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
            [
              'Totale',
              '',
              (encoder) =>
                encoder
                  .bold()
                  .text(totale + ',00 €')
                  .bold(),
            ],
          ]
        )
        .newline()
        .codepage('auto')
        .line(
          specificData.caparra ? 'Caparra : ' + specificData.caparra : ',00 €'
        )
        .line(DateTimeNow())
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .cut('partial')
        .align('center')
        .size('normal')
        .width(2)
        .height(2)
        .line('VIRSA TUNES Srls')
        .align('center')
        .width(1)
        .height(1)
        .line(via)
        .line(posto)
        .line('P. IVA 04548020983')
        .line(telefono)
        .line('')
        .align('center')
        .size('normal')
        .width(1)
        .height(2)
        .line('DOCUMENTO COMMERICALE')
        .line('di vendita o prestazione')
        .line('')
        .align('left')
        .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
        .line('')
        .width(1)
        .height(1)
        .codepage('auto')
        .table(
          [
            { width: 20, marginRight: 2, align: 'left' },
            { width: 15, marginRight: 2, align: 'left' },
            { width: 9, align: 'right' },
          ],
          [
            ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
            [
              specificData.modello_telefono,
              specificData.imei,
              specificData.costo + ',00 €',
            ],
            ...prodottiAggiuntiviTmp,
            ['', '', ''],
            ['Problema', 'Codice Sblocco', 'Tipo Ric.'],
            [
              specificData.problema,
              specificData.codice_sblocco,
              specificData.tipo_parte === 'Compatibile'
                ? 'Compat.'
                : specificData.tipo_parte === 'Originale'
                ? 'Originale'
                : '',
            ],
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
            ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
            [
              'Totale',
              '',
              (encoder) =>
                encoder
                  .bold()
                  .text(totale + ',00 €')
                  .bold(),
            ],
          ]
        )
        .newline()
        .codepage('auto')
        .line(
          specificData.caparra ? 'Caparra : ' + specificData.caparra : ',00 €'
        )
        .line(DateTimeNow())
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .cut('partial')
        .align('left')
        .size('small')
        .line(
          "Il centro di assistenza non e' responsabile per eventuali accessori lasciati con i dispositivi o non necessari e non espressamente dichiarati al momento dell'accettazione -Il cliente e' tenuto a realizzare copie di sicurezza dei dati presenti nelle memorie dei dispositivi lasciati in riparazione, prima che gli stessi vengano consegnati al centro di assistenza. Resta tuttavia inteso che le Case Madri e il centro di assistenza autorizzato non sono responsabili, in alcun modo ed in alcun caso, per qualsivoglia danno derivante dalla perdita, danneggiamento, o deterioramento dei dati presenti nelle memorie dei dispositivi durante la riparazione degli stessi.-Nel caso di spedizioni varranno le limitazioni di risarcimento danni previste dalle disposizioni di legge in vigore.      -I preventivi di riparazione non impegnano in forma definitiva il centro di assistenza , potendosi verificare durante la lavorazione del prodotto imprevisti che ne variano in piu' o meno l'entità e la fattibilità. In considerazione di ciò il cliente da' la propria autorizzazione ad eseguire tutte le riparazioni che dovessero risultare necessarie. Le spese di preventivo, se la lavorazione non va' a buon fine, non vengono addebitate.-Sono consapevole che,se per qualsiasi motivo il mio terminale non potrà essere riparato, non potrò imputare nessuna responsabilità al nostro centro di assistenza.-nel caso di un lavoro specifico per ES. Sostituzione di un chip e/o un componente il centro di assistenza non fa ulteriori diagnosi o le verifiche di funzionamento del dispositivo.-I tempi di lavorazione sono Puramente indicativi e possono subire variazioni in base alla richiesta, l'intensità del lavoro, attesa del ordine e arrivo dei componenti e/o imprevisti.-Una volta accettato la Proposta del Preventivo i ricambi verranno ordinati immediatamente e in caso di restituzione il costo dei ricambi sara addebitato al cliente, i tali ovviamente verranno Resi e/o spediti assieme al dispositivo o se i ricambi non sono stati ricevuti dalla nostra sede, verranno spediti o consegnati separatamente.-I ricambi utilizzati per gli interventi in garanzia sono di proprieta' delle case costruttrici per verifiche o statistiche; per gli interventi fuori garanzia, se non espressamente richiesto.-Consenso alle riprese video: Acconsento il centro di riparazione a eseguire delle riprese video delle riparazioni che effettua, quindi lo autorizzo preventivamente ad effettuare tali le riprese video sulle riparazioni e a pubblicarle sul canale Virsa Tunes sulla piattaforma YouTube.-I dispositivi vengono smaltiti negli appositi contenitori per la raccolta differenziata in quanto facenti parte dei rifiuti tossici nocivi.-Giacenza dispositvi: i dispositvi , riparati o non riparati, resteranno in giacenza gratuita per un periodo di 5 (cinque) giorni dalla data di fine lavoro (DT_Fine); oltre tale termine il prodotto verra' messo in magazzino per la giacenza a pagamento a carico del cliente proprietario, la giacenza avra' una durata di 15 giorni con un costo giornaliero di 1,00€ trascorso questo termine il cliente, con l'accettazione della presente, autorizza il centro di assistenza all'alienazione del prodotto per far fronte al recupero dei costi o allo smaltimento a norma delle Leggi in vigore oltre il termine sopra indicato. (art 2756 e 2797 c.c. )-Autorizzo il trattamento dei dati personali contenuti nel modulo in base art. 13 del D. Lgs. 196/2003.-Una volta spedito il dispositivo non saremo responsabili della spedizione, (che si tratti di una spedizone assicurata o non assicurata) ma la compagnia che gestisce le spedizioni (es : corriere Sda o Dhl o poste italiane ecc..) la nostra responsabilità termina nel momento in cui consegnamo il pacco(contenente il dispositivo) al corriere/portalettere/postino-Il pagamento DEVE essere effettuato Entro e non oltre i 5 Giorni dal momento della conferma di riparazione.-Si accetta di proseguire con un preventivo pari o minore di 150Euro.-la Garanzia sulle riparazioni Hardwere è di 30 (trenta) Giorni Lavorativi dal mumento della consegna del prodotto(Nel caso delle spedizioni la garanzia sarà valida dal momento della consegna del corriere) "
        )
        .align('right')
        .size('small')
        .line('Firma : ___________________________')
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .cut('partial')
        .encode();
    case 'Vendita':
      return encoder
        .align('center')
        .size('normal')
        .width(2)
        .height(2)
        .line('VIRSA TUNES Srls')
        .align('center')
        .width(1)
        .height(1)
        .line(via)
        .line(posto)
        .line('P. IVA 04548020983')
        .line(telefono)
        .line('')
        .align('center')
        .size('normal')
        .width(1)
        .height(2)
        .line('DOCUMENTO COMMERICALE')
        .line('di vendita o prestazione')
        .line('')
        .align('left')
        .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
        .line('')
        .width(1)
        .height(1)
        .codepage('auto')
        .table(
          [
            { width: 20, marginRight: 2, align: 'left' },
            { width: 15, marginRight: 2, align: 'left' },
            { width: 9, align: 'right' },
          ],
          [
            ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
            [
              specificData.modello_telefono,
              specificData.imei,
              specificData.costo + ',00 €',
            ],
            ...prodottiAggiuntiviTmp,
            ['', '', ''],
            ['Tipo Prodotto', 'Garanzia', ''],
            [specificData.tipo_prodotto, specificData.garanzia, ''],
            ['', '', ''],
            ...permuta,
            ['', '', ''],
            ['', '', ''],
            ['', '', ''],
            ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
            ...sconto,
            [
              'Totale:',
              '',
              (encoder) =>
                encoder
                  .bold()
                  .text(totale + ',00 €')
                  .bold(),
            ],
          ]
        )
        .newline()
        .line(
          specificData.modalita_pagamento
            ? 'Modalità pagamento: ' + specificData.modalita_pagamento
            : ''
        )
        .line('Importo pagato: ' + totale + ',00 €')
        .line(DateTimeNow())
        .newline()
        .newline()
        .newline()
        .align('left')
        .size('small')
        .line(
          "- Operazione effettuata da soggetto appartenente a regime fiscale di vantaggio ai sensi dell'art.1, commi da 54 a 89, L. n. 190/2014. - Dopo l'acquisto non è possibile avere il rimborso in denaro, ma solo sostituzione dell'articolo. - La Garanzia sulla Batteria dura 7Giorni, passati 7 giorni bisogna pagare le spese per la sostituzione della batteria a partire da 20€ - I telefoni spediti hanno il diritto di 7 giorni per la sostituzione del dispositivo, se il grado del telefono non piace al cliente. - Le spese di spedizione della restituzione saranno a carico dell' acquirente"
        )
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .newline()
        .cut('partial')
        .encode();
    default:
      console.log(
        'tipo intervento non riconosciuto ',
        specificData.tipo_intervento,
        '. Impossibile procedere con creazione scontrino'
      );
      break;
  }
}

export function createMultiScontrino(
  allItems: SpecificDataModel[],
  userData: UserModel
): EscPosEncoder {
  console.log(allItems);
  let totale: number = 0;
  let encoder: EscPosEncoder = new EscPosEncoder();
  let prodottiAggiuntiviTmp: [string, string, string][] = [];
  let isRiparazione = false;
  let isVendita = false;
  let interventi: [string, string, string][] = [];
  let garanzia: [string, string, string][] = [];
  let problema: [string, string, string][] = [];
  let permuta: [string, string, string][] = [];
  let sconto: [string, string, string][] = [];
  let modalita_pagamento = '';
  let counter = 0;
  let caparra = 0;
  let scontoValue = 0;
  let via: string;
  let posto: string;
  let telefono: string;
  allItems.forEach((specificData) => {
    // Recupero dati intervento da mostrare nella tabella scontrino
    interventi.push([
      specificData.modello_telefono,
      specificData.imei,
      specificData.costo + ',00 €',
    ]);
    // Recupero totale di tutti gli interventi
    totale += +specificData.costo;

    // Se presente sconto lo tolgo dal totale
    if (specificData.costo_sconto > 0 && specificData.costo_sconto) {
      scontoValue += +specificData.costo_sconto;
      totale -= +specificData.costo_sconto;
    }

    if (specificData.caparra) {
      caparra += +specificData.caparra;
    }

    specificData.tipo_intervento === 'Vendita'
      ? (isVendita = true)
      : specificData.tipo_intervento === 'Riparazione'
      ? (isRiparazione = true)
      : null;

    // Se presente caparra la tolgo dal totale
    if (
      specificData.tipo_intervento === 'Riparazione' &&
      specificData.caparra
    ) {
      totale -= +specificData.caparra;
    }

    if (specificData.prodottiAggiuntivi != undefined) {
      Object.values(specificData.prodottiAggiuntivi).forEach((x) => {
        totale += +x.costo;
        prodottiAggiuntiviTmp.push([
          x.nomeProdotto,
          '',
          x.costo.toString() + ',00 €',
        ]);
      });
    }
    modalita_pagamento = specificData.modalita_pagamento;

    // Recupero tipo prodotto e garanzia dei prodotti
    counter++;
    garanzia.push(
      ['Prodotto ' + counter, '', ''],
      [specificData.tipo_prodotto, specificData.garanzia, '']
    );

    if (specificData.tipo_intervento === 'Riparazione') {
      problema.push(
        ['Prodotto ' + counter, '', ''],
        ['Problema', 'Codice Sblocco', 'Tipo Ric.'],
        [
          specificData.problema,
          specificData.codice_sblocco,
          specificData.tipo_parte === 'Compatibile'
            ? 'Compat.'
            : specificData.tipo_parte === 'Originale'
            ? 'Originale'
            : '',
        ]
      );
    }

    if (
      specificData.tipo_intervento === 'Vendita' &&
      specificData.checkedPermuta
    ) {
      totale -= +specificData.costoPermuta;
      permuta.push(
        ['Permuta', '', 'Prezzo (€)'],
        ['Si', '', specificData.costoPermuta + ',00 €']
      );
    }

    if (specificData.negozio === 'Negozio I') {
      via = 'VIA MIROLTE N. 54';
      posto = '25049 ISEO (BS)';
      telefono = 'tel: +39  3313017069';
    } else {
      via = 'VIA TRENTO 49A';
      posto = '25128 BRESCIA';
      telefono = 'tel: +39  3202258681';
    }
  });

  if (scontoValue > 0) {
    sconto.push(['Sconto:', '', scontoValue + ',00 €']);
  }

  // Creazione scontrino se solo vendita
  if (isVendita && !isRiparazione) {
    return encoder
      .align('center')
      .size('normal')
      .width(2)
      .height(2)
      .line('VIRSA TUNES')
      .align('center')
      .width(1)
      .height(1)
      .line('DI SHARIF FAHID')
      .line(via)
      .line(posto)
      .line('P. IVA 04548020983')
      .line(telefono)
      .line('')
      .align('center')
      .size('normal')
      .width(1)
      .height(2)
      .line('DOCUMENTO COMMERICALE')
      .line('di vendita o prestazione')
      .line('')
      .align('left')
      .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
      .line('')
      .width(1)
      .height(1)
      .codepage('auto')
      .table(
        [
          { width: 20, marginRight: 2, align: 'left' },
          { width: 15, marginRight: 2, align: 'left' },
          { width: 9, align: 'right' },
        ],
        [
          ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
          ...interventi,
          ...prodottiAggiuntiviTmp,
          ['', '', ''],
          ['Tipo Prodotto', 'Garanzia', ''],
          ...garanzia,
          ['', '', ''],
          ...permuta,
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
          ...sconto,
          [
            'Totale:',
            '',
            (encoder) =>
              encoder
                .bold()
                .text(totale + ',00 €')
                .bold(),
          ],
        ]
      )
      .newline()
      .line(
        modalita_pagamento !== ''
          ? 'Modalità pagamento: ' + modalita_pagamento
          : ''
      )
      .line('Importo pagato: ' + totale + ',00 €')
      .line(DateTimeNow())
      .newline()
      .newline()
      .newline()
      .align('left')
      .size('small')
      .line(
        "- Operazione effettuata da soggetto appartenente a regime fiscale di vantaggio ai sensi dell'art.1, commi da 54 a 89, L. n. 190/2014. - Dopo l'acquisto non è possibile avere il rimborso in denaro, ma solo sostituzione dell'articolo. - La Garanzia sulla Batteria dura 7Giorni, passati 7 giorni bisogna pagare le spese per la sostituzione della batteria a partire da 20€ - I telefoni spediti hanno il diritto di 7 giorni per la sostituzione del dispositivo, se il grado del telefono non piace al cliente. - Le spese di spedizione della restituzione saranno a carico dell' acquirente"
      )
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .encode();
  }
  // Creazione scontrino se solo riparazione
  else if (isRiparazione && !isVendita) {
    return encoder
      .align('center')
      .size('normal')
      .width(2)
      .height(2)
      .line('VIRSA TUNES')
      .align('center')
      .width(1)
      .height(1)
      .line('DI SHARIF FAHID')
      .line(via)
      .line(posto)
      .line('P. IVA 04548020983')
      .line(telefono)
      .line('')
      .align('center')
      .size('normal')
      .width(1)
      .height(2)
      .line('DOCUMENTO COMMERICALE')
      .line('di vendita o prestazione')
      .line('')
      .align('left')
      .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
      .line('')
      .align('center')
      .width(1)
      .height(1)
      .codepage('auto')
      .table(
        [
          { width: 20, marginRight: 2, align: 'left' },
          { width: 15, marginRight: 2, align: 'left' },
          { width: 9, align: 'right' },
        ],
        [
          ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
          ...interventi,
          ['', '', ''],
          ...problema,
          ['', '', ''],
          ...permuta,
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
          [
            'Totale',
            '',
            (encoder) =>
              encoder
                .bold()
                .text(totale + ',00 €')
                .bold(),
          ],
        ]
      )
      .newline()
      .codepage('auto')
      .line(caparra ? 'Caparra : ' + caparra : ',00 €')
      .line(DateTimeNow())
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .align('center')
      .size('normal')
      .width(2)
      .height(2)
      .line('VIRSA TUNES')
      .align('center')
      .width(1)
      .height(1)
      .line('DI SHARIF FAHID')
      .line(via)
      .line(posto)
      .line('P. IVA 04548020983')
      .line(telefono)
      .line('')
      .align('center')
      .size('normal')
      .width(1)
      .height(2)
      .line('DOCUMENTO COMMERICALE')
      .line('di vendita o prestazione')
      .line('')
      .align('left')
      .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
      .line('')
      .width(1)
      .height(1)
      .codepage('auto')
      .table(
        [
          { width: 20, marginRight: 2, align: 'left' },
          { width: 15, marginRight: 2, align: 'left' },
          { width: 9, align: 'right' },
        ],
        [
          ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
          ...interventi,
          ['', '', ''],
          ...problema,
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
          [
            'Totale',
            '',
            (encoder) =>
              encoder
                .bold()
                .text(totale + ',00 €')
                .bold(),
          ],
        ]
      )
      .newline()
      .codepage('auto')
      .line(caparra ? 'Caparra : ' + caparra : ',00 €')
      .line(DateTimeNow())
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .align('left')
      .size('small')
      .line(
        "Il centro di assistenza non e' responsabile per eventuali accessori lasciati con i dispositivi o non necessari e non espressamente dichiarati al momento dell'accettazione -Il cliente e' tenuto a realizzare copie di sicurezza dei dati presenti nelle memorie dei dispositivi lasciati in riparazione, prima che gli stessi vengano consegnati al centro di assistenza. Resta tuttavia inteso che le Case Madri e il centro di assistenza autorizzato non sono responsabili, in alcun modo ed in alcun caso, per qualsivoglia danno derivante dalla perdita, danneggiamento, o deterioramento dei dati presenti nelle memorie dei dispositivi durante la riparazione degli stessi.-Nel caso di spedizioni varranno le limitazioni di risarcimento danni previste dalle disposizioni di legge in vigore.      -I preventivi di riparazione non impegnano in forma definitiva il centro di assistenza , potendosi verificare durante la lavorazione del prodotto imprevisti che ne variano in piu' o meno l'entità e la fattibilità. In considerazione di ciò il cliente da' la propria autorizzazione ad eseguire tutte le riparazioni che dovessero risultare necessarie. Le spese di preventivo, se la lavorazione non va' a buon fine, non vengono addebitate.-Sono consapevole che,se per qualsiasi motivo il mio terminale non potrà essere riparato, non potrò imputare nessuna responsabilità al nostro centro di assistenza.-nel caso di un lavoro specifico per ES. Sostituzione di un chip e/o un componente il centro di assistenza non fa ulteriori diagnosi o le verifiche di funzionamento del dispositivo.-I tempi di lavorazione sono Puramente indicativi e possono subire variazioni in base alla richiesta, l'intensità del lavoro, attesa del ordine e arrivo dei componenti e/o imprevisti.-Una volta accettato la Proposta del Preventivo i ricambi verranno ordinati immediatamente e in caso di restituzione il costo dei ricambi sara addebitato al cliente, i tali ovviamente verranno Resi e/o spediti assieme al dispositivo o se i ricambi non sono stati ricevuti dalla nostra sede, verranno spediti o consegnati separatamente.-I ricambi utilizzati per gli interventi in garanzia sono di proprieta' delle case costruttrici per verifiche o statistiche; per gli interventi fuori garanzia, se non espressamente richiesto.-Consenso alle riprese video: Acconsento il centro di riparazione a eseguire delle riprese video delle riparazioni che effettua, quindi lo autorizzo preventivamente ad effettuare tali le riprese video sulle riparazioni e a pubblicarle sul canale Virsa Tunes sulla piattaforma YouTube.-I dispositivi vengono smaltiti negli appositi contenitori per la raccolta differenziata in quanto facenti parte dei rifiuti tossici nocivi.-Giacenza dispositvi: i dispositvi , riparati o non riparati, resteranno in giacenza gratuita per un periodo di 5 (cinque) giorni dalla data di fine lavoro (DT_Fine); oltre tale termine il prodotto verra' messo in magazzino per la giacenza a pagamento a carico del cliente proprietario, la giacenza avra' una durata di 15 giorni con un costo giornaliero di 1,00€ trascorso questo termine il cliente, con l'accettazione della presente, autorizza il centro di assistenza all'alienazione del prodotto per far fronte al recupero dei costi o allo smaltimento a norma delle Leggi in vigore oltre il termine sopra indicato. (art 2756 e 2797 c.c. )-Autorizzo il trattamento dei dati personali contenuti nel modulo in base art. 13 del D. Lgs. 196/2003.-Una volta spedito il dispositivo non saremo responsabili della spedizione, (che si tratti di una spedizone assicurata o non assicurata) ma la compagnia che gestisce le spedizioni (es : corriere Sda o Dhl o poste italiane ecc..) la nostra responsabilità termina nel momento in cui consegnamo il pacco(contenente il dispositivo) al corriere/portalettere/postino-Il pagamento DEVE essere effettuato Entro e non oltre i 5 Giorni dal momento della conferma di riparazione.-Si accetta di proseguire con un preventivo pari o minore di 150Euro.-la Garanzia sulle riparazioni Hardwere è di 30 (trenta) Giorni Lavorativi dal mumento della consegna del prodotto(Nel caso delle spedizioni la garanzia sarà valida dal momento della consegna del corriere) "
      )
      .align('right')
      .size('small')
      .line('Firma : ___________________________')
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .encode();
  } else if (isRiparazione && isVendita) {
    return encoder
      .align('center')
      .size('normal')
      .width(2)
      .height(2)
      .line('VIRSA TUNES')
      .align('center')
      .width(1)
      .height(1)
      .line('DI SHARIF FAHID')
      .line(via)
      .line(posto)
      .line('P. IVA 04548020983')
      .line(telefono)
      .line('')
      .align('center')
      .size('normal')
      .width(1)
      .height(2)
      .line('DOCUMENTO COMMERICALE')
      .line('di vendita o prestazione')
      .line('')
      .align('left')
      .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
      .line('')
      .width(1)
      .height(1)
      .codepage('auto')
      .table(
        [
          { width: 20, marginRight: 2, align: 'left' },
          { width: 15, marginRight: 2, align: 'left' },
          { width: 9, align: 'right' },
        ],
        [
          ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
          ...interventi,
          ...prodottiAggiuntiviTmp,
          ['', '', ''],
          ['Tipo Prodotto', 'Garanzia', ''],
          ...garanzia,
          ['', '', ''],
          ...problema,
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
          [
            'Totale',
            '',
            (encoder) =>
              encoder
                .bold()
                .text(totale + ',00 €')
                .bold(),
          ],
        ]
      )
      .newline()
      .codepage('auto')
      .line(caparra ? 'Caparra : ' + caparra : ',00 €')
      .line(
        modalita_pagamento !== ''
          ? 'Modalità pagamento: ' + modalita_pagamento
          : ''
      )
      .line('Importo pagato: ' + totale + ',00 €')
      .line(DateTimeNow())
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .align('center')
      .size('normal')
      .width(2)
      .height(2)
      .line('VIRSA TUNES')
      .align('center')
      .width(1)
      .height(1)
      .line('DI SHARIF FAHID')
      .line('VIA TRENTO 49A')
      .line('25128 BRESCIA')
      .line('P. IVA 04548020983')
      .line('tel: +39  3313017069')
      .line('')
      .align('center')
      .size('normal')
      .width(1)
      .height(2)
      .line('DOCUMENTO COMMERICALE')
      .line('di vendita o prestazione')
      .line('')
      .align('left')
      .line('Cliente: ' + userData.nome + ' ' + userData.cognome)
      .line('')
      .width(1)
      .height(1)
      .codepage('auto')
      .table(
        [
          { width: 20, marginRight: 2, align: 'left' },
          { width: 15, marginRight: 2, align: 'left' },
          { width: 9, align: 'right' },
        ],
        [
          ['DESCRIZIONE', 'IMEI', 'Prezzo(€)'],
          ...interventi,
          ...prodottiAggiuntiviTmp,
          ['', '', ''],
          ['Tipo Prodotto', 'Garanzia', ''],
          ...garanzia,
          ['', '', ''],
          ...problema,
          ['', '', ''],
          ['', '', ''],
          ['', '', ''],
          ['='.repeat(20), '='.repeat(15), '='.repeat(9)],
          [
            'Totale',
            '',
            (encoder) =>
              encoder
                .bold()
                .text(totale + ',00 €')
                .bold(),
          ],
        ]
      )
      .newline()
      .codepage('auto')
      .line(caparra ? 'Caparra : ' + caparra : ',00 €')
      .line(
        modalita_pagamento !== ''
          ? 'Modalità pagamento: ' + modalita_pagamento
          : ''
      )
      .line('Importo pagato: ' + totale + ',00 €')
      .line(DateTimeNow())
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .align('left')
      .size('small')
      .line(
        "Il centro di assistenza non e' responsabile per eventuali accessori lasciati con i dispositivi o non necessari e non espressamente dichiarati al momento dell'accettazione -Il cliente e' tenuto a realizzare copie di sicurezza dei dati presenti nelle memorie dei dispositivi lasciati in riparazione, prima che gli stessi vengano consegnati al centro di assistenza. Resta tuttavia inteso che le Case Madri e il centro di assistenza autorizzato non sono responsabili, in alcun modo ed in alcun caso, per qualsivoglia danno derivante dalla perdita, danneggiamento, o deterioramento dei dati presenti nelle memorie dei dispositivi durante la riparazione degli stessi.-Nel caso di spedizioni varranno le limitazioni di risarcimento danni previste dalle disposizioni di legge in vigore.      -I preventivi di riparazione non impegnano in forma definitiva il centro di assistenza , potendosi verificare durante la lavorazione del prodotto imprevisti che ne variano in piu' o meno l'entità e la fattibilità. In considerazione di ciò il cliente da' la propria autorizzazione ad eseguire tutte le riparazioni che dovessero risultare necessarie. Le spese di preventivo, se la lavorazione non va' a buon fine, non vengono addebitate.-Sono consapevole che,se per qualsiasi motivo il mio terminale non potrà essere riparato, non potrò imputare nessuna responsabilità al nostro centro di assistenza.-nel caso di un lavoro specifico per ES. Sostituzione di un chip e/o un componente il centro di assistenza non fa ulteriori diagnosi o le verifiche di funzionamento del dispositivo.-I tempi di lavorazione sono Puramente indicativi e possono subire variazioni in base alla richiesta, l'intensità del lavoro, attesa del ordine e arrivo dei componenti e/o imprevisti.-Una volta accettato la Proposta del Preventivo i ricambi verranno ordinati immediatamente e in caso di restituzione il costo dei ricambi sara addebitato al cliente, i tali ovviamente verranno Resi e/o spediti assieme al dispositivo o se i ricambi non sono stati ricevuti dalla nostra sede, verranno spediti o consegnati separatamente.-I ricambi utilizzati per gli interventi in garanzia sono di proprieta' delle case costruttrici per verifiche o statistiche; per gli interventi fuori garanzia, se non espressamente richiesto.-Consenso alle riprese video: Acconsento il centro di riparazione a eseguire delle riprese video delle riparazioni che effettua, quindi lo autorizzo preventivamente ad effettuare tali le riprese video sulle riparazioni e a pubblicarle sul canale Virsa Tunes sulla piattaforma YouTube.-I dispositivi vengono smaltiti negli appositi contenitori per la raccolta differenziata in quanto facenti parte dei rifiuti tossici nocivi.-Giacenza dispositvi: i dispositvi , riparati o non riparati, resteranno in giacenza gratuita per un periodo di 5 (cinque) giorni dalla data di fine lavoro (DT_Fine); oltre tale termine il prodotto verra' messo in magazzino per la giacenza a pagamento a carico del cliente proprietario, la giacenza avra' una durata di 15 giorni con un costo giornaliero di 1,00€ trascorso questo termine il cliente, con l'accettazione della presente, autorizza il centro di assistenza all'alienazione del prodotto per far fronte al recupero dei costi o allo smaltimento a norma delle Leggi in vigore oltre il termine sopra indicato. (art 2756 e 2797 c.c. )-Autorizzo il trattamento dei dati personali contenuti nel modulo in base art. 13 del D. Lgs. 196/2003.-Una volta spedito il dispositivo non saremo responsabili della spedizione, (che si tratti di una spedizone assicurata o non assicurata) ma la compagnia che gestisce le spedizioni (es : corriere Sda o Dhl o poste italiane ecc..) la nostra responsabilità termina nel momento in cui consegnamo il pacco(contenente il dispositivo) al corriere/portalettere/postino-Il pagamento DEVE essere effettuato Entro e non oltre i 5 Giorni dal momento della conferma di riparazione.-Si accetta di proseguire con un preventivo pari o minore di 150Euro.-la Garanzia sulle riparazioni Hardwere è di 30 (trenta) Giorni Lavorativi dal mumento della consegna del prodotto(Nel caso delle spedizioni la garanzia sarà valida dal momento della consegna del corriere) "
      )
      .align('right')
      .size('small')
      .line('Firma : ___________________________')
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .newline()
      .cut('partial')
      .encode();
  }
}

export function DateTimeNow(onlyDate?: boolean): string {
  let now = new Date();
  let date = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
  let time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }); // hh:mm

  return onlyDate ? `${date}` : `${date} ${time}`;
}

export function calculateMese(date: Date): string {
  return `${date.toLocaleString('it-IT', {
    month: 'long',
  })}-${date.getFullYear()}`;
}

/**
 * Mostra toast dialog a destra
 * @param {string} summary -> titolo
 * @param {string} detail -> descrizion
 * @param {string} serverity? -> success , info , warn , error
 * @returns {any}
 **/
export function callModalToast(
  messageService: MessageService,
  summary: string,
  detail: string,
  severity?: string
) {
  messageService.add({
    severity: severity === undefined ? 'success' : severity,
    summary: summary,
    detail: detail,
  });
}

export function getTotalOfProduct(specificData: SpecificDataModel) {
  let totalCost: number = specificData.costo || 0;
  if (specificData.prodottiAggiuntivi) {
    Object.values(specificData.prodottiAggiuntivi).forEach(
      (prodottoAggiuntivo: prodottiAggiuntivi) => {
        totalCost += prodottoAggiuntivo.quantita * +prodottoAggiuntivo.costo;
      }
    );
  }
  if (specificData.costo_sconto) {
    totalCost -= +specificData.costo_sconto;
  }
  // if (specificData.costoPermuta) {
  //   totalCost -= +specificData.costoPermuta;
  // }
  return totalCost;
}

export function getBreadcrumbHome() {
  return { icon: 'pi pi-home', routerLink: '/' };
}

/**
 * Metodo per creare il form dinamicamente
 **/
export function createForm(
  fb: FormBuilder,
  item: any,
  tipo_intervento?: string
) {
  let baseFormStructure: { [key: string]: FormControl } = {};
  if (tipo_intervento === 'Vendita') {
    if (!item.hasOwnProperty('negozio')) {
      baseFormStructure.negozio = new FormControl('');
    }
    if (!item.hasOwnProperty('costoPermuta')) {
      baseFormStructure.costoPermuta = new FormControl('');
    }
  } else if (tipo_intervento === 'Riparazione') {
    if (!item.hasOwnProperty('negozio')) {
      baseFormStructure.negozio = new FormControl('');
    }
    if (!item.hasOwnProperty('note')) {
      baseFormStructure.note = new FormControl('');
    }
    if (!item.hasOwnProperty('costoCambio')) {
      baseFormStructure.costoCambio = new FormControl('');
    }
  }
  for (const key in item) {
    if (item.hasOwnProperty(key)) {
      baseFormStructure[key] = new FormControl(item[key], Validators.required);
    }
  }
  return fb.group(baseFormStructure);
}
// metodo per verificare quale dato nel form non funzione
export function findInvalidControls(form: FormGroup) {
  const invalid = [];
  const controls = form.controls;
  for (const name in controls) {
    if (controls[name].invalid) {
      invalid.push(name);
    }
  }
  console.log(invalid);
}
