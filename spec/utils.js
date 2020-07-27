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

module.exports = { delay, sortObject };
