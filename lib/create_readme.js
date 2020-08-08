const { readFileSync, writeFileSync, readdirSync } = require("fs");
const moment = require("moment");
const zipcodes = require("zipcodes");

const zips = readdirSync("./data");

(async () => {
  let readme = `# moveto\nExtract RTP listing data from moveto.com.\n
  Default: Maximum price: _500,000_, Zip: _28685_, Beds: _3_, Baths: _2_ \n
  Change the default as shown [here](https://github.com/xgirma/moveto/blob/master/HOWTO.md)`;

  for (const zip of zips) {
    const { state, city } = zipcodes.lookup(zip);
    const constantsFile = readFileSync(`./data/${zip}/pages.json`);
    const constants = JSON.parse(constantsFile);
    const chart = `https://github.com/xgirma/moveto/blob/master/data/${zip}/chart.png`;
    const date = moment(constants.date, "MMMM Do YYYY, h:mm:ss a").format(
      "MMM Do YYYY"
    );

    /* eslint-disable */
      const dataPerZip = `
## ${constants.city}, ${constants.zip}, ${constants.state} - ${date} \n 
![${city}, ${zip}, ${state} :](https://github.com/xgirma/moveto/workflows/${city},%20${zip},%20${state}%20:/badge.svg)

![Alt text](${chart} | width=100)

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
    const url = "https://github.com/xgirma/moveto/blob/master/data";

    const comingSoon = `[Coming soon](${url}/${zip}/coming_soon.csv)`;
    const listedToday = `[Listed today](${url}/${zip}/listed_today.csv)`;
    const priceReduced = `[Price Reduced](${url}/${zip}/price_reduced.csv)`;
    const forSale = `[For sale](${url}/${zip}/for_sale.csv)`;
    const openHouse = `[Open house](${url}/${zip}/open_house.csv)`;

    const byPrice = `[Sorted by price](${url}/${zip}/by_price.csv)`;
    const bySize = `[Sorted by size](${url}/${zip}/by_size.csv)`;
    const byYear = `[Sorted by year built](${url}/${zip}/by_year.csv)`;
    const byDays = `[Sorted by days listed](${url}/${zip}/by_days.csv)`;

    const pending = `[Sale pending](${url}/${zip}/sale_pending.csv)`;
    const contract = `[In contract](${url}/${zip}/in_contract.csv)`;

    readme += `${comingSoon} | ${listedToday} | ${priceReduced} | ${forSale} | ${openHouse} | ${byPrice} | ${bySize} | ${byYear} | ${byDays} | ${pending} | ${contract}`;
  }

  try {
    writeFileSync("./README.md", readme, "utf8");
  } catch (error) {
    console.log(`Error generating README.md`);
  }
})();
