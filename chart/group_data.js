const d3 = require("d3");

function groupData(data, total) {
  const percent = d3.scaleLinear().domain([0, total]).range([0, 100]);
  let cumulative = 0;
  return data
    .map((d) => {
      cumulative += d.value;
      return {
        value: d.value,
        cumulative: cumulative - d.value,
        label: d.label,
        percent: percent(d.value),
      };
    })
    .filter((d) => d.value > 0);
}

module.exports = groupData;
