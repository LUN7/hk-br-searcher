const BrnScrapper = require("./brnScrapper");

const TEST_CASES = [
  [
    "69387986",
    {
      "Business Registration No. of your target business": "69387986",
      "Branch No.": "Main Business",
      "Type of Document Applied":
        "(A) Electronic extract of information on the Business Register",
      "Company Name (Chinese)": "三一餃子有限公司",
      "Company Name (English)": "TRINITY DUMPLING COMPANY LIMITED",
      "Document Fee Payable": "HK$ 27.00",
      "Total Amount payable": "HK$ 27.00",
    },
  ],
];
const BrDetailOf69387986 = describe("BrnScrapper basic test", () => {
  const brnScrapper = new BrnScrapper();

  describe("initialize", () => {
    it("should reovle", (done) => {
      brnScrapper.initialize.then(done);
    });
  });

  describe("scrap Brn: 69387986", () => {
    const INPUT = TEST_CASES[0][0];
    const EXPECTED_OUTPUT = TEST_CASES[0][1];
    brnScrapper.getBrDetail(INPUT).then((data) => {
      expect(data.toEqual(EXPECTED_OUTPUT));
    });
  });

  describe("destroy", (done) => {
    brnScrapper.destroy().then(() => done);
  });
});
