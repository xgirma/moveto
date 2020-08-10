const { readFileSync, appendFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");

const { sortDescending } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/defaults");

const zip = argv.zip || DEFAULT_ZIP;
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

function sortBySize() {
  parse(forSale, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    rows.forEach((row) => {
      row.unshift(row[8]);
      row.splice(9, 1);
    });

    const header = rows[0];
    rows.shift();
    const sortedByPrice = sortDescending(rows, 0);

    writeToFile(header, sortedByPrice, "by_size");
  });
}

sortBySize();
