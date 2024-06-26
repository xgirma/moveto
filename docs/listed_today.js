const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const { bubbleSort, formatNumber, truncate } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
const path = `./data/${zip}`;
const listedToday = readFileSync(`${path}/listed_today.csv`);

function listedTodayDoc() {
  parse(listedToday, { trim: true }, (error, rows) => {
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
      row[2] = truncate(row[2]);
      row.splice(2, 3);
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
        `${path}/listed_today.md`,
        table(content, { align: "l" }),
        "utf8"
      );
      console.info(`Write ${path}`);
    } catch (e) {
      console.error(e.message);
    }
  });
}

listedTodayDoc();
