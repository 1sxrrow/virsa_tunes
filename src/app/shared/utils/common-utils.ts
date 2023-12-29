import { formatDate } from '@angular/common';
import EscPosEncoder from 'esc-pos-encoder';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { Incasso } from '../models/incasso.model';
import { SpecificDataModel } from '../models/specific-data.model';

export function arrayBufferToBufferCycle(ab): Buffer {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

export function keylistener(mode: boolean) {
  console.log(mode);
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
  specificData: SpecificDataModel
): EscPosEncoder {
  let encoder: EscPosEncoder = new EscPosEncoder();
  let prodottiAggiuntiviTmp: [string, string, string][] = [];
  let totale: number = +specificData.costo;
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
    .line(
      specificData.modalita_pagamento
        ? 'Modalità pagamento: ' + specificData.modalita_pagamento
        : ''
    )
    .line(
      specificData.tipo_intervento === 'Vendita'
        ? 'Importo pagato: ' + totale + ',00 €'
        : ''
    )
    .line(DateTimeNow())
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

export function DateTimeNow(onlyDate?: boolean): string {
  let now = new Date();
  let date = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
  let time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }); // hh:mm

  return onlyDate ? `${date}` : `${date} ${time}`;
}
