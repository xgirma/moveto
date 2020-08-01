const { readFileSync, appendFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");

const zip = argv.zip || 27519; // TODO change back to 28685
const path = `./data/${zip}`;
const details = readFileSync(`${path}/for_sale.csv`);

function writeToFile(header, data, type) {
  const content = [];
  if (header !== "") {
    content.push(header);
  }

  data.forEach((element) => content.push(element));

  writeFileSync(`${path}/${type}.csv`, "", "utf8");

  try {
    content.forEach((line) => {
      appendFileSync(`${path}/${type}.csv`, `${line}\n`, "utf8");
    });
  } catch (error) {
    console.error("Error writing csv to file");
  }
}

function classifyForSale() {
  parse(details, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = rows[0];
    const priceReduced = rows.filter((row) => Number(row[4]) > 0);
    const openHouse = rows.filter((row) => row[18] !== "");

    writeToFile(header, priceReduced, "price_reduced");
    writeToFile("", openHouse, "open_house");
  });
}

classifyForSale();
