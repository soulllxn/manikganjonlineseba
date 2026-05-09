# মানিকগঞ্জ অনলাইন সেবা — Product Requirements

## Overview
Bangla-first mobile/web application for Manikganj district (Bangladesh) civic services. Built with React Native Expo + FastAPI + MongoDB. All content is admin-controlled — no hardcoded data.

## Tech Stack
- **Frontend**: React Native Expo SDK 54 (file-based routing via expo-router)
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (auto-seeded with demo data on startup)
- **Auth**: JWT (admin only) with bcrypt password hashing
- **Fonts**: Hind Siliguri (Bangla Unicode) via @expo-google-fonts

## Key Screens / Routes
- `/` → redirect to `(tabs)`
- `(tabs)/index` → Home with splash overlay → notice marquee → hero slider → 9 service grid (3 cols) → ad carousel → DC glassmorphism card → upazila grid (3 cols) → e-services grid → bottom action rows
- `(tabs)/emergency` → 999 hero card + emergency category grid
- `(tabs)/blood` → blood donor list + blood-group filter chips
- `(tabs)/upazila` → 7 upazilas grid (2 cols)
- `(tabs)/profile` → developer hero card + nav rows
- `service/[type]` → generic listing for hospitals/police/fire_service/doctors/blood_banks/ambulances
- `restaurant` → restaurant cards + Google Maps button + glassmorphism menu image popup
- `rent-a-car` → rent-a-car list with upazila filter
- `upazila/[id]` → upazila banner + dynamic buttons
- `upazila/[id]/[type]` → schools/colleges/madrasas/blood_donors/tourist_places listings
- `complaint` / `join-request` / `about` → forms & info pages
- `admin/login` → JWT-based admin login (default: admin@manikganj.com / Admin@123)
- `admin` → full admin dashboard with sidebar tabs for all 22 collections, generic CRUD forms, switch toggles for is_active

## Backend Collections (admin-controlled, all served from `/api/public/<collection>` for active items, `/api/admin/<collection>` for full CRUD)
notices · sliders · services · ads · district_commissioner · hospitals · police · fire_service · doctors · blood_banks · ambulances · rent_a_car · restaurants · upazilas · schools · colleges · madrasas · blood_donors · tourist_places · e_services · complaints · join_requests

## Restaurant Special
- `menuImage` + `menuImageEnabled` field
- Tapping restaurant name opens vertical-scrollable menu image modal with blur backdrop
- Map button opens Google Maps via mapUrl OR latitude+longitude

## Admin Panel
- Single-page dashboard inside the Expo app at `/admin`
- Login with JWT token stored in AsyncStorage
- 22 horizontal-scroll tabs (one per collection)
- Generic schema-driven create/edit form modal with image URL preview
- Toggle is_active switch per row, edit pencil, delete trash icons

## Brand & Design
- Primary green `#006A4E`, accent red `#F42A41`, white surface
- Glassmorphism on DC card and restaurant menu modal
- Hind Siliguri Bangla fonts everywhere
- 8pt grid spacing, soft shadows, rounded cards
- Splash overlay with logo "মা" + name + developer credit

## Smart Business Enhancement
The advertisement slider and "Ad Space Available" placeholder unlocks a recurring revenue stream — local Manikganj businesses can pay to feature their ad inside the app, fully managed from the admin panel.
