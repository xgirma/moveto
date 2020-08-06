const { argv } = require("yargs");
const {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  appendFileSync,
} = require("fs");
const { chromium } = require("playwright");
const zipcodes = require("zipcodes");
const { delay } = require("./utils");

const maxPrice = argv.maxprice || 500000;
const zip = argv.zip || 28685;
const bedsMinimum = argv.beds || 3;
const bathsMinimum = argv.baths || 2;

const linksFile = readFileSync(`./data/${zip}/links.json`);
const links = JSON.parse(linksFile);
const path = `./data/${zip}/details.csv`;
const header =
  "Status,Price,Est.,Min.,Max.,Reduced,Address,Bed,Bath,Size,Value,Days,Lot,unit,Year,HOA,Open,Link\n";

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
appendList(header);

do {
  let line = "";

  describe("house", () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
    const url = links[link];
    let flag = false;

    beforeAll(async () => {
      browser = await chromium.launch({ headless: false });
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
      await delay(500);
    });

    it(`single family home? ${url}`, async () => {
      try {
        const css =
          ".dpp-header-left > div > span > .icon-property-single-family";
        if ((await page.$(css)) == null) {
          flag = true;
        }
      } catch (error) {
        const errorMessage =
          "Error: when querying for .icon-property-single-family element";
        console.error(errorMessage);
      }
    });

    it(`status: ${url}`, async () => {
      if (!flag) {
        const css = "#dppHeader > div > div.sup > span.text";
        try {
          if ((await page.$(css)) != null) {
            const status = await page.$eval(css, (el) => el.textContent);
            line += status;
          } else {
            line += ",";
          }
        } catch (error) {
          console.error(`Error could not found element for status`);
        }
      }
    });

    it(`price: ${url}`, async () => {
      if (!flag) {
        const css = "#dppHeader > div > div.title.dpp-price > span";
        try {
          if ((await page.$(css)) != null) {
            const formattedPrice = await page.$eval(
              css,
              (el) => el.textContent
            );
            const price = formattedPrice
              .substr(1)
              .replace(",", "")
              .replace(",", "");
            flag = price > maxPrice;
            line += `,${price}`;
          } else {
            line += ",";
          }
        } catch (error) {
          console.error(`Error could not found element for price`);
        }
      }
    });

    it(`estimated: ${url}`, async () => {
      if (!flag) {
        const css = ".dpp-estprice-panel > div > .text-green";
        try {
          if ((await page.$(css)) == null) {
            line += `,0`;
          } else {
            const estimatedPrice = await page.$eval(
              css,
              (el) => el.textContent
            );
            const formattedEstimatedPrice = estimatedPrice
              .trim()
              .replace("$", "")
              .replace(",", "")
              .replace(",", "");
            line += `,${formattedEstimatedPrice}`;
          }
        } catch (error) {
          line += `,0`;
          console.error("Error finding estimated price");
        }
      }
    });

    it(`price min and max estimate: ${url}`, async () => {
      if (!flag) {
        const css = "#estPrice > div > div > div:nth-child(1) > b";
        try {
          if ((await page.$(css)) != null) {
            const formattedPrice = await page.$eval(
              css,
              (el) => el.textContent
            );
            const temp = formattedPrice.trim().split("-");
            const min = temp[0]
              .trim()
              .replace("$", "")
              .replace(",", "")
              .replace("K", "000");
            const max = temp[1]
              .trim()
              .replace("$", "")
              .replace(",", "")
              .replace("K", "000");
            line += `,${min}`;
            line += `,${max}`;
          } else {
            line += `,`;
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding min/max estimated price");
        }
      }
    });

    it(`reduced: ${url}`, async () => {
      if (!flag) {
        const css = "#dppHeader > div.dpp-header-left > div.sup > span.f6";

        try {
          if ((await page.$(css)) == null) {
            line += `,0`;
          } else {
            const priceReduced = await page.$eval(css, (el) => el.textContent);

            const shortened = priceReduced.trim().endsWith("K");
            const reduced = priceReduced
              .replace("$", "")
              .replace("K", "")
              .trim();
            const final = shortened ? `${reduced}000` : reduced;
            line += `,${final}`;
          }
        } catch (error) {
          line += `,0`;
          console.error(`Error finding reduced price element`);
        }
      }
    });

    it(`address: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-header-title > .title";
          if ((await page.$(css)) != null) {
            const address = await page.$eval(css, (el) => el.textContent);
            line += `,${address.trim()}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding address element");
        }
      }
    });

    it(`beds: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-basic > div:nth-child(1) > b";
          if ((await page.$(css)) != null) {
            const beds = await page.$eval(css, (el) => el.textContent);
            const formattedBeds = beds.trim();
            flag = beds < bedsMinimum;
            line += `,${formattedBeds}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.log("Error finding beds element");
        }
      }
    });

    it(`baths: ${url}`, async () => {
      if (!flag) {
        try {
          const css = "#dppHeader > div > div.sub > div > div:nth-child(2) > b";
          if ((await page.$(css)) != null) {
            const baths = await page.$eval(css, (el) => el.textContent);
            const formattedBaths = baths.trim();
            flag = baths < bathsMinimum;
            line += `,${formattedBaths}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding baths element");
        }
      }
    });

    it(`size in sqft: ${url}`, async () => {
      if (!flag) {
        try {
          const css = "#dppHeader > div > div.sub > div > div:nth-child(3) > b";
          if ((await page.$(css)) !== null) {
            const size = await page.$eval(css, (el) => el.textContent);
            const formattedSize = size.trim().replace(",", "");
            line += `,${formattedSize}`;
          } else {
            line += `,$`;
          }
        } catch (error) {
          console.error("Error finding size in sqft");
        }
      }
    });

    it(`price per a sqft: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-column > ul > li:nth-child(1) > span:nth-child(2)";
          if ((await page.$(css)) != null) {
            const value = await page.$eval(css, (el) => el.textContent);
            const formattedValue = value.substr(1).replace("/Sqft", "");
            line += `,${formattedValue}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding price per a sqft element");
        }
      }
    });

    it(`days in moveto: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-column > ul > li:nth-child(3) > span:nth-child(2)";
          if ((await page.$(css)) != null) {
            const days = await page.$eval(css, (el) => el.textContent);
            const formattedDays = days.trim();
            line += `,${formattedDays}`;
          } else {
            line += `,$`;
          }
        } catch (error) {
          console.error("Error finding says in moveto element");
        }
      }
    });

    it(`lot: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-column > ul > li:nth-child(7) > span:nth-child(2)";
          if ((await page.$(css)) != null) {
            const lots = await page.$eval(css, (el) => el.textContent);
            const formattedLots = lots.trim().replace(",", "");
            line += `,${formattedLots}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.log("Error finding lot element");
        }
      }
    });

    it(`lot unit: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-column > ul > li:nth-child(7) > span:nth-child(1)";
          if ((await page.$(css)) != null) {
            const lotsUnits = await page.$eval(css, (el) => el.textContent);
            const formattedLotsUnits = lotsUnits.replace("Lot", "").trim();
            line += `,${formattedLotsUnits}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding lot unit element");
        }
      }
    });

    it(`year: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-column > ul > li:nth-child(9)";
          if ((await page.$(css)) != null) {
            const year = await page.$eval(css, (el) => el.textContent);
            const formattedYears = year.replace("Year Built", "").trim();
            line += `,${formattedYears}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding year element");
        }
      }
    });

    it(`hoa: ${url}`, async () => {
      if (!flag) {
        try {
          const css = ".dpp-column > ul > li:nth-child(8)";
          if ((await page.$(css)) != null) {
            const hoa = await page.$eval(css, (el) => el.textContent);
            const formattedHoa = hoa
              .replace("HOA Fees", "")
              .substr(3)
              .replace("/month", "")
              .trim();
            line += `,${formattedHoa}`;
          } else {
            line += `,`;
          }
        } catch (error) {
          console.error("Error finding hoa element");
        }
      }
    });

    it(`open house: ${url}`, async () => {
      if (!flag) {
        const css = "#dppTags > .openhouse";
        try {
          if ((await page.$(css)) == null) {
            line += `, `;
          } else {
            const open = await page.$eval(css, (el) => el.textContent);
            line += `,${open}`;
          }
        } catch (error) {
          line += `, `;
          console.error("Error finding open house element");
        }
      }
    });
  });

  link += 1;
} while (link < links.length);
