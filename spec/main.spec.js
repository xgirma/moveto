const {argv} = require("yargs");
const {writeFileSync, readFileSync, mkdirSync, existsSync} = require("fs");
const {delay} = require("./utils");
const {chromium} = require("playwright");
const assert = require("assert");

const zip = argv.zip || "27560";
const linksFile = readFileSync(`./data/${zip}/links.json`);
const links = JSON.parse(linksFile);

let page;
let browser;
const details = [];

for (let i = 0; i < links.length; i++) {
    describe("main", () => {
        const url = links[i];
        let flag = false;
        const detail = [];

        beforeAll(async () => {
            browser = process.env.GITHUB_ACTIONS
                ? await chromium.launch()
                : await chromium.launch({
                    headless: false,
                    logger: {
                      isEnabled: (name, severity) => name === 'browser',
                      log: (name, severity, message, args) => console.log(`${name} ${message}`)
                    }
                });
            page = await browser.newPage();

            await page
                .goto(url, {
                    waitUntil: "networkidle0",
                })
                .catch(() => {
                });
        }, 20000);

        afterAll(() => {
            if (!page.isClosed()) {
                browser.close();
            }
            details.push(detail);
        });

        afterEach(async () => {
            await delay(60000);
        });

        it('should be single family home only', () => {
            try {
                if(page.$('.icon-property-single-family') == null){
                    flag = true;
                }
            } catch (error) {
                console.error('Error: when querying for .icon-property-single-family element')
            }
        });

        it("status", async () => {
            if(!flag) {
                const status = await page.$eval("#dppHeader > div > div.sup > span.text", el => el.textContent);
                detail.push(status);
            }
        });
    });
}

console.log(details);
