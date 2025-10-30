const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({}, { strict: false, timestamps: true });

module.exports = mongoose.model("User", UserSchema);
