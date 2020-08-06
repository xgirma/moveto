const { readFileSync, writeFileSync, readdirSync } = require("fs");
const moment = require("moment");

const zips = readdirSync("./data");

(async () => {
  let readme = `# moveto\nExtract RTP listing data from moveto.com.\n
  Default: Maximum price: _500,000_, Zip: _28685_, Beds: _3_, Baths: _2_ \n
  Change the default as shown [here](https://github.com/xgirma/moveto/blob/master/HOWTO.md)`;

  for (const zip of zips) {
    const constantsFile = readFileSync(`./data/${zip}/pages.json`);
    const constants = JSON.parse(constantsFile);
    const date = moment(constants.date, "MMMM Do YYYY, h:mm:ss a").format(
      "MMM Do YYYY"
    );

    /* eslint-disable */
      const dataPerZip = `
## ${constants.city}, ${constants.zip}, ${constants.state} - ${date}
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

    const comingSoon = `[Coming soon](https://github.com/xgirma/moveto/blob/master/data/${zip}/coming_soon.csv)`;
    const listedToday = `[Listed today](https://github.com/xgirma/moveto/blob/master/data/${zip}/listed_today.csv)`;
    const priceReduced = `[Price Reduced](https://github.com/xgirma/moveto/blob/master/data/${zip}/price_reduced.csv)`;
    const forSale = `[For sale](https://github.com/xgirma/moveto/blob/master/data/${zip}/for_sale.csv)`;
    const openHouse = `[Open house](https://github.com/xgirma/moveto/blob/master/data/${zip}/open_house.csv)`;

    const byPrice = `[Sorted by price](https://github.com/xgirma/moveto/blob/master/data/${zip}/by_price.csv)`;
    const bySize = `[Sorted by size](https://github.com/xgirma/moveto/blob/master/data/${zip}/by_size.csv)`;
    const byYear = `[Sorted by year built](https://github.com/xgirma/moveto/blob/master/data/${zip}/by_year.csv)`;
    const byDays = `[Sorted by days listed](https://github.com/xgirma/moveto/blob/master/data/${zip}/by_days.csv)`;

    const pending = `[Sale pending](https://github.com/xgirma/moveto/blob/master/data/${zip}/sale_pending.csv)`;
    const contract = `[In contract](https://github.com/xgirma/moveto/blob/master/data/${zip}/in_contract.csv)`;

    readme += `${comingSoon} | ${listedToday} | ${priceReduced} | ${forSale} | ${openHouse} | ${byPrice} | ${bySize} | ${byYear} | ${byDays} | ${pending} | ${contract}`;
  }

  try {
    writeFileSync("./README.md", readme, "utf8");
  } catch (error) {
    console.log(`Error generating README.md`);
  }
})();
