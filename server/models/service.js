const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model("Service", ServiceSchema);
