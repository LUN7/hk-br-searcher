const puppeteer = require("puppeteer");
const { waitForPopUp, parse2DArrToObject } = require("./util");

const ENTRY_PAGE =
  "https://www.gov.hk/en/residents/taxes/etax/services/brn_enquiry.htm";

const QUERY_SELECTORS = {
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

const PAGE_INDEX = {
  ENTRY: 0,
  BRIEF: 1,
  STEP_1: 2,
  STEP_2: 3,
  STEP_3: 4,
  STEP_4: 5,
};

const DEFAULT_OPTIONS = {
  puppeteer: {
    headless: true,
    args: ["--disable-gpu", "--no-sandbox"],
  },
};

exports = class BrDetailScrapper {
  constructor(options = {}) {
    this.bowser = null;
    this.page = null;
    this.frame = null;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.currentPageIndex = null;
  }

  async _getPageElement(selector) {
    return await this.page.waitForSelector(selector);
  }

  async _getFrameElement(selector) {
    return await this.frame.waitForSelector(selector);
  }

  async _delay(t) {
    return await this.page.waitForTimeout(t);
  }

  async _waitForPopUp() {
    return await waitForPopUp(this.browser);
  }

  async _waitUntiFrameNaivated() {
    return await this.frame.waitForNavigation();
  }

  async _goToEntryPage() {
    await this.page.goto(ENTRY_PAGE);
    this.currentPageIndex = PAGE_INDEX.ENTRY_PAGE;
  }

  async _goToBriefPage() {
    if (this.currentPageIndex !== PAGE_INDEX.ENTRY_PAGE) {
      throw new Error("cannot navgiate to brief page outside entry page");
    }

    const enquiryButton = await this._getPageElement(
      QUERY_SELECTORS.ENTRY_PAGE.ENQUIRY_BUTTON
    );

    const popUpPromise = this._waitForPopUp();
    await enquiryButton.click();
    this.page = await popUpPromise;

    const innerFrame = await this._getPageElement(
      QUERY_SELECTORS.BRIEF_PAGE.FRAME_DOCUMENT
    );

    this.frame = await innerFrame.contentFrame();
    this.currentPageIndex = PAGE_INDEX.BRIEF;
  }

  async _goToStep1Page() {
    if (this.currentPageIndex !== PAGE_INDEX.BRIEF) {
      throw new Error("cannot navgiate to step 1 page outside brief page");
    }

    const beginButton = await this._getFrameElement(
      QUERY_SELECTORS.BRIEF_PAGE.BEGIN_BUTTON
    );

    await this._delay(500);
    await beginButton.click();
    await this._waitUntiFrameNaivated();
    this.currentPageIndex = PAGE_INDEX.STEP_1;
  }

  async _goToStep2Page() {
    if (this.currentPageIndex !== PAGE_INDEX.STEP_1) {
      throw new Error("cannot navgiate to step 2 page outside step 1 page");
    }

    const readAndProceedButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_1.READ_AND_PROCEED_BUTTON
    );
    this._delay(500);

    readAndProceedButton.click();
    await this._waitUntiFrameNaivated();
    this.currentPageIndex = PAGE_INDEX.STEP_2;
  }

  async _goToStep3Page() {
    if (this.currentPageIndex !== PAGE_INDEX.STEP_2) {
      throw new Error("cannot navgiate to step 3 page outside step 2 page");
    }
    const applyRadioButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_2.APPLY_FOR_SUPPLY_RADIO_BUTTON
    );
    await this._delay(500);
    await applyRadioButton.click();

    const continueButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_2.CONTINUE_BUTTON
    );
    await this._delay(500);
    continueButton.click();
    await this._waitUntiFrameNaivated();
    this.currentPageIndex = PAGE_INDEX.STEP_3;
  }

  async _fillStep3Page(brn) {
    if (this.currentPageIndex !== PAGE_INDEX.STEP_3) {
      throw new Error("cannot fill in brn information outside step 3 page");
    }
    const businessRegistrationNumberInput = await this._getFrameElement(
      QUERY_SELECTORS.STEP_3.BRN_INPUT
    );
    const branceNumberInput = await this._getFrameElement(
      QUERY_SELECTORS.STEP_3.BN_INPUT
    );
    const extractElectronicInfoRadioButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_3.EXTRACT_ELECTRONIC_INFO_RADIO_BUTTON
    );

    this._delay(500);
    await businessRegistrationNumberInput.type(brn);
    await branceNumberInput.type("000");
    await extractElectronicInfoRadioButton.click();
  }

  async _goToStep4Page() {
    if (this.currentPageIndex !== PAGE_INDEX.STEP_3) {
      throw new Error("cannot fill in brn information outside step 3 page");
    }
    const continueButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_3.CONTINUE_BUTTON
    );

    await continueButton.click();
    await this._waitUntiFrameNaivated();
    this.currentPageIndex = PAGE_INDEX.STEP_4;
  }

  async _extractBrnDetailFromStep4Page() {
    if (this.currentPageIndex !== PAGE_INDEX.STEP_4) {
      throw new Error("cannot extract Brn detail outside step 3 page");
    }
    const dataTable = await this._getFrameElement(
      QUERY_SELECTORS.STEP_4.TARGET_DATA_TBODY
    );
    const cancelButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_4.CANCEL_BUTTON
    );
    const data = await dataTable.$$eval("tr", (tableRows) =>
      tableRows.map((row) =>
        [...row.children].map((column) => column.textContent.trim())
      )
    );
    return parse2DArrToObject(data);
  }

  async _goBackToStep3Page() {
    if (this.currentPageIndex !== PAGE_INDEX.STEP_4) {
      throw new Error("cannot go back to step 3 page outside step 4 page");
    }
    const cancelButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_4.CANCEL_BUTTON
    );

    await cancelButton.click();
    await this._waitUntiFrameNaivated();

    const submitAnotherApplicationButton = await this._getFrameElement(
      QUERY_SELECTORS.STEP_4.SUBMIT_ANOTHER_APPLICATION_BUTTON
    );
    await this._delay(500);
    await submitAnotherApplicationButton.click();
    this.currentPageIndex = PAGE_INDEX.STEP_3;
    return;
  }

  async initialize() {
    this.browser = await puppeteer.launch(this.options.puppeteer);
    this.page = (await this.browser.pages())[0];
    await this._goToEntryPage();
    await this._goToBriefPage();
    await this._goToStep1Page();
    await this._goToStep2Page();
    await this._goToStep3Page();
  }

  async getBrDetail(brn) {
    if (!brn) {
      throw new Error("brn cannot be blank");
    }
    await this._fillStep3Page(brn);
    await this._goToStep4Page();
    const result = await this._extractBrnDetailFromStep4Page();
    await this._goBackToStep3Page();
    return result;
  }

  async destroy() {
    return await this.browser.close();
  }
};

module.exports = exports;
