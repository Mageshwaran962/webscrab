const { MongoClient } = require("mongodb");
require("dotenv").config();
const mongo = {
  source: null,
  fitment: null,
  product: null,

  async connect() {
    try {
      console.log("sssss", process.env.MONGODB_URL);
      const client = new MongoClient(process.env.MONGODB_URL);

      await client.connect();
      console.log(
        `Mongo DB Connected Successfully - ${process.env.MONGODB_URL}`
      );

      const db = await client.db(process.env.MONGODB_NAME);
      console.log(`Selected Database - ${process.env.MONGODB_NAME}`);

      this.source = db.collection("source");
      this.fitment = db.collection("fitment");
      this.product = db.collection("product");
    } catch (err) {
      console.error("Error Connecting to MongoDB");
    }
  },
};

module.exports = mongo;
