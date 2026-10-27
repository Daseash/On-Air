# WanderLust — Front-End Redesign Checklist

Direction: **Minimal Editorial** (Airbnb layout + clean whitespace + serif headlines).
Reference: Airbnb 2025 Summer Release UI Kit (Figma community: `airbnb-design-ui-kit-summer-release-2025`).
Rule: **Less motion.** No 3D tilt, no particle rain, no Three.js, no custom cursor, no floating cards, no scroll parallax. Animations (if any) will be added later in a separate motion pass.

## Status Glossary
- [ ] todo (not started)
- [x] done (implemented)
- [~] in progress

---

## 1. Core
- [x] Remove Three.js (`bg-canvas`, hero viewport, RAG 3D header) from layout
- [x] Remove scroll progress bar, custom cursor, particle rain, parallax
- [x] Remove `data-tilt` / `data-depth` attributes from all partials
- [x] Replace DM Sans / Syne fonts with **Inter** (body) + **Fraunces** (serif display)
- [x] Single clean `style.css` (rewrite, no 3D/motion sections)## 2. Global Layout
- [ ] Sticky top navbar:
  - [x] Logo (left)
  - [x] Pill search bar (center): `Anywhere · Any week · Add guests` + red search button
  - [x] Right: `Become a host` link, globe icon, hamburger + avatar menu
  - [x] Mobile hamburger toggles nav links
- [x] Minimal footer (border-top, language/currency top row, 4 columns, bottom bar)
- [x] Max-width container (~1280px), consistent vertical rhythm

## 3. Home (`views/home.ejs`) — mirrors Airbnb homepage sections
- [x] Search hero: Airbnb copy **"Where to?"** + functional Where / Check-in / Check-out / Who fields → `/listings`
- [x] Category icon pills row (shared `includes/categories.ejs` partial, also used on index)
- [x] **Homes on WanderLust** featured grid (listing card component, computed ratings)
- [x] **Become a host** promo band (`/listings/new` CTA) — matches Airbnb "earn extra income" section
- [x] **WanderLust Cover** trust band — 4 protection cards (Booking Protection Guarantee, Get-What-You-Booked, 24-hour Safety Line, Guest Support)
- [x] Empty state when no listings exist

## 4. Stays Index (`views/listings/index.ejs`)
- [x] Page heading + stay count
- [x] Category filter pills row (shared partial; 19 Airbnb-style categories, client-side keyword filtering)
- [x] Filters modal (price range, amenities, sort)
- [x] Listing grid from `allListings`
- [x] Empty state

## 5. Listing Card (used on home, index, similar stays)
- [x] Rounded image (4:3, subtle hover scale only)
- [x] Heart wishlist button (top right) — posts to the wishlist toggle endpoint
- [x] Line 1: **location** (title, Airbnb-style) + star rating (computed — "New" when none)
- [x] Line 2: listing title (muted)
- [x] Line 3: price per night (bold) + `/ night` muted

## 6. Stay Detail (`views/listings/show.ejs`)
- [x] Title row + rating + reviews count + **Share** (copy-link) and **Save** actions
- [x] Large rounded hero image
- [x] **Host card** (avatar, Superhost, 4 years hosting, Message host)
- [x] Left: About this Stay, key details grid, reviews list + leave-a-review form
- [x] **Similar stays** section (same country, excludes current listing, computed ratings)
- [x] Right sticky booking card:
  - [x] Price per night + rating pill
  - [x] Check-in / Check-out: real date inputs (min = today, validated)
  - [x] Guests stepper (wired to the hidden form field, 1–16)
  - [x] Reserve button → real POST, live server-priced summary (nights × rate + 8% cleaning + 12% service)
  - [x] Free cancellation note

## 7. Forms
- [x] Add/Edit stay (`new.ejs`, `edit.ejs`)
- [x] Login / Signup (`login.ejs`, `signup.ejs`)
- [x] Error page (`error.ejs`)

## 8. RAG Chat (EDITH)
- [x] Remove Three.js 3D header; clean light theme drawer
- [x] Keep chat functionality (ask/answer + listing cards)
- [x] Floating toggle button restyled

## 9. JavaScript (`public/js/main.js` re-write)
- [x] Mobile nav toggle
- [x] Category pill `active` toggle + grid filtering
- [x] Wishlist heart toggle (no transform)
- [x] Guest stepper (wired to booking form)
- [x] Reserve button (real submit + live price summary + overlap pre-check)
- [x] Removed: tilt, glare, cursor, particles, counter animation, Three.js scenes, scroll reveal, parallax, scroll progress
- [x] Bootstrap validation (`script.js`) verified working

## 10. Verification
- [x] `node app.js` boots clean
- [x] `/` renders home
- [x] `/listings` renders grid
- [x] `/listings/:id` renders show + booking card
- [x] `/listings/new`, `/edit`, `/login`, `/signup` render
- [x] No console errors (automated E2E + smoke tests in `test/`)