# BDTrip — Bangladesh Tourism Website

Professional, full-stack tourism website template with a simple admin panel, booking system, and mock/full backend options for local development.

This README documents how to get the project running locally, available API endpoints, data shape, development tips, and deployment notes.

Table of contents
- About
- Features
- Prerequisites
- Quick start (2-minute)
- Development — detailed setup
- API endpoints & data model
- Project structure
- Troubleshooting
- Contributing
- License & Credits

About
-----
BDTrip is an educational demo of a travel booking website focused on Bangladesh. It includes:
- A public UI to browse destinations and services
- User registration/login
- Admin panel (dashboard, manage users, manage destinations, view bookings)
- Two backend options for local development: a lightweight json-server (port 3000) and a small Express server (port 4000) that can use either MongoDB or fall back to `db.json`.

Features
--------
- Browse destinations and services
- User registration and login
- Bookings for destinations and services
- Admin dashboard with statistics and latest destinations
- CRUD for destinations, users, and bookings (via admin panel)

Prerequisites
-------------
- Node.js (v14+)
- npm (comes with Node.js)
- Python 3 (optional — for serving static files during development)
- json-server (optional — quick mock backend)

Quick start (2-minute)
----------------------
1. Start the mock backend (json-server):

```bash
cd /home/dev/Downloads/BDTrip
json-server --watch db.json --port 3000
```

2. Serve the frontend over HTTP (do not open HTML files via `file://`):

```bash
cd /home/dev/Downloads/BDTrip
python3 -m http.server 8000
```

3. Open the admin dashboard:

http://localhost:8000/admin/adminDashboard.html

Development — detailed setup
----------------------------
The repository supports two backend modes:

Option A — json-server (fast, zero-code mock API)
- Easy to use and good for UI development.
- Run: `json-server --watch db.json --port 3000`

Option B — Express server (recommended for advanced dev)
- Located in `/server`. The Express server will use a MongoDB instance when available (set via `MONGO_URL` in `.env`) and fall back to `db.json` when Mongo is not reachable.

To run the Express server:

```bash
cd /home/dev/Downloads/BDTrip/server
npm install
npm start        # runs server.js on port 4000 by default
# or
npm run dev      # uses nodemon for auto reloads
```

Important: the admin dashboard script (`admin/adminDashboard.js`) attempts to fetch `/destinations` from the following locations (in order):
1. `http://localhost:3000/destinations` (json-server)
2. `http://localhost:4000/destinations` (Express server)
3. `/destinations` (same-origin fallback)

If you run your API on a different host/port, update `config.js` or modify the frontend fetch URL.

Environment variables (Express server)
- `PORT` — change the port the Express server listens on (default 4000)
- `MONGO_URL` — MongoDB connection URI for production-like testing

API endpoints & data model
-------------------------
The project exposes common REST endpoints. Example resources from `db.json`:

- /destinations — list of destination entries. Sample fields:
   - id, name, location, image, rating, price
- /services — services the site offers (name, description, price, duration, groupSize)
- /users — registered users (id, name, email, passward)
- /destinationBookings — bookings for destinations (id, name, start, end, persons, amount, bookingDate, status, username)
- /serviceBookings — bookings for services
- /admin — admin credentials (used by the admin login page)

Full example (from `db.json`):

```json
{
   "destinations": [ { "id": "1", "name": "Grand Sultan Tea Resort & Golf", "location": "Srimangal, Moulvibazar", "price": "16500" } ],
   "users": [ { "id": "8813", "name": "Akash", "email": "ab@gmail.com" } ],
   "destinationBookings": [ { "id": "efbf", "name": "Paro", "amount": "2250", "status": "Confirmed" } ]
}
```

Project structure
-----------------
Top-level layout (important files/folders):

```
BDTrip/
├── admin/                  # Admin UI (dashboard, management pages)
├── css/                    # Stylesheets
├── image/                  # Images used by the site
├── server/                 # Express server + models + helpers
├── userLoginReg/           # Login and registration pages
├── db.json                 # Local JSON database used by json-server / fallback
├── package.json            # Scripts (to start the Express server)
└── README.md               # <-- you are here
```

Useful routes (when serving frontend from `http://localhost:8000`):

- Admin login: `/login/adminlogin.html` (default admin/admin password in `db.json`)
- Admin dashboard: `/admin/adminDashboard.html`
- Public pages: `/index.html`, `/discover.html`, `/service.html`, `/destination.html`

Running the full dev setup locally
---------------------------------
1. Start backend (pick json-server or Express) — see above.
2. Start static server for frontend:

```bash
python3 -m http.server 8000
```

3. Open the site: `http://localhost:8000`

Troubleshooting
---------------
- Problem: "Failed to fetch" or dashboard shows demo values
   - Make sure either json-server (port 3000) or the Express server (port 4000) is running.
   - Open the browser DevTools Console — the admin script logs which URL it fetched.

- Problem: "Cannot GET /" when opening `http://localhost:8000`
   - Make sure you started Python's `http.server` from the project root (or use any static server).

- Problem: port already in use
   - Find and kill process using the port (example for port 3000):

```bash
lsof -ti:3000 | xargs kill -9
```

Contributing
------------
Contributions are welcome. Small suggestions:

- Open an issue describing the bug or feature
- Fork the repo, create a feature branch, and open a pull request
- Keep changes small and focused; include clear commit messages

If you want help wiring the dashboard metrics to real booking totals (instead of demo heuristics), I can implement it and add tests.

License & credits
-----------------
This project is provided for educational purposes. If you plan to use it in production, replace client-side auth with server-side validation and use a real database.

Made with ❤️ for Bangladesh tourism education.

© 2025 BDTrip

Recent Changes (Nov 2025)
-------------------------
This project has had several client-side improvements and small data updates to make bookings, admin behavior, and auth more robust during local development. Highlights:

- **Booking Status:** Bookings created from the public UI are now saved with `status: "Pending"` so an administrator must confirm them before they move to `Confirmed`.
- **Booking Amount:** Service bookings include an `amount` (calculated as `price * people`) and this value is saved to `serviceBookings` and shown in the user and admin UIs.
- **Contact Auto-fill (readonly):** The booking form now prefills contact `email` and `phone` from `localStorage` or the API and sets the fields to `readonly` to reduce accidental edits.
- **Group Size Enforcement (UI):** Each `Book Now` button carries the service `groupSize` (for example `"1-4 people"`). The booking overlay parses that range and sets the `#people` input `min`/`max`/`placeholder` so end-users cannot choose a number outside the advertised group size.
- **Admin Cascade Delete & Auto-Logout:** When an admin removes a user via the admin UI, the client-side admin flow deletes related bookings (service and destination) and then deletes the user. The site also includes a periodic existence check (`userLoginReg/logstatus.js`) which will auto-logout a user (clear localStorage and redirect to login) if their account is removed by an administrator.
- **Registration Timestamp:** Registration requests now include a `createdAt` timestamp (ISO string) so admin UIs can show a user's registration date. `db.json` sample users have also been backfilled with `createdAt` values.
- **Auth script robustness:** `userLoginReg/logstatus.js` was updated to avoid redeclaring global constants (uses a safe local fallback for `API_BASE_URL`), fixed earlier syntax issues, and added cross-tab `storage` listeners for consistent nav updates.

Developer Notes & Recommendations
---------------------------------
These changes improve the development experience, but most client-side protections are not authoritative. For production-like correctness, apply these server-side controls as well:

- **Server-side validation**: Always validate and sanitize booking fields on the server. Ignore client-supplied `status` and `amount` (or verify `amount` against server price), and derive contact info from the authenticated user when creating bookings.
- **Protect user deletion**: Restrict `DELETE /users/:id` to admin roles only and implement server-side cascade-delete (or transactions) to remove related bookings atomically.
- **Enforce groupSize**: Validate the `people` count for a booking against the service's allowed range on the server before accepting the booking.
- **Data migration**: If you have many existing entries in `db.json`, backfill `createdAt` and normalize `amount` to numeric values for reliable aggregations.

Quick Verification Steps
------------------------
Run the mock API and static frontend, then exercise these flows locally:

- Start json-server (recommended for quick UI dev):

```bash
json-server --watch db.json --port 3000
python3 -m http.server 8000
# Open: http://localhost:8000/service.html
```

- Test booking flow:
   - Log in as a user (via `userLoginReg/login.html`).
   - Click a `Book Now` button; the `#people` field should be pre-limited (e.g. 1–4) and `email`/`phone` auto-filled and readonly.
   - Submit a booking. Confirm in `http://localhost:3000/serviceBookings` that the new booking has `status: "Pending"` and an `amount` field.

- Test admin deletion / auto-logout:
   - Open admin UI (`/admin/users.html`) and delete the sample user.
   - The user tab that was logged in should be auto-logged out (localStorage cleared) and redirected to login within ~10s (the client polls for existence every 10s).

Config & Integration Notes
-------------------------
- The frontend uses an `API_BASE_URL` (commonly provided in `config.js` or declared in a page). To avoid naming collisions across multiple scripts, some client files use a local fallback `_API_BASE_URL` when `API_BASE_URL` is not defined.
- If you run the Express server instead of `json-server`, start it from `/server` (see earlier instructions) and update `config.js` or `API_BASE_URL` accordingly.

Next Steps (suggested)
----------------------
- Implement server-side validation for bookings and user deletion to make the fixes authoritative.
- Add small integration tests that exercise login → booking → admin confirm/delete → auto-logout flows.
- Remove duplicate DOM `id` attributes (for example, duplicate `id="logdiv"` occurrences) to avoid selector ambiguity.

If you'd like, I can also:
- Add server-side sample validation code (Express + in-memory checks) and a small migration script to normalize `db.json`.
- Create a single canonical `config.js` with `API_BASE_URL` and update scripts to import/consume it consistently.

