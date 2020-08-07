const { writeFileSync, readdirSync, existsSync, mkdirSync } = require("fs");
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
              name: "generate pages",
              run: `npm run pages -- --zip=${zip}`,
            },
            {
              name: "generate links",
              if: "always()",
              run: `npm run links -- --zip=${zip}`,
            },
            {
              name: "generate houese",
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
              name: "generate classify",
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
              name: "generate for classify:sale",
              if: "always()",
              run: `npm run classify:sale --zip=${zip}`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "generate summary",
              if: "always()",
              run: `npm run summary`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by price",
              if: "always()",
              run: `npm run byprice --zip=${zip}`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by size",
              if: "always()",
              run: `npm run bysize --zip=${zip}`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by year",
              if: "always()",
              run: `npm run byyear --zip=${zip}`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "sort by days",
              if: "always()",
              run: `npm run bydays --zip=${zip}`,
            },
            {
              name: "sleep for 10s",
              if: "always()",
              uses: "juliangruber/sleep-action@v1",
              with: { time: "10s" },
            },
            {
              name: "generate README.md",
              if: "always()",
              run: `npm run readme`,
            },
            {
              name: "git set user.email",
              if: "always()",
              run: 'git config --global user.email "xgirma@gmail.com"',
            },
            {
              name: "git set user.name",
              if: "always()",
              run: 'git config --global user.email "Girma Nigusse"',
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
              run: `git commit -am "generate data for ${zip}"`,
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

    const path = ".github/workflows/";
    const yamlWorkflow = safeDump(workflow);
    try {
      if (!existsSync(path)) {
        mkdirSync(path);
      }
      writeFileSync(`${path}/${zip}.yml`, yamlWorkflow, "utf8");
    } catch (error) {
      console.error(`Faild to generate workflow for ${zip}`);
    }
  });
})();
