const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const { bubbleSort, formatNumber } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
const path = `./data/${zip}`;
const comingSoon = readFileSync(`${path}/coming_soon.csv`);

function comingSoonDoc() {
  parse(comingSoon, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = [
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
      row[0] = formatNumber(row[0]);
      row[1] = formatNumber(row[1]);
      row.splice(2, 3);
      row[0] = `[${row[0]}](${row[13]})`;
      row[8] = `${row[8]} ${row[9]}`;
      row.splice(9, 1);
      row.pop();
    });

    const content = bubbleSort(rows);
    content.unshift(header);

    try {
      writeFileSync(
        `${path}/coming_soon.md`,
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
