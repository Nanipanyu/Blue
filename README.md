# Blue — Sports Social Platform

Blue is a social platform for athletes and sports enthusiasts to showcase themselves, connect with others, and organize play. Users build rich profiles, post media, and coordinate with teams and matches—all in one place.

## What it does

- Profile as a sports resume: bio, social links, sports preferences, availability, and privacy controls.
- Unified posts: share photos, videos, and text updates; engage with likes and comments; media shown in consistent frames and organized into Photos/Videos tabs in profile.
- Team and play: teams, matches, challenges, and notifications to keep everyone in sync.
- Shareable identity: generate a QR code linking to your public profile.

## Key features

- Rich Profile: basic info, region, bio, social links (Instagram/Twitter/Facebook), privacy settings.
- Sports Preferences: favorite sports, skill level, positions, experience.
- Availability: simple day/time selection to signal when you can play.
- Posts Feed: PHOTO/VIDEO/TEXT with likes/comments; media upload pipeline backed by cloud storage.
- Profile Media Tabs: clean Photos and Videos tabs for fast browsing.
- Teams, Matches, Challenges: endpoints and UI scaffolding to organize play.
- Achievements & Trophies: placeholders for showcasing milestones.

## How it works (user journey)

1. Create or log in to your account; your profile is protected with authenticated routes.
2. Complete your profile (bio, social links, preferences, availability) and set privacy.
3. Post photos/videos/text; they appear in your feed and in your profile media tabs.
4. Discover and organize play with teams/matches/challenges; get notified of updates.
5. Share your public profile with a QR code.

## Project structure

- `app/` — Next.js App Router UI (profile, dashboard, media, tabs)
- `components/` — UI components (navbar, media sections, modals)
- `hooks/` — data hooks (profile, posts, teams, matches, notifications)
- `backend/` — Express server, routes, controllers, middleware, Prisma schema/migrations
	- `backend/src/routes/profile.ts` — profile APIs (me, public, social links, preferences, availability, privacy, QR, achievements, trophies)
	- `backend/src/controllers/*` — business logic for profile, posts, teams, etc.
	- `backend/prisma/` — Prisma schema and migrations

## Tech stack (brief)

Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, React Query

Backend: Node.js (Express, TypeScript), Prisma ORM, JWT auth, multer for uploads

Storage/DB: PostgreSQL, AWS S3 (via multer-s3) for media

## Getting started (local)

Frontend (root):

```bash
npm install
npm run dev
```

Backend (`backend/`):

```bash
cd backend
npm install
npm run dev
```

Then open http://localhost:3000

> Note: Configure environment variables for database and S3 credentials before running uploads.

## Roadmap

- Public discovery and search
- In-app messaging
- Achievements and trophies UI
- Team scheduling and match logistics enhancements
