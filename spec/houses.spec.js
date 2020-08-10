const { argv } = require("yargs");
const {
  writeFileSync,
  readFileSync,
  mkdirSync,
  existsSync,
  appendFileSync,
} = require("fs");
const { chromium } = require("playwright");
const { delay } = require("./utils");
const { MAX_PRICE, DEFAULT_ZIP, BATHS, BEDS } = require("./defaults");

const maxPrice = argv.maxprice || MAX_PRICE;
const zip = argv.zip || DEFAULT_ZIP;
const bedsMinimum = argv.beds || BEDS;
const bathsMinimum = argv.baths || BATHS;

const linksFile = readFileSync(`./data/${zip}/links.json`);
const links = JSON.parse(linksFile);
const path = `./data/${zip}/details.csv`;
const header =
  "Status,Price,Est.,Min.,Max.,Reduced,Address,Bed,Bath,Size,Value,Days,Lot,Unit,Year,HOA,Open,Link\n";
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
        const css = "css=header .icon-property-single-family";
        if ((await page.$(css)) == null) {
          flag = true;
        } else {
          console.info("Flag: Not a single family house");
        }
      } catch (error) {
        console.error(error.message);
      }
    });

    it(`status: ${url}`, async () => {
      if (!flag) {
        const css = "css=header .text";
        try {
          if ((await page.$(css)) != null) {
            const status = await page.$eval(css, (el) => el.textContent);
            line += status;
          } else {
            console.info("Error: status not found");
            line += ",";
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`price: ${url}`, async () => {
      if (!flag) {
        const css = "div.title.dpp-price";
        try {
          if ((await page.$(css)) != null) {
            const price = await page.$eval(css, (el) => el.textContent);
            const formattedPrice = price
              .trim()
              .substr(1)
              .replace(",", "")
              .replace(",", "");
            flag = formattedPrice > maxPrice;
            line += `,${formattedPrice}`;
          } else {
            console.info("Error: price not found");
            line += ",";
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`estimated: ${url}`, async () => {
      if (!flag) {
        const css = "css=div div.dpp-estprice-panel > div > div.text-green";
        try {
          if ((await page.$(css)) == null) {
            line += `,`;
            console.error("Error finding estimated price");
          } else {
            const estimated = await page.$eval(css, (el) => el.textContent);
            const formattedEstimated = estimated
              .trim()
              .substr(1)
              .replace(",", "")
              .replace(",", "");
            line += `,${formattedEstimated}`;
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`price min and max estimate: ${url}`, async () => {
      if (!flag) {
        const css = "css=div div.dpp-estprice-panel > div > b";
        try {
          if ((await page.$(css)) != null) {
            const range = await page.$eval(css, (el) => el.textContent);
            const temp = range.trim().split("-");
            const min = temp[0]
              .trim()
              .substr(1)
              .replace(",", "")
              .replace("K", "000");
            const max = temp[1]
              .trim()
              .substr(1)
              .replace(",", "")
              .replace("K", "000");
            line += `,${min}`;
            line += `,${max}`;
          } else {
            line += `,`;
            line += `,`;
            console.info("Error finding min/max estimated price");
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`reduced: ${url}`, async () => {
      if (!flag) {
        const css = "css=header .f6";

        try {
          if ((await page.$(css)) == null) {
            line += `,`;
            console.info("No price reduction for this property");
          } else {
            const reduced = await page.$eval(css, (el) => el.textContent);

            const formattedReduced = reduced
              .trim()
              .substr(1)
              .replace("K", "000")
              .trim();

            line += `,${formattedReduced}`;
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`address: ${url}`, async () => {
      if (!flag) {
        try {
          const css = "css=header div.title";
          if ((await page.$(css)) != null) {
            const address = await page.$eval(css, (el) => el.textContent);
            line += `,${address.trim()}`;
          } else {
            line += `,`;
            console.info("Error finding address element");
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`beds: ${url}`, async () => {
      if (!flag) {
        try {
          const css = "css=header .dpp-basic > div:nth-child(1) > b";
          if ((await page.$(css)) != null) {
            const beds = await page.$eval(css, (el) => el.textContent);
            const formattedBeds = beds.trim();
            flag = beds < bedsMinimum;
            line += `,${formattedBeds}`;
          } else {
            line += `,`;
            console.info("Error finding beds element");
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`baths: ${url}`, async () => {
      if (!flag) {
        try {
          const css =
            "css=header #dppHeader > div > div.sub > div > div:nth-child(2) > b";
          if ((await page.$(css)) != null) {
            const baths = await page.$eval(css, (el) => el.textContent);
            const formattedBaths = baths.trim();
            flag = baths < bathsMinimum;
            line += `,${formattedBaths}`;
          } else {
            line += `,`;
            console.info("Error finding baths element");
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`size in sqft: ${url}`, async () => {
      if (!flag) {
        try {
          const css =
            "css=header #dppHeader > div > div.sub > div > div:nth-child(3) > b";
          if ((await page.$(css)) !== null) {
            const size = await page.$eval(css, (el) => el.textContent);
            const formattedSize = size.trim().replace(",", "");
            line += `,${formattedSize}`;
          } else {
            line += `,`;
            console.info("Error finding size in Sqft");
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });

    it(`value per a Sqft: ${url}`, async () => {
      let value = ",";

      if (!flag) {
        const count = await page.$$(".dpp-column > ul > li");

        for (let i = 1; i < count.length; i += 1) {
          const css = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(1)`;
          const heading = await page.$eval(css, (el) => el.textContent);
          if (heading.startsWith("Home Value")) {
            try {
              const span = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(2)`;
              if ((await page.$(span)) != null) {
                const text = await page.$eval(span, (el) => el.textContent);
                const formattedValue = text.substr(1).replace("/Sqft", "");
                value = `,${formattedValue}`;
              } else {
                console.info("Error finding price per a Sqft element");
              }
            } catch (error) {
              console.error(error.message);
            }
          }
        }
      }

      line += value;
    });

    it(`days in moveto: ${url}`, async () => {
      let days = ",";

      if (!flag) {
        const count = await page.$$(".dpp-column > ul > li");

        for (let i = 1; i < count.length; i += 1) {
          const css = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(1)`;
          const heading = await page.$eval(css, (el) => el.textContent);
          if (heading.startsWith("Days On Movoto")) {
            try {
              const span = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(2)`;
              if ((await page.$(span)) != null) {
                const value = await page.$eval(span, (el) => el.textContent);
                days = `,${value.trim()}`;
              } else {
                console.info("Error finding Days On Movoto element");
              }
            } catch (error) {
              console.error(error.message);
            }
          }
        }
      }

      line += days;
    });

    it(`lot: ${url}`, async () => {
      let lotSize = ",";
      let sizeUnit = ",";

      if (!flag) {
        const count = await page.$$(".dpp-column > ul > li");

        for (let i = 1; i < count.length; i += 1) {
          const css = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(1)`;
          const heading = await page.$eval(css, (el) => el.textContent);
          if (heading.startsWith("Lot")) {
            const parts = heading.split(" ");

            try {
              const span = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(2)`;
              if ((await page.$(span)) != null) {
                const value = await page.$eval(span, (el) => el.textContent);
                const formattedValue = value
                  .trim()
                  .replace(",", "")
                  .replace(",", "");
                lotSize = `,${formattedValue}`;
                sizeUnit = `,${parts[1]}`;
              } else {
                console.info("Error finding lot size element");
              }
            } catch (error) {
              console.error(error.message);
            }
          }
        }

        line += lotSize;
        line += sizeUnit;
      }
    });

    it(`year: ${url}`, async () => {
      let year = ",";

      if (!flag) {
        const count = await page.$$(".dpp-column > ul > li");

        for (let i = 1; i < count.length; i += 1) {
          const css = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(1)`;
          const heading = await page.$eval(css, (el) => el.textContent);

          if (heading.includes("Year")) {
            try {
              const span = `.dpp-column > ul > li:nth-child(${i})`;
              if ((await page.$(span)) != null) {
                const text = await page.$eval(span, (el) => el.textContent);
                const formattedYear = text.replace("Year Built", "").trim();
                year = `,${formattedYear}`;
              } else {
                console.info("Error finding Year Built element ", i);
              }
            } catch (error) {
              console.error(error.message);
            }
          }
        }
      }

      line += year;
    });

    it(`hoa: ${url}`, async () => {
      let hoaFee = ",";

      if (!flag) {
        const count = await page.$$(".dpp-column > ul > li");

        for (let i = 1; i < count.length; i += 1) {
          const css = `.dpp-column > ul > li:nth-child(${i}) > span:nth-child(1)`;
          const heading = await page.$eval(css, (el) => el.textContent);
          if (heading.includes("HOA")) {
            try {
              const span = `.dpp-column > ul > li:nth-child(${i})`;
              if ((await page.$(span)) != null) {
                const hoa = await page.$eval(span, (el) => el.textContent);
                const formattedHoa = hoa
                  .replace("HOA Fees", "")
                  .trim()
                  .substr(1)
                  .replace("/month", "")
                  .trim();
                hoaFee = `,${formattedHoa}`;
              } else {
                console.info("Error finding HOA Fees element");
              }
            } catch (error) {
              console.error(error.message);
            }
          }
        }
      }

      line += hoaFee;
    });

    it(`open house: ${url}`, async () => {
      if (!flag) {
        const css = "css=div #dppTags > .openhouse";
        try {
          if ((await page.$(css)) == null) {
            line += `, `;
            console.info("Error finding open house element");
          } else {
            const open = await page.$eval(css, (el) => el.textContent);
            line += `,${open}`;
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    });
  });

  link += 1;
} while (link < links.length);
