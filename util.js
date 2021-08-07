exports.parse2DArrToObject = function (arr) {
  const reducer = (accumulator, currentValue) => {
    accumulator[currentValue[0]] = currentValue[1];
    return accumulator;
  };
  return arr.reduce(reducer, {});
};

exports.waitForPopUp = async function (browser) {
  return new Promise((resolve, reject) => {
    const handleTargetCreated = (target) => {
      resolve(target.page());
    };
    browser.once("targetcreated", handleTargetCreated);
    setTimeout(() => {
      browser.off("targetcreated", handleTargetCreated);
      reject("timeout");
    }, 10 * 1000);
  });
};

module.exports = exports;
