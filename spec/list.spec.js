/* eslint-disable no-console */

const { writeFileSync, readFileSync, mkdirSync, existsSync } = require("fs");
const { chromium } = require("playwright");
const { argv } = require("yargs");

const zip = argv.zip || 28685;
const assert = require("assert");
const { delay } = require("./utils");

const links = [];
const constant = readFileSync(`./data/${zip}/constants.json`);
const data = JSON.parse(constant);
const { pages, city, state } = data;
const host = "https://www.movoto.com";

function writeList() {
  const folder = `./data/${zip}`;

  try {
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }
    const path = `./data/${zip}/links.json`;
    const update = JSON.stringify(links, null, 2);
    writeFileSync(path, update, "utf8");
  } catch (error) {
    console.error(error);
  }
}

if (pages === 1) {
  describe("single page", () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    let browser;
    let page;

    beforeAll(async () => {
      browser = await chromium.launch({ headless: false });
      page = await browser.newPage();
      const url = `${host}/${city}-${state}`;
      await page
        .goto(url, { timeout: 4500, waitUntil: "networkidle" })
        .catch(() => {});
    });

    afterAll(() => {
      if (!page.isClosed()) {
        browser.close();
      }
    });

    it(`should get a list of links`, async () => {
      const title = await page.$eval("#txtH1", (el) => el.textContent);
      assert.strictEqual(
        title.trim(),
        `${city}, ${state} Real Estate & Homes for Sale`
      );

      const cardLink = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".card-link")).map((d) =>
          d.getAttribute("href")
        )
      );

      cardLink.forEach((card) => {
        links.push(card);
      });
    });

    it("should write", async () => {
      writeList();
    });
  });
} else {
  for (let i = 1; i < data.pages - 1; i += 1) {
    describe("multiple page", () => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
      let browser;
      let page;

      beforeAll(async () => {
        browser = await chromium.launch({ headless: false });
        page = await browser.newPage();
        const url = `${host}/${city}-${state}/p-${i}`;
        await page
          .goto(url, { timeout: 4500, waitUntil: "networkidle" })
          .catch(() => {});
      });

      afterAll(() => {
        if (!page.isClosed()) {
          browser.close();
        }
      });

      it("should get a list of links", async () => {
        const title = await page.$eval("#txtH1", (el) => el.textContent);

        assert.strictEqual(
          title.trim(),
          `${city}, ${state} Real Estate & Homes for Sale`
        );

        const cardLink = await page.evaluate(() =>
          Array.from(document.querySelectorAll(".card-link")).map((d) =>
            d.getAttribute("href")
          )
        );

        cardLink.forEach((card) => {
          links.push(card);
        });
      });

      it("should write", async () => {
        writeList();
        await delay(10000);
      });
    });
  }
}
