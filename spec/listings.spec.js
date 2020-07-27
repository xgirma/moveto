const { writeFileSync, readFileSync, mkdirSync, existsSync } = require("fs");
const { chromium } = require("playwright");
const { argv } = require("yargs");

const zip = argv.zip || "27560";
const assert = require("assert");
const { delay } = require("./utils");

let data = {};
const links = [];

/**
 * Scrap all listings per page and write to a JSON file
 */
describe("listings", () => {
  describe("data", () => {
    it("get data", () => {
      const constant = readFileSync(`./data/${zip}/constants.json`);
      data = JSON.parse(constant);
    });
  });

  async function scrap(no) {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    const host = "https://www.movoto.com";
    const url = `${host}/${data.state.toLowerCase()}/${zip}/p-${no}`;

    await page.goto(url, { waitUntil: "networkidle" }).catch(() => {});

    const title = await page.$eval("#txtH1", (el) => el.textContent);
    assert.strictEqual(
      title.trim(),
      `${zip}, ${data.state} Real Estate & Homes For Sale`
    );

    const cardLink = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".card-link")).map((d) =>
        d.getAttribute("href")
      )
    );

    cardLink.forEach((card) => {
      links.push(card);
    });

    if (!page.isClosed()) {
      browser.close();
    }
  }

  describe("pages", () => {
    it("get pages", async () => {
      if(data.pages == 1) {
        await scrap(1);
        await delay(1000);
      } else {
        /* eslint-disable */
        for (let i = 1; i < data.pages - 1; i += 1) {
          await scrap(i);
          await delay(1000);
        }
        /* eslint-enable */
      }
    }, 600000); // 10 minutes max
  });

  describe("write links", () => {
    it("should write", async () => {
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
    });
  });
});
