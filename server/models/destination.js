const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DestinationSchema = new Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model("Destination", DestinationSchema);
