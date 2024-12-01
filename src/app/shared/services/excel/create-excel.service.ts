import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { SpecificDataModel } from '../../models/specific-data.model';
import { UserModel } from '../../models/user-data.model';
import { arrayBufferToBufferCycle } from '../../utils/common-utils';

@Injectable({ providedIn: 'root' })
export class CreateExcelService {
  constructor(
    private http: HttpClient,
    @Inject(LOCALE_ID) public locale: string
  ) {}
  createExcel(specificData: SpecificDataModel, userData: UserModel) {
    debugger;
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
            userData.nome + ' ' + userData.cognome; //nome cognome + gestione celle merged
          worksheet.getCell('D10').value = userData.indirizzo; // //indirizzo + gestione celle merged
          worksheet.getCell('D11').value =
            userData.citta + ' / ' + userData.cap; //citta e cap + gestione celle merged
          worksheet.getCell('D12').value = userData.numero_telefono; //telefono + gestione celle merged
          worksheet.getCell('B16').value = specificData.modalita_pagamento; //metodo di pagamento + gestione celle merged
          worksheet.getCell('F16').value = specificData.tipo_prodotto; //condizioni + gestione celle merged
          worksheet.getCell('E16').value = userData.canale_com; // social / canale com
          worksheet.getCell('E33').value = specificData.garanzia; //garanzia + gestione celle merged
          worksheet.getCell('D19').value =
            specificData.marca_telefono + ' ' + specificData.modello_telefono; // modello telefono
          worksheet.getCell('E19').value = specificData.imei; // imei
          worksheet.getCell('F19').value = specificData.costo; // costo
          worksheet.getCell('G19').value = specificData.costo_sconto; // sconto
          worksheet.getCell('H30').value = specificData.costo_sconto; // sconto
          let discounted =
            specificData.costo - Number(specificData.costo_sconto);
          worksheet.getCell('H19').value = discounted; // totale riga
          let costoTotaleProdottiAggiuntivi: number = 0;
          if (
            specificData.checkedProdottiAggiuntivi &&
            Object.keys(specificData.prodottiAggiuntivi).length > 0
          ) {
            Object.values(specificData.prodottiAggiuntivi).forEach((x, i) => {
              if (i === 0) {
                worksheet.getCell('B20').value = x.quantita;
                worksheet.getCell('H20').value = worksheet.getCell(
                  'F20'
                ).value = Number(x.costo);
                worksheet.getCell('D20').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
              if (i === 1) {
                worksheet.getCell('B21').value = x.quantita;
                worksheet.getCell('H21').value = worksheet.getCell(
                  'F21'
                ).value = Number(x.costo);
                worksheet.getCell('D21').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
              if (i === 2) {
                worksheet.getCell('B22').value = x.quantita;
                worksheet.getCell('H22').value = worksheet.getCell(
                  'F22'
                ).value = Number(x.costo);
                worksheet.getCell('D22').value = x.nomeProdotto;
                costoTotaleProdottiAggiuntivi += Number(x.costo);
              }
              if (i === 3) {
                worksheet.getCell('B23').value = x.quantita;
                worksheet.getCell('H23').value = worksheet.getCell(
                  'F23'
                ).value = Number(x.costo);
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
            userData.nome + ' ' + userData.cognome;
          worksheet.getCell('C25').value = worksheet.getCell('C5').value =
            userData.indirizzo;
          worksheet.getCell('C6').value = userData.cap;
          worksheet.getCell('C26').value = worksheet.getCell('C7').value =
            userData.citta;
          worksheet.getCell('C27').value = worksheet.getCell('C8').value =
            userData.numero_telefono;
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
              userData.nome +
              '_' +
              userData.cognome +
              '_' +
              formatDateVar +
              '.xlsx'
          );
        });
      };
      reader.readAsArrayBuffer(res);
    });
  }
}
