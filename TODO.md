# 3D Motion Animation Transformation - TODO

## Phase 1: Enhanced 3D Hero Experience 🔄

- [x] Upgrade Three.js engine with architectural 3D scene (floating buildings, villas)
- [x] Add 3D parallax depth layers responding to mouse movement
- [x] Add 3D particle rain/sparkle effects on scroll
- [x] 3D cursor follower with particle trail
- [x] Update CSS with 3D animation styles (cursor, particles, glassmorphism, glow, scroll progress, page transitions)
- [x] Add scroll progress bar with animated gradient
- [x] 3D page transitions between routes
- [x] 3D button morphing animations with ripple effects
- [ ] Restructure home.ejs — move 3D viewport to full-bleed hero background

## Phase 2: 3D Interactive Listings & Cards 🔄

- [x] 3D tilt/rotation on listing cards hover with depth-of-field (already in main.js + CSS)
- [x] 3D glare effect on hover (already in main.js init3DTilt + CSS)
- [ ] Add floating clouds / hot air balloons as animated 3D background
- [ ] Enhanced lens flare & glassmorphism hover effects

## Phase 3: Listings Page Enhancements ✅

- [x] Update views/listings/index.ejs with 3D card interactions (data-tilt, stagger, glow)
- [x] Update views/listings/show.ejs with 3D immersive details (data-tilt on hero, booking card)
- [x] 3D card tilt layout with z-depth
- [x] Image parallax within cards (3D layered via data-depth)
- [x] **Interactive Date Picker**: Full check-in/check-out date inputs in booking card
- [x] **Guest Selector**: +/- controls for guests (1-16) with bump animation
- [x] **Auto Price Calculation**: Real-time night count, subtotal, cleaning (8%), service fee (12%)
- [x] **Animated Price Breakdown**: Slide-down breakdown with gradient total
- [x] **3D Styled Date Inputs**: Glassmorphism date fields with arrow pulse animation
- [x] **Reserve Button**: Dynamic "Reserve — ₹XXX" total display, disabled when no dates selected
- [x] **Min Date Validation**: Prevents past dates, checkout must be after check-in

## Phase 4: Final Polish 🔄

- [ ] Performance optimization (particle counts, scroll throttling)
- [ ] Responsive adjustments for mobile 3D
- [ ] Test all routes and fix any errors

## Phase 5: RAG AI Concierge System ✅

- [x] Vector Document Loader & Embedding Pipeline (`rag/lib/`)
- [x] Vector Store with similarity search (`rag/lib/vector-store.js`)
- [x] Database Ingestion Script (`rag/ingest.js`) - Embedded 29 database listings
- [x] RAG API Endpoint (`POST /api/chat` in [app.js](file:///c:/Users/Eashwar/OneDrive/Desktop/AIRBNB/app.js))
- [x] UI Glassmorphic Floating Assistant Button & Chat Drawer ([ragChat.ejs](file:///c:/Users/Eashwar/OneDrive/Desktop/AIRBNB/views/includes/ragChat.ejs))
- [x] Quick prompt chips (Beachfront, Mountain Cabins, Budget Stays)
- [x] Client-side chat logic with markdown parsing & direct property links ([ragChat.js](file:///c:/Users/Eashwar/OneDrive/Desktop/AIRBNB/public/js/ragChat.js))
- [x] **Interactive 3D Three.js Neural Sphere Header**: Rotates and pulses inside RAG drawer ([ragChat.js](file:///c:/Users/Eashwar/OneDrive/Desktop/AIRBNB/public/js/ragChat.js))
- [x] **Dynamic Search Pulsing**: 3D orb changes color to neon cyan while querying vectors & back on response
- [x] **3D Entrance & Floating Animations**: Micro-animations on avatar and incoming message bubbles ([style.css](file:///c:/Users/Eashwar/OneDrive/Desktop/AIRBNB/public/css/style.css))
## Phase 6: Reviews & Express Router Refactor ✅

- [x] **Review Model (`models/review.js`)**: Mongoose schema for comments, 1-5 rating, createdAt
- [x] **Listing Schema Integration (`models/listing.js`)**: Linked `reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]` array
- [x] **Cascading Delete Middleware**: Mongoose `post("findOneAndDelete")` hook to delete all associated reviews when a listing is removed
- [x] **Joi Review Validation (`schema.js`)**: `reviewSchema` validating rating (min 1, max 5) and required comment text
- [x] **Listing Router (`routes/listing.js`)**: Refactored all listing CRUD endpoints using Express Router
- [x] **Review Router (`routes/review.js`)**: Express Router (`mergeParams: true`) handling `POST /listings/:id/reviews` and `DELETE /listings/:id/reviews/:reviewId`
- [x] **Mounted Routers (`app.js`)**: Reorganized main app into modular `app.use("/listings", listingsRouter)` and `app.use("/listings/:id/reviews", reviewsRouter)`
- [x] **3D Interactive Review UI (`show.ejs` & `style.css`)**: 3D star rating selector, populated reviews list, average rating calculation, and review deletion button

## Phase 7: User Auth, MVC Architecture & Robustness ✅

- [x] **User Authentication Model (`models/user.js`)**: Mongoose schema for user management (`username`, `email`, `password`, `createdAt`)
- [x] **Centralized Validation Middleware (`middleware.js`)**: Consolidated Joi validators for Listing, Review, and User payloads
- [x] **User Express Router (`routes/user.js`)**: Endpoints for GET/POST `/signup`, GET/POST `/login`, and GET `/logout`
- [x] **Auth Views (`signup.ejs`, `login.ejs`)**: Glassmorphic 3D styled forms matching app design system
- [x] **MVC Controllers (`controllers/listings.js`, `controllers/reviews.js`)**: Extracted all route handling logic into dedicated controllers
- [x] **Express `router.route()` Chaining (`routes/listing.js`)**: Path chaining for `/` and `/:id`
- [x] **Template Defensive Guards (`views/listings/index.ejs`)**: Added null-safety checks to prevent template crashes

