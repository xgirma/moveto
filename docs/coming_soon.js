const { readFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const table = require("markdown-table");

const { sortAscending } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
const path = `./data/${zip}`;
const comingSoon = readFileSync(`${path}/coming_soon.csv`);

function comingSoonDoc() {
  parse(comingSoon, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    rows.forEach((row) => {
      row.splice(2, 4);
      row[0] = `\\![${row[0]}](${row[12]})`;
      row.splice(11, 2);
      row[7] = `${row[7]} ${row[8]}`;
      row.splice(8, 1);
    });

    const content = sortAscending(rows, 0);

    rows[0][0] = "Price";
    rows[0][7] = "Lot";

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
