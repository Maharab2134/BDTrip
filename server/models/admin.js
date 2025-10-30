const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model("Admin", AdminSchema);
