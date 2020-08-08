const { readFileSync } = require("fs");
const { argv } = require("yargs");
const sharp = require("sharp");

const zip = argv.zip || 28685;
const path = `./data/${zip}`;
const svg = readFileSync(`${path}/chart.svg`);
const png = `${path}/chart.png`;

function svgToPng() {
  sharp(svg)
    .png()
    .toFile(png)
    .then((info) => {
      console.info(info);
    })
    .catch((error) => {
      console.error(error);
    });
}

svgToPng();
