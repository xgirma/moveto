/* eslint-disable no-console */
const { writeFileSync, mkdirSync, existsSync } = require("fs");
const { chromium } = require("playwright");
const { argv } = require("yargs");
const assert = require("assert");
const zipcodes = require("zipcodes");
const moment = require("moment");

const { clean, sortObject } = require("./utils");

let page;
let browser;

describe("constant", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  const zip = argv.zip || 28685;
  const { state, city } = zipcodes.lookup(zip);

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    const home = `https://www.movoto.com/${city.toLowerCase()}-${state.toLowerCase()}`;

    await page
      .goto(home, {
        timeout: 4500,
        waitUntil: "networkidle",
      })
      .catch(() => {});
    clean();
  });

  afterAll(() => {
    if (!page.isClosed()) {
      browser.close();
    }
  });

  it("init", async () => {
    const folder = `./data/${zip}`;
    let path;

    const pagesCount = await page.$$eval(".paging.v2 > a", (p) => p.length);
    const title = await page.$eval("#txtH1", (el) => el.textContent);
    const pages = pagesCount || 1;

    try {
      if (!existsSync(folder)) {
        mkdirSync(folder);
      }

      path = `./data/${zip}/constants.json`;
      const date = moment
        .utc()
        .subtract(5, "hours")
        .format("MMMM Do YYYY, h:mm:ss a");
      const data = { city, state, zip, pages, date: `${date} EST` };
      const update = JSON.stringify(sortObject(data), null, 2);
      writeFileSync(path, update, "utf8");
    } catch (error) {
      console.error(error);
    }
    assert.strictEqual(
      title.trim(),
      `${city}, ${state} Real Estate & Homes for Sale`
    );
  });
});
