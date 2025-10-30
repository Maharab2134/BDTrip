const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DestinationBookingSchema = new Schema(
  {},
  { strict: false, timestamps: true }
);

module.exports = mongoose.model("DestinationBooking", DestinationBookingSchema);
