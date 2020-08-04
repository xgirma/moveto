const {
  readFileSync,
  appendFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} = require("fs");
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
      row.splice(6, 3);
      row[5] = `[![${row[5]}](${row[16]})](${row[16]})`;
      row[8] = `${row[8]} Sqft`;
      row[9] = `${row[9]} /Sqft`;
      row[11] = `${row[11]} ${[row[12]]}`;

      row.splice(12, 1);
      row.splice(15, 1);
    });

    rows[0][0] = "Price";
    rows[0][1] = "Estimated";
    rows[0][2] = "Min est.";
    rows[0][3] = "Max est.";
    rows[0][4] = "Reduced";
    rows[0][5] = "Address";
    rows[0][6] = "Bed";
    rows[0][7] = "Bath";
    rows[0][8] = "Size";
    rows[0][9] = "Value";
    rows[0][10] = "Day";
    rows[0][11] = "Lot";
    rows[0][12] = "Year";
    rows[0][13] = "HOA";
    rows[0][14] = "Open house";

    writeFileSync(`${path}/BYPRICE.md`, table(rows, { align: "l" }), "utf8");
  });
}

docByPrice();
