const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/bdtrip";
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("[server] Connected to MongoDB");
  })
  .catch((err) => {
    console.error("[server] MongoDB connection error", err);
  });

// Models
const Service = require("./models/service");
const Destination = require("./models/destination");
const User = require("./models/user");
const ServiceBooking = require("./models/serviceBooking");
const DestinationBooking = require("./models/destinationBooking");
const Admin = require("./models/admin");

// Utility: generic list with simple query params support
let useMongo = false;
// flip useMongo to true when mongoose connects successfully
mongoose.connection.on("connected", () => {
  useMongo = true;
  console.log("[server] Mongoose connection established, using MongoDB mode");
});
mongoose.connection.on("error", () => {
  useMongo = false;
  console.warn(
    "[server] Mongoose connection error - will fallback to db.json mode"
  );
});

// JSON file helpers (fallback mode)
const fsSync = require("fs");
function readDBFile() {
  try {
    const dbPath = path.join(__dirname, "..", "db.json");
    if (!fsSync.existsSync(dbPath)) return {};
    const raw = fsSync.readFileSync(dbPath, "utf8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[server] readDBFile error", err);
    return {};
  }
}
function writeDBFile(obj) {
  try {
    const dbPath = path.join(__dirname, "..", "db.json");
    fsSync.writeFileSync(dbPath, JSON.stringify(obj, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[server] writeDBFile error", err);
    return false;
  }
}
function nextIdForCollection(arr) {
  let max = 0;
  arr.forEach((d) => {
    const id = d && (d.id || d._id || d.legacyId);
    const n = Number(id);
    if (!Number.isNaN(n) && n > max) max = n;
  });
  return max + 1;
}

function paginateArray(arr, limit, page) {
  if (!limit) return arr;
  const p = page > 0 ? page : 1;
  const start = (p - 1) * limit;
  return arr.slice(start, start + limit);
}

// Generic list handler (supports Mongo or db.json)
function listHandler(Model, collectionName) {
  return async (req, res) => {
    try {
      const q = req.query.q || req.query._q || null;
      const limit = parseInt(req.query._limit || req.query.limit || 0, 10) || 0;
      const page = parseInt(req.query._page || req.query.page || 0, 10) || 0;
      const sort = req.query._sort || req.query.sort || null;
      const order = req.query._order || req.query.order || "asc";

      if (useMongo) {
        const filter = {};
        if (q) {
          filter.$or = [
            { title: new RegExp(q, "i") },
            { name: new RegExp(q, "i") },
            { description: new RegExp(q, "i") },
          ];
        }
        let query = Model.find(filter);
        if (sort) query = query.sort({ [sort]: order === "desc" ? -1 : 1 });
        if (limit > 0) query = query.limit(limit);
        if (page > 0 && limit > 0) query = query.skip((page - 1) * limit);
        const data = await query.exec();
        return res.json(data);
      }

      // fallback to db.json
      const db = readDBFile();
      let arr = Array.isArray(db[collectionName]) ? db[collectionName] : [];
      if (q) {
        const re = new RegExp(q, "i");
        arr = arr.filter(
          (item) =>
            item &&
            ((item.name && re.test(item.name)) ||
              (item.title && re.test(item.title)) ||
              (item.description && re.test(item.description)))
        );
      }
      if (sort) {
        arr.sort((a, b) => {
          const va = a[sort];
          const vb = b[sort];
          if (va == vb) return 0;
          return order === "desc" ? (vb > va ? 1 : -1) : va > vb ? 1 : -1;
        });
      }
      const total = arr.length;
      if (limit > 0) res.set("X-Total-Count", String(total));
      const paged = paginateArray(arr, limit, page);
      return res.json(paged);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "server error" });
    }
  };
}

// Generic create/get/update/delete handlers that work in both modes
async function createHandler(Model, collectionName, req, res) {
  try {
    if (useMongo) {
      const doc = new Model(req.body);
      await doc.save();
      return res.status(201).json(doc);
    }
    const db = readDBFile();
    db[collectionName] = Array.isArray(db[collectionName])
      ? db[collectionName]
      : [];
    const id = nextIdForCollection(db[collectionName]);
    const payload = Object.assign({}, req.body, { id });
    db[collectionName].push(payload);
    writeDBFile(db);
    return res.status(201).json(payload);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "bad request", details: err.message });
  }
}

async function getHandler(Model, collectionName, req, res) {
  try {
    if (useMongo) {
      const doc = await Model.findById(req.params.id).exec();
      if (!doc) return res.status(404).json({ error: "not found" });
      return res.json(doc);
    }
    const db = readDBFile();
    const arr = Array.isArray(db[collectionName]) ? db[collectionName] : [];
    const found = arr.find(
      (d) => String(d.id || d._id || d.legacyId) === String(req.params.id)
    );
    if (!found) return res.status(404).json({ error: "not found" });
    return res.json(found);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "bad request" });
  }
}

async function updateHandler(Model, collectionName, req, res) {
  try {
    if (useMongo) {
      const opts = { new: true, runValidators: false };
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        opts
      ).exec();
      if (!doc) return res.status(404).json({ error: "not found" });
      return res.json(doc);
    }
    const db = readDBFile();
    db[collectionName] = Array.isArray(db[collectionName])
      ? db[collectionName]
      : [];
    const idx = db[collectionName].findIndex(
      (d) => String(d.id || d._id || d.legacyId) === String(req.params.id)
    );
    if (idx === -1) return res.status(404).json({ error: "not found" });
    const updated = Object.assign({}, db[collectionName][idx], req.body);
    db[collectionName][idx] = updated;
    writeDBFile(db);
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "bad request", details: err.message });
  }
}

async function deleteHandler(Model, collectionName, req, res) {
  try {
    if (useMongo) {
      const doc = await Model.findByIdAndDelete(req.params.id).exec();
      if (!doc) return res.status(404).json({ error: "not found" });
      return res.json({ success: true });
    }
    const db = readDBFile();
    db[collectionName] = Array.isArray(db[collectionName])
      ? db[collectionName]
      : [];
    const idx = db[collectionName].findIndex(
      (d) => String(d.id || d._id || d.legacyId) === String(req.params.id)
    );
    if (idx === -1) return res.status(404).json({ error: "not found" });
    db[collectionName].splice(idx, 1);
    writeDBFile(db);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "bad request" });
  }
}

// Mount routes for each model (pass collection name used in db.json)
app.get("/services", listHandler(Service, "services"));
app.post("/services", (req, res) =>
  createHandler(Service, "services", req, res)
);
app.get("/services/:id", (req, res) =>
  getHandler(Service, "services", req, res)
);
app.put("/services/:id", (req, res) =>
  updateHandler(Service, "services", req, res)
);
app.delete("/services/:id", (req, res) =>
  deleteHandler(Service, "services", req, res)
);

app.get("/destinations", listHandler(Destination, "destinations"));
app.post("/destinations", (req, res) =>
  createHandler(Destination, "destinations", req, res)
);
app.get("/destinations/:id", (req, res) =>
  getHandler(Destination, "destinations", req, res)
);
app.put("/destinations/:id", (req, res) =>
  updateHandler(Destination, "destinations", req, res)
);
app.delete("/destinations/:id", (req, res) =>
  deleteHandler(Destination, "destinations", req, res)
);

app.get("/users", listHandler(User, "users"));
app.post("/users", (req, res) => createHandler(User, "users", req, res));
app.get("/users/:id", (req, res) => getHandler(User, "users", req, res));
app.put("/users/:id", (req, res) => updateHandler(User, "users", req, res));
app.delete("/users/:id", (req, res) => deleteHandler(User, "users", req, res));

app.get("/serviceBookings", listHandler(ServiceBooking, "serviceBookings"));
app.post("/serviceBookings", (req, res) =>
  createHandler(ServiceBooking, "serviceBookings", req, res)
);
app.get("/serviceBookings/:id", (req, res) =>
  getHandler(ServiceBooking, "serviceBookings", req, res)
);
app.put("/serviceBookings/:id", (req, res) =>
  updateHandler(ServiceBooking, "serviceBookings", req, res)
);
app.delete("/serviceBookings/:id", (req, res) =>
  deleteHandler(ServiceBooking, "serviceBookings", req, res)
);

app.get(
  "/destinationBookings",
  listHandler(DestinationBooking, "destinationBookings")
);
app.post("/destinationBookings", (req, res) =>
  createHandler(DestinationBooking, "destinationBookings", req, res)
);
app.get("/destinationBookings/:id", (req, res) =>
  getHandler(DestinationBooking, "destinationBookings", req, res)
);
app.put("/destinationBookings/:id", (req, res) =>
  updateHandler(DestinationBooking, "destinationBookings", req, res)
);
app.delete("/destinationBookings/:id", (req, res) =>
  deleteHandler(DestinationBooking, "destinationBookings", req, res)
);

app.get("/admin", listHandler(Admin, "admin"));
app.post("/admin", (req, res) => createHandler(Admin, "admin", req, res));
app.get("/admin/:id", (req, res) => getHandler(Admin, "admin", req, res));
app.put("/admin/:id", (req, res) => updateHandler(Admin, "admin", req, res));
app.delete("/admin/:id", (req, res) => deleteHandler(Admin, "admin", req, res));

// Fallback
app.use((req, res) => res.status(404).json({ error: "endpoint not found" }));

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(
    `[server] To use JSON Server instead, keep config.js pointed to http://localhost:3000`
  );
});
