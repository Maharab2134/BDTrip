const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const chokidar = require("chokidar");

const argv = process.argv.slice(2);
const watch = argv.includes("--watch");
const prune = !argv.includes("--no-prune");

require("dotenv").config({ path: path.join(__dirname, ".env") });
const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://soheleight234_db_user:1jKiWgPdaNkgzZ9Y@cluster0.d8o2jpp.mongodb.net/?appName=Cluster0";

const models = {
  services: require("./models/service"),
  destinations: require("./models/destination"),
  users: require("./models/user"),
  serviceBookings: require("./models/serviceBooking"),
  destinationBookings: require("./models/destinationBooking"),
  admin: require("./models/admin"),
};

async function connect() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

function readDB() {
  const dbPath = path.join(__dirname, "..", "db.json");
  if (!fs.existsSync(dbPath)) return {};
  const raw = fs.readFileSync(dbPath, "utf8");
  try {
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[sync] failed to parse db.json", err);
    return {};
  }
}

async function syncOnce() {
  console.log("[sync] starting sync...");
  const db = readDB();
  for (const [collection, docs] of Object.entries(db)) {
    if (!Array.isArray(docs)) continue;
    const Model = models[collection];
    if (!Model) {
      console.log(`[sync] skipping ${collection} (no model)`);
      continue;
    }

    const legacyIds = [];
    for (const doc of docs) {
      const copy = Object.assign({}, doc);
      if (copy.id !== undefined) {
        copy.legacyId = copy.id;
        delete copy.id;
      }
      legacyIds.push(String(copy.legacyId));
      try {
        await Model.updateOne(
          { legacyId: copy.legacyId },
          { $set: copy },
          { upsert: true }
        );
      } catch (err) {
        console.warn(
          `[sync] upsert error for ${collection} legacyId=${copy.legacyId}:`,
          err.message || err
        );
      }
    }

    if (prune) {
      try {
        const q = { legacyId: { $nin: legacyIds } };
        const res = await Model.deleteMany(q).exec();
        if (res.deletedCount)
          console.log(
            `[sync] pruned ${res.deletedCount} docs from ${collection}`
          );
      } catch (err) {
        console.warn(
          `[sync] prune error for ${collection}:`,
          err.message || err
        );
      }
    }

    console.log(`[sync] synced collection ${collection} (${docs.length} docs)`);
  }
  console.log("[sync] done");
}

async function main() {
  await connect();
  console.log("[sync] connected to", MONGO_URL);

  await syncOnce();

  if (watch) {
    const dbPath = path.join(__dirname, "..", "db.json");
    console.log("[sync] watching", dbPath);
    const watcher = chokidar.watch(dbPath, { ignoreInitial: true });
    let timer = null;
    watcher.on("change", () => {
      if (timer) clearTimeout(timer);
      // debounce rapid changes
      timer = setTimeout(async () => {
        console.log("[sync] db.json changed, syncing...");
        await syncOnce();
      }, 250);
    });
  } else {
    // exit when done
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("[sync] fatal error", err);
  process.exit(1);
});
