const BrDetailScrapper = require("./brn-scrapper");
const PromiseQueue = require("promise-queue");

const express = require("express");
const app = express();

const MAX_CONCURRENCY = 1;
const requestQueue = new PromiseQueue(MAX_CONCURRENCY);

const brDetialScrapper = new BrDetailScrapper();

brDetialScrapper.initialize().then(() => {
  app.listen(8000, () => {
    console.log("Server listening on port 8000");
  });
});

app.use("/app", express.static("public"));
app.get("/:brn", async (req, res, next) => {
  const brnDetail = await requestQueue.add(() =>
    brDetialScrapper.getBrDetail(req.params.brn)
  );
  res.send(brnDetail);
});
