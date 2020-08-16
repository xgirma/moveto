const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const { bubbleSort } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
const path = `./data/${zip}`;
const listedToday = readFileSync(`${path}/listed_today.csv`);

function listedTodayDoc() {
  parse(listedToday, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    rows.forEach((row) => {
      row.splice(2, 3);
      row[0] = `[${row[0]}](${row[13]})`;
      row[8] = `${row[8]} ${row[9]}`;
      row.splice(9, 1);
      row.pop();
    });

    rows[0][0] = "Price";
    rows[0][7] = "Lot";

    const header = rows[0];
    rows.shift();
    const content = bubbleSort(rows);
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
