const { model, Schema } = require("mongoose");

const dynamicSchema = Schema({}, { strict: false });
module.exports = model("compatibility", dynamicSchema);
