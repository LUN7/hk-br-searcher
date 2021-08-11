const BrDetailScrapper = require("./brn-scrapper");
const PromiseQueue = require("promise-queue");

const express = require("express");
const app = express();

const MAX_CONCURRENCY = 1;
const MAX_QUEUE = 2;
const requestQueue = new PromiseQueue(MAX_CONCURRENCY, MAX_QUEUE);

const brDetialScrapper = new BrDetailScrapper();

brDetialScrapper.initialize().then(() => {
  app.listen(8000, () => {
    console.log("Server listening on port 8000");
  });
});

app.use("/app", express.static("public"));
app.get("/:brn", async (req, res, next) => {
  try {
    const queueLength = requestQueue.getQueueLength();
    if (queueLength > 1) {
      return res.send({
        status: "busy",
      });
    }
    const brnDetail = await requestQueue.add(() =>
      brDetialScrapper.getBrDetail(req.params.brn)
    );
    res.send({
      status: "success",
      data: brnDetail,
    });
  } catch (err) {
    res.send({
      status: "fail",
      error: err.message,
    });
  }
});
