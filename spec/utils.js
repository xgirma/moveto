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

function sortDescending(data, column) {
  return data.sort((a, b) => {
    return parseInt(b[column], 10) - parseInt(a[column], 10);
  });
}

function sortAscending(data, column) {
  return data.sort((a, b) => {
    return parseInt(a[column], 10) - parseInt(b[column], 10);
  });
}

module.exports = { delay, sortObject, sortAscending, sortDescending };
