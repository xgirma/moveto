/* eslint-disable no-loop-func, no-console */

const { argv } = require("yargs");
const {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  appendFileSync,
} = require("fs");
const { chromium } = require("playwright");
const assert = require("assert");
const zipcodes = require("zipcodes");
const { delay } = require("./utils");

const maxPrice = argv.maxprice || 500000;
const zip = argv.zip || 28685;
const bedsMinimum = argv.beds || 3;
const bathsMinimum = argv.baths || 2;

const linksFile = readFileSync(`./data/${zip}/links.json`);
const links = JSON.parse(linksFile);
const path = `./data/${zip}/details.csv`;
const { state, city } = zipcodes.lookup(zip);

let page;
let browser;

let link = 0;

function appendList(line) {
  const folder = `./data/${zip}`;

  try {
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }

    appendFileSync(path, line, "utf8");
  } catch (error) {
    console.error(error);
  }
}

writeFileSync(path, "", "utf8");

function isNumber(value) {
  assert(Number(value), jasmine.any(Number));
}

do {
  let line = "";

  describe("main", () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    const url = links[link];
    let flag = false;

    beforeAll(async () => {
      browser = process.env.GITHUB_ACTIONS
          ? await chromium.launch()
          : await chromium.launch({ headless: false });
      page = await browser.newPage();

      await page
        .goto(url, {
          timeout: 4500,
          waitUntil: "networkidle",
        })
        .catch(() => {});
    });

    afterAll(() => {
      if (!flag) {
        appendList(`${line},${url}\n`);
      }

      if (!page.isClosed()) {
        browser.close();
      }
    });

    afterEach(async () => {
      await delay(1000);
    });

    it("single family home?", async () => {
      try {
        const css =
          ".dpp-header-left > div > span > .icon-property-single-family";
        flag = (await page.$(css)) == null;
      } catch (error) {
        const errorMessage =
          "Error: when querying for .icon-property-single-family element";
        console.error(errorMessage);
      }
    });

    it("status", async () => {
      if (!flag) {
        const css = "#dppHeader > div > div.sup > span.text";
        const status = await page.$eval(css, (el) => el.textContent);
        line += status;
      }
    });

    it("price", async () => {
      if (!flag) {
        const css = "#dppHeader > div > div.title.dpp-price > span";
        const formattedPrice = await page.$eval(css, (el) => el.textContent);
        const price = formattedPrice.substr(1).replace(",", "");
        flag = price > maxPrice;
        line += `,${price}`;
        isNumber(price);
      }
    });

    it("address", async () => {
      if (!flag) {
        const css = ".dpp-header-title > .title";
        const address = await page.$eval(css, (el) => el.textContent);
        line += `,${address.trim()},${city},${state},${zip}`;
      }
    });

    it("beds", async () => {
      if (!flag) {
        const css = ".dpp-basic > div:nth-child(1) > b";
        const beds = await page.$eval(css, (el) => el.textContent);
        const formattedBeds = beds.trim();
        flag = beds < bedsMinimum;
        line += `,${formattedBeds}`;
        isNumber(formattedBeds);
      }
    });

    it("baths", async () => {
      if (!flag) {
        const css = "#dppHeader > div > div.sub > div > div:nth-child(2) > b";
        const baths = await page.$eval(css, (el) => el.textContent);
        const formattedBaths = baths.trim();
        flag = baths < bathsMinimum;
        line += `,${formattedBaths}`;
        isNumber(formattedBaths);
      }
    });

    it("size in sqft", async () => {
      if (!flag) {
        const css = "#dppHeader > div > div.sub > div > div:nth-child(3) > b";
        const size = await page.$eval(css, (el) => el.textContent);
        const formattedSize = size.trim();
        line += `,${formattedSize}`;
        isNumber(formattedSize);
      }
    });

    it("price per a sqft", async () => {
      if (!flag) {
        const css = ".dpp-column > ul > li:nth-child(1) > span:nth-child(2)";
        const value = await page.$eval(css, (el) => el.textContent);
        const formattedValue = value.substr(1).replace("/Sqft", "");
        line += `,${formattedValue}`;
        isNumber(formattedValue);
      }
    });

    it("days in moveto", async () => {
      if (!flag) {
        const css = ".dpp-column > ul > li:nth-child(3) > span:nth-child(2)";
        const days = await page.$eval(css, (el) => el.textContent);
        const formattedDays = days.trim();
        line += `,${formattedDays}`;
        isNumber(formattedDays);
      }
    });

    it("lot acres", async () => {
      if (!flag) {
        const css = ".dpp-column > ul > li:nth-child(7) > span:nth-child(2)";
        const lots = await page.$eval(css, (el) => el.textContent);
        const formattedLots = lots.trim().replace(",", "");
        line += `,${formattedLots}`;
        isNumber(formattedLots);
      }
    });

    it("year built", async () => {
      if (!flag) {
        const css = ".dpp-column > ul > li:nth-child(9)";
        const year = await page.$eval(css, (el) => el.textContent);
        const formattedYears = year.replace("Year Built", "").trim();
        line += `,${formattedYears}`;
        isNumber(formattedYears);
      }
    });

    it("hoa", async () => {
      if(!flag) {
        const css = ".dpp-column > ul > li:nth-child(8)";
        const hoa = await page.$eval(css, (el) => el.textContent);
        const formattedHoa = hoa.replace("HOA Fees", "").substr(3).replace("/month", "").trim();
        line += `,${formattedHoa}`;
      }
    });
  });

  link += 1;
} while (link < links.length);
