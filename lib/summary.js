const { readFileSync, writeFileSync } = require("fs");
const { argv } = require("yargs");
const csv = require("csvtojson");

const { sortObject } = require("../spec/utils");
const { DEFAULT_ZIP } = require("../spec/constants");

(async () => {
  const zip = argv.zip || DEFAULT_ZIP;
  const path = `./data/${zip}`;
  let constantsFile;

  try {
    constantsFile = readFileSync(`./data/${zip}/pages.json`);

    const constants = JSON.parse(constantsFile);

    const comingSoon = `${path}/coming_soon.csv`;
    const details = `${path}/details.csv`;
    const forSale = `${path}/for_sale.csv`;
    const inContract = `${path}/in_contract.csv`;
    const openHouse = `${path}/open_house.csv`;
    const priceReduced = `${path}/price_reduced.csv`;
    const salePending = `${path}/sale_pending.csv`;

    const soon = await csv().fromFile(comingSoon);
    const listings = await csv().fromFile(details);
    const sale = await csv().fromFile(forSale);
    const contract = await csv().fromFile(inContract);
    const open = await csv().fromFile(openHouse);
    const reduced = await csv().fromFile(priceReduced);
    const pending = await csv().fromFile(salePending);

    constants.soon = soon.length;
    constants.listings = listings.length;
    constants.sale = sale.length;
    constants.contract = contract.length;
    constants.open = open.length;
    constants.reduced = reduced.length;
    constants.pending = pending.length;

    const location = `./data/${zip}/pages.json`;
    const update = JSON.stringify(sortObject(constants), null, 2);

    writeFileSync(location, update, "utf8");
  } catch (error) {
    console.error(error.message);
  }
})();
