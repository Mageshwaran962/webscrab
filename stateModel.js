const { model, Schema } = require("mongoose");

const stateSchema = Schema(
  {
    lastScrapedURL: String,
    currentPage: Number,
  },
  { strict: false }
);
module.exports = model("State", stateSchema);
