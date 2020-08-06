const { readFileSync, appendFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");

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

function classifyForSale() {
  parse(forSale, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = rows[0];
    const priceReduced = rows.filter((row) => Number(row[4]) > 0);
    const openHouse = rows.filter((row) => row[15] !== "");
    const listedToday = rows.filter((row) => row[10] === "Listed Today");

    writeToFile(header, priceReduced, "price_reduced");
    writeToFile("", openHouse, "open_house");
    writeToFile(header, listedToday, "listed_today");
  });
}

classifyForSale();
