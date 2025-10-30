/*
  Simple migration script that reads project-root db.json and inserts data into MongoDB.

  Usage (from repo root):
    cd server
    npm install
    node migrate.js    # or npm run migrate

  Make sure MongoDB is running and MONGO_URL is set if needed. By default it uses mongodb://127.0.0.1:27017/bdtrip
*/

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://:@cluster0.d8o2jpp.mongodb.net/?appName=Cluster0";

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("[migrate] connected to", MONGO_URL);

  const dbPath = path.join(__dirname, "..", "db.json");
  if (!fs.existsSync(dbPath)) {
    console.error("[migrate] db.json not found at", dbPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(dbPath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("[migrate] failed to parse db.json", err);
    process.exit(1);
  }

  const models = {
    services: require("./models/service"),
    destinations: require("./models/destination"),
    users: require("./models/user"),
    serviceBookings: require("./models/serviceBooking"),
    destinationBookings: require("./models/destinationBooking"),
    admin: require("./models/admin"),
  };

  for (const [key, arr] of Object.entries(parsed)) {
    if (!Array.isArray(arr)) continue;
    const Model = models[key];
    if (!Model) {
      console.log(`[migrate] skipping collection ${key} (no model)`);
      continue;
    }

    const docs = arr.map((doc) => {
      const copy = Object.assign({}, doc);
      // preserve original id in legacyId, remove id to avoid collisions with Mongo _id
      if (copy.id !== undefined) {
        copy.legacyId = copy.id;
        delete copy.id;
      }
      return copy;
    });

    try {
      console.log(`[migrate] importing ${docs.length} docs into ${key} ...`);
      await Model.insertMany(docs, { ordered: false });
      console.log(`[migrate] done ${key}`);
    } catch (err) {
      console.warn(
        `[migrate] warning while inserting ${key}:`,
        err.message || err
      );
    }
  }

  console.log("[migrate] finished.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate] error", err);
  process.exit(1);
});
