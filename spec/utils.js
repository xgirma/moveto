const { argv } = require("yargs");
const { existsSync, writeFileSync, unlinkSync } = require("fs");

const { DEFAULT_ZIP } = require("./defaults");

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
  const zip = argv.zip || DEFAULT_ZIP;
  const path = `./data/${zip}`;
  const chart = `${path}/chart.svg`;

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
      if (existsSync(file)) {
        writeFileSync(file, "", "utf8");
      }
    } catch (error) {
      console.error("Faild to clean links");
    }
  });

  try {
    if (existsSync(chart)) {
      unlinkSync(chart);
    }
  } catch (error) {
    console.error("Failed to clean links.json or chart.csv");
  }
}

function isNumeric(value) {
  return !Number.isNaN(Number(value));
}

function bubbleSort(inputArr) {
  const len = inputArr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i += 1) {
      if (inputArr[i][0] < inputArr[i + 1][0]) {
        const tmp = inputArr[i];
        inputArr[i] = inputArr[i + 1];
        inputArr[i + 1] = tmp;
        swapped = true;
      }
    }
  } while (swapped);
  return inputArr;
}

function formatNumber(num) {
  return Number(num)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

function truncate(str, n = 19) {
  return str.length > n ? `${str.substr(0, n - 1)} ...` : str;
}

module.exports = {
  bubbleSort,
  clean,
  delay,
  formatNumber,
  isNumeric,
  sortObject,
  sortAscending,
  sortDescending,
  truncate,
};
