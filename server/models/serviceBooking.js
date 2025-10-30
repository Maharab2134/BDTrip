const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceBookingSchema = new Schema(
  {},
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("ServiceBooking", ServiceBookingSchema);
