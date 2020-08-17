const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const { bubbleSort, formatNumber } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
const path = `./data/${zip}`;
const forSale = readFileSync(`${path}/for_sale.csv`);

function forSaleDoc() {
  parse(forSale, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = [
      "Price",
      "Est.",
      "Reduced",
      "Bed",
      "Bath",
      "Size",
      "Value",
      "Days",
      "Lot",
      "Year",
      "HOA",
      "Open",
    ];

    rows.shift();

    rows.forEach((row) => {
      row[0] = Number(row[0]);
      row[1] = formatNumber(row[1]);
      row[2] = formatNumber(row[2]);
      row.splice(3, 3);
      row[7] = row[7] === "Listed Today" ? "New" : row[7];
      row.splice(9, 1);
    });

    const content = bubbleSort(rows);

    rows.forEach((row) => {
      row[0] = formatNumber(row[0]);
      row[0] = `[${row[0]}](${row[12]})`;
      row.pop();
    });

    content.unshift(header);

    try {
      writeFileSync(
        `${path}/for_sale.md`,
        table(content, { align: "l" }),
        "utf8"
      );
      console.info(`Write ${path}`);
    } catch (e) {
      console.error(e.message);
    }
  });
}

forSaleDoc();
