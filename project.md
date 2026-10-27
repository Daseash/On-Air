# WanderLust — Airbnb Clone (Full-Stack)

Full-stack vacation-rental marketplace with a **minimal editorial UI**, **MVC backend**, and a **from-scratch RAG AI concierge** ("E.D.I.T.H.") built with plain Node.js + Express + MongoDB.

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express 5, Mongoose 9, Joi validation |
| Frontend | EJS + ejs-mate layouts, Bootstrap 5, Font Awesome, custom glassmorphism CSS |
| Animation | Subtle hover/reveal effects only (Three.js removed — see front-end.md) |
| Search UX | Client-side category pills + server-side keyword/filters |
| RAG | From-scratch: Gemini `text-embedding-004` (opt-in) / `Xenova/all-MiniLM-L6-v2` (free local default), JSON vector store, hybrid vector+keyword retrieval, Gemini 2.0 Flash generation (opt-in) with template fallback |
| Auth | Custom, no external libs — `crypto.scrypt` password hashing + signed-cookie sessions |
| DB | MongoDB at `mongodb://127.0.0.1:27017/wanderlust` (override with `DB_URL`/`ATLASDB_URL`) |

## Project Structure

```
AIRBNB/
├─ app.js                 # Express bootstrap, routers, error handlers
├─ models/                # listing, review, user, booking
├─ controllers/           # listings, reviews, bookings, wishlist
├─ routes/                # listing, review, user, booking, wishlist, rag
├─ middleware.js          # Joi validators
├─ schema.js              # Joi schemas (listing/review/user)
├─ init/                  # seed data + seeder
├─ rag/                   # RAG system (see below)
│  ├─ config/engine/      # env config + singletons
│  ├─ loaders/            # DB + text docs → documents
│  ├─ chunker/embedding/vectorStore/retriever/search/…
│  ├─ pipeline.js         # ragAnswer() orchestrator
│  └─ data/               # vector_store.json, raw/ (policies.md, website.md)
├─ scripts/               # evalRetrieval
├─ public/js|css/         # main.js, script.js, ragChat.js, style.css
└─ views/                 # EJS: layouts, listings, users, bookings
```

## Data Models

- **Listing** — `title, description, price, location, country, image{url,filename}, reviews[]`, auto-cascades review delete.
- **Review** — `comment, rating (1–5), createdAt`.
- **User** — `username, email, password (scrypt-hashed), wishlist[]`.
- **Booking** — `user, listing, checkIn, checkOut, guests, nights, pricePerNight, subtotal, cleaningFee (8%), serviceFee (12%), total, status (confirmed|cancelled)`.

## Routes / API

| Route | Method | Purpose |
|---|---|---|
| `/` | GET | Home + featured stays |
| `/listings` | GET/POST | Index (+search, price filters, sort) / create |
| `/listings/:id` | GET/PUT/DELETE | Show / update / delete |
| `/listings/:id/edit`, `/new` | GET | Edit / new forms |
| `/listings/:id/reviews` | POST | Add review |
| `/listings/:id/reviews/:rid` | DELETE | Delete review |
| `/signup`,`/login`,`/logout` | GET/POST | Auth (scrypt + signed-cookie session) |
| `/bookings` | GET/POST | My Trips / create booking |
| `/bookings/:id/cancel` | POST | Cancel booking |
| `/wishlist` | GET | Wishlist page |
| `/wishlist/:id/toggle` | POST | Add/remove favorite |
| `/rag/ask` | POST | RAG concierge (rate-limited) |

## RAG System (built from `RAG_From_Scratch_NodeJS_Gemini.md`)

Pipeline: **intent → filter-parse → retrieve (vector or keyword fallback) → kind-aware answer → listing cards**.

- Indexes all listings (features/property-type metadata) + `policies.md` + `website.md` (41 chunks in `rag/data/vector_store.json`).
- Filters parsed from natural language: location, price range, amenities ("with a pool"), property type.
- Hard filters never auto-relax (price/location may relax to nearest stays).
- Intents: greeting / thanks / help / off-topic with canned replies.
- Gemini opt-in via `GEMINI_API_KEY` in `.env`; zero-key mode uses `all-MiniLM-L6-v2` + local template answers.

## Design System

Glassmorphism, Airbnb-style minimal editorial: CSS vars `--accent: #ff385c`, radius/shadow scale, Fraunces display + Inter body fonts, real booking-card price breakdown, Leaflet map, animated RAG chat drawer.

## How to Run

```
npm install
node init/index.js        # seed database (optional)
npm run rag:ingest         # build vector store
npm start                  # http://localhost:8080
npm test                   # automated test suite (node:test, needs local MongoDB)
```

## Roadmap

### Done
- [x] Full MVC CRUD for listings + reviews (cascade delete)
- [x] User auth (signup/login/logout) with scrypt hashing + signed-cookie sessions
- [x] CSRF protection on all state-changing forms
- [x] Real bookings: Reserve persists, server-side price calc, My Trips page, cancel
- [x] Availability: overlapping confirmed bookings rejected; booked ranges shown
- [x] Wishlist: toggle hearts, wishlist page, persisted per user
- [x] Search & filters: keyword + price min/max + sort on `/listings`
- [x] Map section on listing show page
- [x] RAG concierge + review-guided answers + "my trips" personal concierge
- [x] Dynamic ratings: cards/home/show compute the real average from reviews
- [x] Automated test suite (`npm test`, 27 tests): auth, RAG filter parsing, pricing, full E2E flow
- [x] Gemini key opt-in (`.env` `GEMINI_API_KEY`) for richer answers — zero-key local fallback
- [x] Airbnb-mirrored homepage sections (see `front-end.md`): "Where to?" search, category pills row, Homes grid, Become-a-host promo, WanderLust Cover trust band, host card + Share/Save + Similar stays on show page, language/currency footer row

### Up Next (candidates)
- [ ] Payments (Razorpay/Stripe) on booking confirmation
- [ ] Email confirmations (Nodemailer)
- [ ] Host dashboard (my listings, booking inbox, calendar)
- [ ] Image uploads (Cloudinary/Multer)
- [ ] Review auth owner checks (only booking guests / host)
- [ ] Availability calendar Picker (disable taken dates natively)
- [ ] Smarter guest-capacity (per-listing `maxGuests`)

> Note: `npm audit` reports transitive advisories via `@xenova/transformers`
> (onnxruntime-web/protobufjs/sharp). Fixing requires a breaking downgrade, so
> they are accepted for now — switch to the Gemini embedding opt-in to drop the
> local model entirely if you need a clean audit.