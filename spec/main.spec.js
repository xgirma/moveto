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
        console.log(`i: `, i);
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        const url = links[i];
        let flag = false;
        const detail = [];

        beforeAll(async () => {
            browser = process.env.GITHUB_ACTIONS
                ? await chromium.launch()
                : await chromium.launch({
                    headless: false
                });
            page = await browser.newPage();

            await page
                .goto(url, {
                    timeout: 4500,
                    waitUntil: "networkidle",
                })
                .catch(() => {
                });
        });

        afterAll(() => {
            if (!page.isClosed()) {
                browser.close();
            }
            details.push(detail);
        });

        afterEach(async () => {
            await delay(1000);
        });

        it('single family home?', async () => {
            try {
                flag = await page.$('.icon-property-single-family') == null;
            } catch (error) {
                console.error('Error: when querying for .icon-property-single-family element')
            }
        });

        it("status", async () => {
            if(flag) {
                const status = await page.$eval("#dppHeader > div > div.sup > span.text", el => el.textContent);
                detail.push(status);
            }
        });
    });

    if(links.length === 1 || ((i-1)+1) === links.length){
        console.log('details: ', details, ' ', i, ' ', links.length);
    }
}
