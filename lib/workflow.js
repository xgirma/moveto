const { writeFileSync, readdirSync } = require("fs");
const { safeDump } = require("js-yaml");

const zips = readdirSync("./data");

(async () => {
  zips.forEach((zip, index) => {
    const cron = `0 ${index * 4} * * *`; // TODO reset index after 6 zip
    const workflow = {
      name: `${zip}`,
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
              name: "generate constants",
              run: `npm run constants -- --zip=${zip}`,
            },
            {
              name: "generate list",
              run: `npm run list -- --zip=${zip}`,
            },
            {
              name: "generate main",
              if: "always()",
              run: `npm run main -- --zip=${zip}`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "generate details",
              if: "always()",
              run: `npm run details`,
            },
            {
              name: "sleep for 10s",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "generate for sale",
              run: `npm run forsale`,
            },
            {
              name: "sleep for 10s",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "generate summary",
              run: `npm run summary`,
            },
            {
              name: "sleep for 10s",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by price",
              run: `npm run byprice`,
            },
            {
              name: "sleep for 10s",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by size",
              run: `npm run bysize`,
            },
            {
              name: "sleep for 10s",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by year",
              run: `npm run byyear`,
            },
            {
              name: "sleep for 10s",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "generate README.md",
              run: `npm run readme`,
            },
            {
              name: "git set user.email",
              run: 'git config --global user.email "xgirma@gmail.com"',
            },
            {
              name: "git set user.name",
              run: 'git config --global user.email "Girma Nigusse"',
            },
            {
              name: "git set rebase false",
              run: "git config pull.rebase false",
            },
            {
              name: "git pull",
              run: `git pull`,
            },
            {
              name: "git status",
              run: "git status",
            },
            {
              name: "git add",
              run: "git add --all",
            },
            {
              name: "git commit",
              run: `git commit -am "generate data for ${zip}"`,
            },
            {
              name: "commit data",
              run: "git push",
            },
          ],
        },
      },
    };

    const path = `.github/workflows/${zip}.yml`;
    const yamlWorkFlow = safeDump(workflow);
    try {
      writeFileSync(path, yamlWorkFlow, "utf8");
    } catch (error) {
      console.error(`Faild to generate workflow for ${zip}`);
    }
  });
})();
