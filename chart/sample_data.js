function sampleData(data) {
  const { soon, sale, pending, contract } = data;
  return [
    { label: "Coming", value: soon },
    { label: "For sale", value: sale },
    { label: "Pending", value: pending },
    { label: "Contract", value: contract },
  ];
}

module.exports = sampleData;
