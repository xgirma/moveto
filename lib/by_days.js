const { readFileSync, appendFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");
const { sortAscending } = require("../spec/utils");

const zip = argv.zip || 28685;
const path = `./data/${zip}`;
const forSale = readFileSync(`${path}/for_sale.csv`);

function writeToFile(header, data, type) {
  const content = [];
  const file = `${path}/${type}.csv`;

  if (header !== "") {
    content.push(header);
  }

  data.forEach((element) => content.push(element));

  writeFileSync(file, "", "utf8");

  try {
    content.forEach((line) => {
      appendFileSync(file, `${line}\n`, "utf8");
    });
  } catch (error) {
    console.error("Error writing csv to file");
  }
}

function sortByDays() {
  parse(forSale, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = rows[0];
    rows.shift();
    const sortedByDays = sortAscending(rows, 10);

    writeToFile(header, sortedByDays, "by_days");
  });
}

sortByDays();
