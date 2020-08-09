const { writeFileSync, readFileSync, mkdirSync, existsSync } = require("fs");
const { chromium } = require("playwright");
const { argv } = require("yargs");
const { delay } = require("./utils");
const { DEFAULT_ZIP } = require("./constants");

const host = "https://www.movoto.com";
const zip = argv.zip || DEFAULT_ZIP;
const constant = readFileSync(`./data/${zip}/pages.json`);
const data = JSON.parse(constant);
const { pages, state } = data;
const links = [];

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

async function getLinksList(page) {
  const title = await page.$eval("#txtH1", (el) => el.textContent);
  expect(title.trim()).toContain(`${zip}`);

  const cardLink = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".card-link")).map((d) =>
      d.getAttribute("href")
    )
  );

  cardLink.forEach((card) => {
    links.push(card);
  });
}

if (pages === 1) {
  const url = `${host}/${state}/${zip}/p-1`;
  describe(`links: for ${url}`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;
    let browser;
    let page;

    beforeAll(async () => {
      browser = await chromium.launch({ headless: false });
      page = await browser.newPage();

      await page
        .goto(url, { timeout: 30000, waitUntil: "networkidle" })
        .catch(() => {});
    });

    afterAll(() => {
      if (!page.isClosed()) {
        browser.close();
      }
    });

    it(`should get links`, async () => {
      await getLinksList(page);
    });

    it("should write links", async () => {
      writeList();
      await delay(5000);
    });
  });
} else {
  for (let i = 1; i <= data.pages; i += 1) {
    const url = `${host}/${state}/${zip}/p-${i}`;

    describe(`links: for ${url}`, () => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
      let browser;
      let page;

      beforeAll(async () => {
        browser = await chromium.launch({ headless: false });
        page = await browser.newPage();

        await page
          .goto(url, { timeout: 4500, waitUntil: "networkidle" })
          .catch(() => {});
      });

      afterAll(() => {
        if (!page.isClosed()) {
          browser.close();
        }
      });

      it("should get links", async () => {
        await getLinksList(page);
      });

      it("should write links", async () => {
        writeList();
        await delay(5000);
      });
    });
  }
}
