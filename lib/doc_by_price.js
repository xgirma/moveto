const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const zip = argv.zip || 28685;
const path = `./docs/${zip}`;
const byPriceCsv = readFileSync(`./data/${zip}/by_price.csv`);

function docByPrice() {
  parse(byPriceCsv, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    rows.forEach((row) => {
      const address = `[${row[5]}](${row[16]})`;
      row.splice(6, 3);
      row.splice(4, 1);
      row[4] = address;
      row[7] = `${row[7]}/Sqft`;
      row[8] = `${row[8]}/Sqft`;
      row.splice(9, 1);
      row[9] = `${row[9]} ${[row[10]]}`;
      row.splice(10, 1);
      row.splice(13, 1);
    });

    rows[0][0] = "Price";
    rows[0][1] = "Est.";
    rows[0][2] = "Min";
    rows[0][3] = "Max";
    rows[0][4] = "Address";
    rows[0][5] = "Bed";
    rows[0][6] = "Bath";
    rows[0][7] = "Area";
    rows[0][8] = "Value";
    rows[0][9] = "Lot";
    rows[0][10] = "Year";
    rows[0][11] = "HOA";
    rows[0][12] = "Open house";

    writeFileSync(`${path}/BYPRICE.md`, table(rows, { align: "l" }), "utf8");
  });
}

docByPrice();
