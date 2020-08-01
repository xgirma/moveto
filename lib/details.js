const { readFileSync, appendFileSync, writeFileSync } = require("fs");
const parse = require("csv-parse");
const { argv } = require("yargs");

const zip = argv.zip || 27519; // TODO change back to 28685
const path = `./data/${zip}`;
const details = readFileSync(`${path}/details.csv`);

function writeToFile(header, data, type) {
  const content = [];
  content.push(header);

  data.forEach((element) => {
    element.shift();
    return content.push(element);
  });

  writeFileSync(`${path}/${type}.csv`, "", "utf8");

  try {
    content.forEach((line) => {
      appendFileSync(`${path}/${type}.csv`, `${line}\n`, "utf8");
    });
  } catch (error) {
    console.error("Error writing csv to file");
  }
}

function classifyDetails() {
  parse(details, { trim: true }, (error, rows) => {
    if (error) {
      console.error(`Error parsing data from csv`);
    }

    const header = rows[0];
    const forSale = rows.filter((row) => row.includes("FOR SALE"));
    const comingSoon = rows.filter((row) => row[0].startsWith("Coming Soon"));
    const salePending = rows.filter((row) => row.includes("SALE PENDING"));
    const inContract = rows.filter((row) => row.includes("IN CONTRACT"));

    header.shift();
    writeToFile(header, forSale, "for_sale");
    writeToFile(header, comingSoon, "coming_soon");
    writeToFile(header, salePending, "sale_pending");
    writeToFile(header, inContract, "in_contract");
  });
}

classifyDetails();
