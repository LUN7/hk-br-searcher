const puppeteer = require("puppeteer");

const CHROME_EXECUTE_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ENTRY_PAGE =
  "https://www.gov.hk/en/residents/taxes/etax/services/brn_enquiry.htm";

const PAGE_SELECTORS = {
  ENTRY_PAGE: {
    ENQUIRY_BUTTON: "[data-eserviceid=IRD-0005-S]",
  },
  BRIEF_PAGE: {
    FRAME_DOCUMENT: "frameset > frame",
    BEGIN_BUTTON: "#buttonArea > .buttonmenubox_R > a",
  },
  STEP_1: {
    READ_AND_PROCEED_BUTTON: "#buttonArea > .buttonmenubox_R > :nth-child(2)",
  },
  STEP_2: {
    APPLY_FOR_SUPPLY_RADIO_BUTTON:
      "#cont_table table tbody > :nth-child(2) > :nth-child(1) > input",
    CONTINUE_BUTTON: "#buttonArea > .buttonmenubox_R > :nth-child(2)",
  },
  STEP_3: {
    BRN_INPUT: "input[name='tbBrn']",
    BN_INPUT: "input[name='tbBn']",
    EXTRACT_ELECTRONIC_INFO_RADIO_BUTTON:
      "#cont_table table tbody > :nth-child(2) > :nth-child(1) > input",
    CONTINUE_BUTTON: "#buttonArea > .buttonmenubox_R > :nth-child(4)",
  },
  STEP_4: {
    TARGET_DATA_TBODY: "#cont_table table tbody",
    CANCEL_BUTTON: "#buttonArea > .buttonmenubox_R > :nth-child(2)",
    SUBMIT_ANOTHER_APPLICATION_BUTTON:
      "#buttonArea > .buttonmenubox_R > :nth-child(2)",
  },
};

async function waitForPopUp(browser) {
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
}

async function fetch() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME_EXECUTE_PATH,
    args: ["--disable-gpu"],
  });
  try {
    const page = (await browser.pages())[0];
    console.log("go to entry page");
    await page.goto(ENTRY_PAGE);
    const enquiryButton = await page.waitForSelector(
      PAGE_SELECTORS.ENTRY_PAGE.ENQUIRY_BUTTON,
      { timeout: 10 * 1000 }
    );
    console.log("got enquiryButton");

    const popUpPromise = waitForPopUp(browser);
    await enquiryButton.click();
    console.log("clicked enquiryButton");
    const popUpPage = await popUpPromise;

    // brief
    console.log("brief page");
    const frame = await popUpPage.waitForSelector(
      PAGE_SELECTORS.BRIEF_PAGE.FRAME_DOCUMENT,
      { timeout: 5 * 1000 }
    );
    const frameContent = await frame.contentFrame();

    const beginButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.BRIEF_PAGE.BEGIN_BUTTON,
      { visible: true, timeout: 5 * 1000 }
    );
    await page.waitForTimeout(500);
    console.log("got begin button");
    await beginButton.click();

    const readAndProcessButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_1.READ_AND_PROCEED_BUTTON
    );
    await page.waitForTimeout(500);
    readAndProcessButton.click();

    const applyRadioButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_2.APPLY_FOR_SUPPLY_RADIO_BUTTON
    );
    await page.waitForTimeout(500);
    applyRadioButton.click();

    const step2ContinueButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_2.CONTINUE_BUTTON
    );
    await page.waitForTimeout(500);
    step2ContinueButton.click();
    await frameContent.waitForNavigation();

    const businessRegistrationNumberInput = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_3.BRN_INPUT
    );
    const branceNumberInput = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_3.BN_INPUT
    );
    const extractElectronicInfoRadioButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_3.EXTRACT_ELECTRONIC_INFO_RADIO_BUTTON
    );
    const continueButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_3.CONTINUE_BUTTON
    );

    await page.waitForTimeout(500);
    await businessRegistrationNumberInput.type("69387986");
    await branceNumberInput.type("000");
    await extractElectronicInfoRadioButton.click();
    await continueButton.click();

    await frameContent.waitForNavigation();
    const dataTable = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_4.TARGET_DATA_TBODY
    );
    const cancelButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_4.CANCEL_BUTTON
    );
    const data = await dataTable.$$eval("tr", (tableRows) =>
      tableRows.map((row) =>
        [...row.children].map((column) => column.textContent.trim())
      )
    );
    await cancelButton.click();

    await frameContent.waitForNavigation();
    const submitAnotherApplicationButton = await frameContent.waitForSelector(
      PAGE_SELECTORS.STEP_4.SUBMIT_ANOTHER_APPLICATION_BUTTON
    );
    await page.waitForTimeout(500);
    await submitAnotherApplicationButton.click();
    // return data;
  } catch (err) {
    console.log({ err });
    await browser.close();
    throw new Error();
  }
}

(async function () {
  while (true) {
    try {
      return await fetch();
    } catch (err) {
      console.log("retry", err);
      continue;
    }
  }
})();
