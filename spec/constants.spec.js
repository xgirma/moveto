const { writeFileSync, mkdirSync, existsSync } = require("fs");
const { chromium } = require("playwright");
const { argv } = require("yargs");
const assert = require("assert");
const zipcodes = require("zipcodes");

const { sortObject } = require("./utils");

let page;
let browser;

/**
 * Scrap per zip code
 *  the # of pages
 *  State name
 *  date
 */
describe("constant", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  const zip = argv.zip || 27560;
  const { state } = zipcodes.lookup(zip);

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    const home = `https://www.movoto.com/${state}/${zip}`;

    await page
      .goto(home, {
        timeout: 4500,
        waitUntil: "networkidle",
      })
      .catch(() => {});
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

      const date = new Date();
      const data = { zip, state, pages, date };
      const update = JSON.stringify(sortObject(data), null, 2);
      writeFileSync(path, update, "utf8");
    } catch (error) {
      console.error(error);
    }
    assert.strictEqual(title, `${zip}, ${state} Real Estate & Homes For Sale`);
  });
});
