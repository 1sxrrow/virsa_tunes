import { formatDate } from '@angular/common';
import EscPosEncoder from 'esc-pos-encoder';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { MessageService } from 'primeng/api';
import { Incasso } from '../models/incasso.model';
import { prodottiAggiuntivi } from '../models/prodotti-aggiuntivi.model';
import { SpecificDataModel } from '../models/specific-data.model';
import { UserModel } from '../models/user-data.model';

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

export function calculateIncassoIntervento(
  specificData: SpecificDataModel
): number {
  let incassoValue =
    specificData.costo -
    (specificData.costo_sconto ? Number(specificData.costo_sconto) : 0);

  let incasso: Incasso = {
    incassoTotale: incassoValue,
    mese: specificData.data_intervento.getMonth().toString(),
    spese: 0,
    netto: 0,
  };

  return incassoValue;
}

export function createIncasso(
  incasso: number,
  mese: string,
  spese?: number
): Incasso {
  return { incassoTotale: incasso, mese: mese, spese: 0, netto: 0 };
}

export function createExcel(specificData: SpecificDataModel) {
  const path =
    specificData.tipo_intervento === 'Vendita'
      ? '/assets/template_vendita.xlsx'
      : '/assets/template_riparazione.xlsx';

  this.http.get(path, { responseType: 'blob' }).subscribe((res) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const workbook = new Workbook();
      let y = arrayBufferToBufferCycle(e.target.result);
      // carico buffer excel
      await workbook.xlsx.load(y, {
        ignoreNodes: [
          'dataValidations', // ignores the workbook's Data Validations
          'autoFilter',
          'drawings',
        ],
      });
      var worksheet = workbook.getWorksheet('RICEVUTA');
      let formatDateVar = formatDate(
        specificData.data_intervento,
        'd MMMM yyyy',
        this.locale
      );
      if (specificData.tipo_intervento === 'Vendita') {
        worksheet.getRow(2).height = 66;
        const imageSrc = '/assets/logovirsa.png';
        const img = await fetch(imageSrc);
        const buffer = await img.arrayBuffer();
        const logo = workbook.addImage({
          buffer: buffer,
          extension: 'png',
        });
        worksheet.addImage(logo, {
          tl: { col: 1.15, row: 1.05 },
          ext: { width: 88, height: 100 },
        });
        worksheet.getCell('B19').value = '1'; // quantità
        worksheet.getCell('H5').value = formatDateVar; // data
        worksheet.getCell('D9').value =
          this.userData.nome + ' ' + this.userData.cognome; //nome cognome + gestione celle merged
        worksheet.getCell('D10').value = this.userData.indirizzo; // //indirizzo + gestione celle merged
        worksheet.getCell('D11').value =
          this.userData.citta + ' / ' + this.userData.cap; //citta e cap + gestione celle merged
        worksheet.getCell('D12').value = this.userData.numero_telefono; //telefono + gestione celle merged
        worksheet.getCell('B16').value = specificData.modalita_pagamento; //metodo di pagamento + gestione celle merged
        worksheet.getCell('F16').value = specificData.tipo_prodotto; //condizioni + gestione celle merged
        worksheet.getCell('E16').value = this.userData.canale_com; // social / canale com
        worksheet.getCell('E33').value = specificData.garanzia; //garanzia + gestione celle merged
        worksheet.getCell('D19').value =
          specificData.marca_telefono + ' ' + specificData.modello_telefono; // modello telefono
        worksheet.getCell('E19').value = specificData.imei; // imei
        worksheet.getCell('F19').value = specificData.costo; // costo
        worksheet.getCell('G19').value = specificData.costo_sconto; // sconto
        worksheet.getCell('H30').value = specificData.costo_sconto; // sconto
        let discounted = specificData.costo - Number(specificData.costo_sconto);
        worksheet.getCell('H19').value = discounted; // totale riga
        let costoTotaleProdottiAggiuntivi: number = 0;
        if (
          specificData.checkedProdottiAggiuntivi &&
          Object.keys(specificData.prodottiAggiuntivi).length > 0
        ) {
          Object.values(specificData.prodottiAggiuntivi).forEach((x, i) => {
            if (i === 0) {
              worksheet.getCell('B20').value = x.quantita;
              worksheet.getCell('H20').value = worksheet.getCell('F20').value =
                Number(x.costo);
              worksheet.getCell('D20').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
            if (i === 1) {
              worksheet.getCell('B21').value = x.quantita;
              worksheet.getCell('H21').value = worksheet.getCell('F21').value =
                Number(x.costo);
              worksheet.getCell('D21').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
            if (i === 2) {
              worksheet.getCell('B22').value = x.quantita;
              worksheet.getCell('H22').value = worksheet.getCell('F22').value =
                Number(x.costo);
              worksheet.getCell('D22').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
            if (i === 3) {
              worksheet.getCell('B23').value = x.quantita;
              worksheet.getCell('H23').value = worksheet.getCell('F23').value =
                Number(x.costo);
              worksheet.getCell('D23').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
          });
        }
        worksheet.getCell('H31').value =
          Number(specificData.costo) + Number(costoTotaleProdottiAggiuntivi); // subtotale
        worksheet.getCell('H33').value =
          Number(discounted) + Number(costoTotaleProdottiAggiuntivi); // totale
      } else {
        worksheet.getCell('C24').value = worksheet.getCell('C4').value =
          this.userData.nome + ' ' + this.userData.cognome;
        worksheet.getCell('C25').value = worksheet.getCell('C5').value =
          this.userData.indirizzo;
        worksheet.getCell('C6').value = this.userData.cap;
        worksheet.getCell('C26').value = worksheet.getCell('C7').value =
          this.userData.citta;
        worksheet.getCell('C27').value = worksheet.getCell('C8').value =
          this.userData.numero_telefono;
        worksheet.getCell('D24').value = worksheet.getCell('D8').value =
          specificData.tipo_parte;

        let formatDateVar = specificData.data_consegna_riparazione
          ? formatDate(
              specificData.data_consegna_riparazione,
              'd MMMM yyyy',
              this.locale
            )
          : '';
        worksheet.getCell('C17').value = formatDateVar;
        worksheet.getCell('E11').value = specificData.codice_sblocco
          ? specificData.codice_sblocco
          : '';
        worksheet.getCell('F18').value = worksheet.getCell('F26').value =
          specificData.caparra ? Number(specificData.caparra) : '';
        worksheet.getCell('B11').value = specificData.problema;
        worksheet.getCell('D11').value = specificData.imei;
        let costoTotaleProdottiAggiuntivi: number = 0;
        if (
          specificData.checkedProdottiAggiuntivi &&
          Object.values(specificData.prodottiAggiuntivi).length > 0
        ) {
          Object.values(specificData.prodottiAggiuntivi).forEach((x, i) => {
            if (i === 0) {
              worksheet.getCell('F12').value = Number(x.costo);
              worksheet.getCell('B12').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
            if (i === 1) {
              worksheet.getCell('F13').value = Number(x.costo);
              worksheet.getCell('B13').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
            if (i === 2) {
              worksheet.getCell('F14').value = Number(x.costo);
              worksheet.getCell('B14').value = x.nomeProdotto;
              costoTotaleProdottiAggiuntivi += Number(x.costo);
            }
          });
        }
        worksheet.getCell('F11').value = Number(specificData.costo);
        worksheet.getCell('F27').value = worksheet.getCell('F20').value =
          specificData.caparra
            ? Number(specificData.costo) +
              Number(costoTotaleProdottiAggiuntivi) -
              Number(specificData.caparra)
            : Number(specificData.costo) +
              Number(costoTotaleProdottiAggiuntivi);
        worksheet.getCell('F16').value =
          Number(specificData.costo) + Number(costoTotaleProdottiAggiuntivi);
        worksheet.getCell('F5').value =
          specificData.marca_telefono + ' ' + specificData.modello_telefono;
      }
      // Creazione Excel modificato
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        fs.saveAs(
          blob,
          (specificData.tipo_intervento === 'Vendita'
            ? 'Vendita_'
            : 'Riparazione_') +
            this.userData.nome +
            '_' +
            this.userData.cognome +
            '_' +
            formatDateVar +
            '.xlsx'
        );
      });
    };
    reader.readAsArrayBuffer(res);
  });
}

export function createScontrino(
  specificData: SpecificDataModel,
  userData: UserModel
): EscPosEncoder {
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
        .line('VIA TRENTO 49A')
        .line('25128 BRESCIA')
        .line('P. IVA 04222840987')
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
        .line('VIA TRENTO 49A')
        .line('25128 BRESCIA')
        .line('P. IVA 04222840987')
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
        .line('VIA TRENTO 49A')
        .line('25128 BRESCIA')
        .line('P. IVA 04222840987')
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
      .line('VIA TRENTO 49A')
      .line('25128 BRESCIA')
      .line('P. IVA 04222840987')
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
      .line('VIA TRENTO 49A')
      .line('25128 BRESCIA')
      .line('P. IVA 04222840987')
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
      .line('VIA TRENTO 49A')
      .line('25128 BRESCIA')
      .line('P. IVA 04222840987')
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
      .line('VIA TRENTO 49A')
      .line('25128 BRESCIA')
      .line('P. IVA 04222840987')
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
      .line('P. IVA 04222840987')
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
        totalCost += +prodottoAggiuntivo.costo;
      }
    );
  }
  if (specificData.costo_sconto) {
    totalCost -= +specificData.costo_sconto;
  }
  return totalCost;
}

export function getBreadcrumbHome() {
  return { icon: 'pi pi-home', routerLink: '/' };
}
