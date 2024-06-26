const { writeFileSync, readdirSync, existsSync, mkdirSync } = require("fs");
const { safeDump } = require("js-yaml");
const zipcodes = require("zipcodes");
const rimraf = require("rimraf");

const zips = readdirSync("./data");
const path = ".github/workflows/";

(async () => {
  rimraf(`${path}/*`, () => {
    zips.forEach((zip) => {
      if (zip !== "README.md" && zip !== "27824") {
        const { state, city } = zipcodes.lookup(zip);
        const cron = `0 0 */4 * *`;
        const workflow = {
          name: `${city}, ${zip}, ${state} :`,
          on: { schedule: [{ cron }] },
          jobs: {
            build: {
              "runs-on": "macOS-latest",
              steps: [
                { uses: "actions/checkout@v2" },
                {
                  name: "node",
                  uses: "actions/setup-node@v1",
                  with: { "node-version": "12.x" },
                },
                { name: "npm install", run: "npm install", env: { CI: true } },
                { name: "lint", run: "npm run lint --if-present" },
                {
                  name: `count the number of listing pages for ${zip}`,
                  run: `npm run pages -- --zip=${zip}`,
                },
                {
                  name: `scrap links for all listings within ${zip}`,
                  if: "always()",
                  run: `npm run links -- --zip=${zip}`,
                },
                {
                  name: `scrap details for all houses in ${zip}`,
                  if: "always()",
                  run: `npm run houses -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `classify ${zip} data into for sale, coming soon, sale pending, and in contract`,
                  if: "always()",
                  run: `npm run classify -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `classify ${zip} data into price reduced, open house, and listed today`,
                  if: "always()",
                  run: `npm run classify:sale -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `generate summary data for ${zip}`,
                  if: "always()",
                  run: `npm run summary -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "30s" },
                },
                {
                  name: `sort data for ${zip} by price`,
                  if: "always()",
                  run: `npm run byprice -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `sort data for ${zip} by size`,
                  if: "always()",
                  run: `npm run bysize -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `sort data for ${zip} by year`,
                  if: "always()",
                  run: `npm run byyear -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `sort data for ${zip} by days`,
                  if: "always()",
                  run: `npm run bydays -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `generating document for coming soon ${zip}`,
                  if: "always()",
                  run: `npm run doc:coming:soon -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `generating document for listed today ${zip}`,
                  if: "always()",
                  run: `npm run doc:listed:today -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "10s" },
                },
                {
                  name: `plot svg chart for ${zip}`,
                  if: "always()",
                  run: `npm run chart -- --zip=${zip}`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "60s" },
                },
                {
                  name: "generate README.md",
                  if: "always()",
                  run: `npm run readme`,
                },
                {
                  name: "sleep for 10s",
                  if: "always()",
                  uses: "juliangruber/sleep-action@v1",
                  with: { time: "20s" },
                },
                {
                  name: "git set user.email",
                  if: "always()",
                  run: 'git config --global user.email "xgirma@gmail.com"',
                },
                {
                  name: "git set user.name",
                  if: "always()",
                  run: 'git config --global user.name "Girma Nigusse"',
                },
                {
                  name: "git set rebase false",
                  if: "always()",
                  run: "git config pull.rebase false",
                },
                {
                  name: "git pull",
                  if: "always()",
                  run: `git pull`,
                },
                {
                  name: "git status",
                  if: "always()",
                  run: "git status",
                },
                {
                  name: "git add",
                  if: "always()",
                  run: "git add --all",
                },
                {
                  name: "git commit",
                  if: "always()",
                  run: `git commit -am "auto pushed for ${zip}"`,
                },
                {
                  name: "commit data",
                  if: "always()",
                  run: "git push",
                },
              ],
            },
          },
        };

        const yamlWorkflow = safeDump(workflow);
        try {
          if (!existsSync(path)) {
            mkdirSync(path);
          }
          writeFileSync(`${path}/${zip}.yml`, yamlWorkflow, "utf8");
        } catch (error) {
          console.error(`Faild to generate workflow for ${zip}`);
        }
      }
    });
  });
})();
