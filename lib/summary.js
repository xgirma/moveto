const { readFileSync, writeFileSync, readdirSync } = require("fs");

const csv = require("csvtojson");
const { sortObject } = require("../spec/utils");

const zips = readdirSync("./data");

(async () => {
  for (const zip of zips) {
    const constantsFile = readFileSync(`./data/${zip}/constants.json`);
    const constants = JSON.parse(constantsFile);

    const comingSoon = `./data/${zip}/coming_soon.csv`;
    const details = `./data/${zip}/details.csv`;
    const forSale = `./data/${zip}/for_sale.csv`;
    const inContract = `./data/${zip}/in_contract.csv`;
    const openHouse = `./data/${zip}/open_house.csv`;
    const priceReduced = `./data/${zip}/price_reduced.csv`;
    const salePending = `./data/${zip}/sale_pending.csv`;

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

    const path = `./data/${zip}/constants.json`;
    const update = JSON.stringify(sortObject(constants), null, 2);
    writeFileSync(path, update, "utf8");
  }
})();
