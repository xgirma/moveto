const { argv } = require("yargs");
const { writeFileSync, readFileSync, mkdirSync, existsSync, appendFileSync } = require("fs");
const { chromium } = require("playwright");
const assert = require("assert");
const { delay } = require("./utils");
const zip = argv.zip || 28685;
const linksFile = readFileSync(`./data/${zip}/links.json`);
const links = JSON.parse(linksFile);
const path = `./data/${zip}/details.csv`;

let page;
let browser;
let details = [];

let link = 0;

function appendList(line) {
  const folder = `./data/${zip}`;

  try {
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }

    const update = JSON.stringify(details, null, 2);
    appendFileSync(path, line, "utf8");
  } catch (error) {
    console.error(error);
  }
}

writeFileSync(path,'', "utf8");

do {
  let line = '';

  describe(`abc ${link}`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    const url = links[link];
    let flag = false;

    beforeAll( async () => {
      browser = await chromium.launch({headless: false});
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
        appendList(line + '\n');
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
        flag = (await page.$(".icon-property-single-family")) == null;
      } catch (error) {
        console.error(
            "Error: when querying for .icon-property-single-family element"
        );
      }
    });

    it("status", async () => {
      if (!flag) {
        const status = await page.$eval(
            "#dppHeader > div > div.sup > span.text",
            (el) => el.textContent
        );
        line += status
      }
    });
  });

  link = link + 1;
} while (link < links.length);
