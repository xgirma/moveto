const { argv } = require("yargs");
const { writeFileSync } = require("fs");

function sortObject(obj) {
  const keys = Object.keys(obj).sort();
  const newObj = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function sortDescending(data, column) {
  return data.sort((a, b) => {
    return parseInt(b[column], 10) - parseInt(a[column], 10);
  });
}

function sortAscending(data, column) {
  return data.sort((a, b) => {
    return parseInt(a[column], 10) - parseInt(b[column], 10);
  });
}

function clean() {
  const zip = argv.zip || 28685;
  const path = `./data/${zip}`;
  const linksJson = `${path}/links.json`;
  const csvFiles = [
    `${path}/by_price.csv`,
    `${path}/by_days.csv`,
    `${path}/by_size.csv`,
    `${path}/by_year.csv`,
    `${path}/coming_soon.csv`,
    `${path}/details.csv`,
    `${path}/for_sale.csv`,
    `${path}/in_contract.csv`,
    `${path}/listed_today.csv`,
    `${path}/open_house.csv`,
    `${path}/price_reduced.csv`,
    `${path}/sale_pending.csv`,
  ];

  csvFiles.forEach((file) => {
    try {
      writeFileSync(file, "", "utf8");
    } catch (error) {
      console.error("Faild to clean links");
    }
  });

  const content = [];
  const update = JSON.stringify(content, null, 2);
  try {
    writeFileSync(linksJson, update, "utf8");
  } catch (error) {
    console.error("Faild to clean links");
  }
}

module.exports = { clean, delay, sortObject, sortAscending, sortDescending };
