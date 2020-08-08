#!/usr/bin/env node
const d3 = require("d3");
const jsdom = require("jsdom");
const fs = require("fs");
const { argv } = require("yargs");

const sampleData = require("./sample_data");
const groupData = require("./group_data");

function generateChartSvg() {
  const { JSDOM } = jsdom;
  const zip = argv.zip || 28685;
  const path = `./data/${zip}`;
  const constant = fs.readFileSync(`./data/${zip}/pages.json`);
  const sample = sampleData(JSON.parse(constant));

  const { document } = new JSDOM("").window;
  global.document = document;

  const body = d3.select(document).select("body");
  const config = {
    f: d3.format(".1f"),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    width: 900,
    height: 75,
    barHeight: 25,
    colors: ["#d17905", "#f4c63d", "#f05b4f", "#d70206"],
    ...sample,
  };
  const { f, margin, width, height, barHeight, colors } = config;
  const w = width - margin.left - margin.right;
  const h = height - margin.top - margin.bottom;
  const halfBarHeight = barHeight / 2;

  const total = d3.sum(sample, (d) => d.value);
  const data = groupData(sample, total);

  const xScale = d3.scaleLinear().domain([0, total]).range([0, w]);

  const svg = body.append("svg").attr("width", width).attr("height", height);

  // stack rect for each data value
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "rect-stacked")
    .attr("x", (d) => xScale(d.cumulative))
    .attr("y", h / 2 - halfBarHeight)
    .attr("height", barHeight)
    .attr("width", (d) => xScale(d.value))
    .style("fill", (d, i) => colors[i]);

  // add values on bar
  svg
    .selectAll(".text-value")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "text-value")
    .attr("text-anchor", "middle")
    .attr("x", (d) => xScale(d.cumulative) + xScale(d.value) / 2)
    .attr("y", h / 2 + 5)
    .text((d) => d.value);

  // add some labels for percentages
  svg
    .selectAll(".text-percent")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "text-percent")
    .attr("text-anchor", "middle")
    .attr("x", (d) => xScale(d.cumulative) + xScale(d.value) / 2)
    .attr("y", h / 2 - halfBarHeight * 1.1)
    .text((d) => `${f(d.percent)} %`);

  // add the labels
  svg
    .selectAll(".text-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "text-label")
    .attr("text-anchor", "middle")
    .attr("x", (d) => xScale(d.cumulative) + xScale(d.value) / 2)
    .attr("y", h / 2 + halfBarHeight * 1.1 + 20)
    .style("fill", (d, i) => colors[i])
    .text((d) => d.label);

  svg
    // Solve the namespace issue (xmlns and xlink)
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

  fs.writeFileSync(`${path}/chart.svg`, body.node().innerHTML);
}

generateChartSvg();
