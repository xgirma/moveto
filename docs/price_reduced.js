const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const { bubbleSort, formatNumber, truncate } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
const path = `./data/${zip}`;
const priceReduced = readFileSync(`${path}/price_reduced.csv`);

function comingSoonDoc() {
  parse(priceReduced, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = [
      "Reduced",
      "Price",
      "Est.",
      "Address",
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
      row.unshift(row[4]);
      row[0] = formatNumber(row[0]);
      row[0] = `[${row[0]}](${row[17]})`;
      row[1] = formatNumber(row[1]);
      row[2] = formatNumber(row[2]);
      row.splice(3, 3);
      row[8] = row[8] === "Listed Today" ? "New" : row[8];
      row[3] = truncate(row[3]); // 4,5,6,7,8,9,10
      row.splice(10, 1);
      row.pop();
    });

    const content = bubbleSort(rows);
    content.unshift(header);

    try {
      writeFileSync(
        `${path}/price_reduced.md`,
        table(content, { align: "l" }),
        "utf8"
      );
      console.info(`Write ${path}`);
    } catch (e) {
      console.error(e.message);
    }
  });
}

comingSoonDoc();
