exports.parse2DArrToObject = function (arr) {
  const reducer = (accumulator, currentValue) => {
    accumulator[currentValue[0]] = currentValue[1];
    return accumulator;
  };
  return arr.reduce(reducer, {});
};

module.exports = exports;
