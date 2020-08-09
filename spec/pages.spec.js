/* eslint-disable no-console */
const { writeFileSync, mkdirSync, existsSync } = require("fs");
const { chromium } = require("playwright");
const { argv } = require("yargs");
const zipcodes = require("zipcodes");
const moment = require("moment");

const zip = argv.zip || 28685;
const { state, city } = zipcodes.lookup(zip);

const { clean, isNumeric, sortObject } = require("./utils");

let page;
let browser;

describe("pages", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    const home = `https://www.movoto.com/${state.toLowerCase()}/${zip}`;

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

  it("get pages", async () => {
    const folder = `./data/${zip}`;
    let path;
    const css = ".paging.v2 > a";
    let pagesCount = 0;

    if ((await page.$$(css)) != null) {
      const navigation = await page.$$(css);
      for (let i = 0; i < navigation.length - 2; i += 1) {
        const list = `.paging.v2 > a[data-page="${i + 1}"]`;
        const textContent = await page.$eval(list, (el) => el.textContent);
        if (isNumeric(textContent) && textContent > 0) {
          pagesCount += 1;
        }
      }
    }

    const pages = pagesCount || 1;

    const title = await page.$eval("#txtH1", (el) => el.textContent);

    try {
      if (!existsSync(folder)) {
        mkdirSync(folder);
      }

      path = `./data/${zip}/pages.json`;
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
    expect(title.trim()).toContain(`${zip}`);
  });
});
