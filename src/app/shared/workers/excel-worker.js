importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.0/exceljs.min.js"
);
function normalizeString(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
function formatDate(rawDate) {
  if (rawDate instanceof Date) {
    const day = rawDate.getDate().toString().padStart(2, "0");
    const month = (rawDate.getMonth() + 1).toString().padStart(2, "0");
    const year = rawDate.getFullYear().toString();
    return `${day}/${month}/${year}`;
  } else if (typeof rawDate === "string") {
    const [day, month, year] = rawDate.split("/");
    const formattedYear = year.length === 2 ? "20" + year : year; // Assuming the year is in the 2000s
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${formattedYear}`;
  }
}

self.addEventListener("message", async (event) => {
  const { file } = event.data;
  const workbook = new ExcelJS.Workbook();
  const reader = new FileReader();

  reader.onload = async (e) => {
    const data = new Uint8Array(e.target.result);
    await workbook.xlsx.load(data);
    const worksheet = workbook.getWorksheet(1); // Get the first worksheet
    const rows = worksheet.getSheetValues();
    const itemList = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (i !== 1) {
        const rowData = row; // Get the row values
        let negozio = rowData[15] !== undefined ? rowData[15] : "";
        switch (negozio) {
          case "Iseo":
            negozio = "Negozio I";
            break;
          case "Negozio i":
            negozio = "Negozio I";
            break;
          case "Negozio I":
            negozio = "Negozio I";
            break;
          case "iseo":
            negozio = "Negozio I";
            break;
          case "brescia":
            negozio = "Negozio B";
            break;
          case "Brescia":
            negozio = "Negozio B";
            break;
          case "Negozio B":
            negozio = "Negozio B";
            break;
          case "magazzino":
            negozio = "Magazzino";
            break;
          case "Magazzino":
            negozio = "Magazzino";
            break;
        }
        let garanzia = rowData[14] !== undefined ? rowData[14] : "";
        switch (garanzia) {
          case "3mesi":
            garanzia = "3 mesi";
            break;
          case "3 Mesi":
            garanzia = "3 mesi";
            break;
          case 3:
            garanzia = "3 mesi";
            break;
          case "6mesi":
            garanzia = "6 mesi";
            break;
          case "6 Mesi":
            garanzia = "6 mesi";
            break;
          case 6:
            garanzia = "6 mesi";
            break;
          case "12mesi":
            garanzia = "12 mesi";
            break;
          case "12mesi":
            garanzia = "12 mesi";
            break;
          case "12 Mesi":
            garanzia = "12 mesi";
            break;
          case 12:
            garanzia = "12 mesi";
            break;
        }
        const rawDate = rowData[1];
        const formattedDate = formatDate(rawDate);

        const itemData = {
          dataAcquistoInventario: formattedDate !== undefined ? formattedDate : "",
          marca: rowData[2] !== undefined ? normalizeString(rowData[2]) : "",
          nome: rowData[3] !== undefined ? rowData[3] : "",
          IMEI: rowData[4] !== undefined ? rowData[4] : "",
          colore: rowData[5] !== undefined ? rowData[5] : "",
          memoria: rowData[6] !== undefined ? rowData[6] : "",
          grado: rowData[7] !== undefined ? rowData[7].toString() : "",
          prezzo_acquisto: rowData[8] !== undefined ? rowData[8] : "",
          fornitore: rowData[9] !== undefined ? rowData[9] : "",
          quantita: rowData[10] !== undefined ? rowData[10] : "",
          perc_batteria: rowData[11] !== undefined ? rowData[11] : "",
          prezzo_negozio: rowData[12] !== undefined ? rowData[12] : "",
          prezzo_online: rowData[13] !== undefined ? rowData[13] : "",
          data: new Date(),
          garanzia_mesi: garanzia,
          negozio,
          id: Math.floor(100000 + Math.random() * 900000),
        };
        if (itemData.IMEI !== "" && rowData[4] !== undefined) {
          itemList.push(itemData);
        }
      }
    }

    self.postMessage({ itemList });
  };

  reader.readAsArrayBuffer(file);
});
