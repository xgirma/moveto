function sortObject(obj) {
  const keys = Object.keys(obj).sort();
  const newObj = {};
  keys.forEach((key) => {
    newObj[key] = obj[key];
  });
  return newObj;
}

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function sortAscending(data, column) {
  return data.sort((a, b) => {
    return parseInt(b[column], 2) - parseInt(a[column], 2);
  });
}

function sortDescending(data, column) {
  return data.sort((a, b) => {
    return Number(b[column]) - Number(a[column]);
  });
}

module.exports = { delay, sortObject, sortAscending, sortDescending };
