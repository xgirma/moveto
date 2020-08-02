const { readFileSync, writeFileSync, readdirSync } = require("fs");

const zips = readdirSync("./data");

(async () => {
  let readme = `# moveto\nExtract RTP listing data from moveto.com`;

  for (const zip of zips) {
    const constantsFile = readFileSync(`./data/${zip}/constants.json`);
    const constants = JSON.parse(constantsFile);

    /* eslint-disable */
      const dataPerZip = `
## ${constants.city}, ${constants.zip}
\`\`\`json
{
  "date": "${constants.date}",
  "listings": ${constants.listings},
  "coming_soon": ${constants.soon},
  "price_reduced": ${constants.reduced},
  "for_sale": ${constants.sale},
  "open_house": ${constants.open},
  "under_contract": ${constants.contract},
  "sale_pending": ${constants.pending},
  "city": "${constants.city}",
  "state": "${constants.state}",
  "zip": ${constants.zip}
}
\`\`\`
`; /* eslint-enable */

    readme += dataPerZip;
  }

  try {
    writeFileSync("./README.md", readme, "utf8");
  } catch (error) {
    console.log(`Error generating README.md`);
  }
})();
