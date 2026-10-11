# OmniVerse — Full-Stack Entertainment Universe

> **Track. Rate. Discuss. Expand.** — An entertainment aggregator and recommendation engine unifying **Movies**, **Series & Anime**, **AAA & Indie Games**, **Books**, **Manga**, and **Music Albums** with Reddit-style community debates and real-time live chat.

```
omniverse/
├── client/     # React 18 · Vite · TailwindCSS · Zustand · Framer Motion · Socket.io-client
└── server/     # Node.js · Express · Prisma ORM · PostgreSQL (Neon) · JWT · Socket.io
```

---

## 🌟 Implemented Features & UI Tour Guide

Below is a complete index of all features built into OmniVerse and exactly how to experience each one in the UI.

---

### 1. 🎛️ The Vibe Mixer Decision Engine (NEW)
* **What it does**: Solves choice paralysis by allowing visitors and users to calibrate their time budget, emotional frequency, and social setting to synthesize 3 instant high-resonance entertainment recommendations across all 6 formats.
* **How to see it in the UI**:
  1. Click the sleek **"Vibe Mixer"** pill in the top navigation bar, or click **"Launch Vibe Mixer"** in the prominent hero showcase card on the homepage.
  2. Select your **Time Available** (*Quick Bite 15–45m*, *Feature Length 1.5–3h*, *Deep Immersion 10+ hrs*, or *Any Duration*).
  3. Choose your **Emotional Frequency** (*High-Octane Adrenaline*, *Late Night Rainy Melancholy*, *Mind-Bending Riddles*, *Cozy Low-Stakes Comfort*, *Cosmic Wonder*, or *Dark & Visceral*).
  4. Select your **Session Context** (*Solo Session*, *Duo / Date Night*, *Group Party*, or *Background Chill*).
  5. Click **"Synthesize Matches"** — the engine runs a slot-roulette animation with audio haptics and serves 3 curated recommendations featuring **Resonance Confidence Badges (e.g. 99%)**, rationale cards, direct audio/trailer previews, and 1-click wishlist saving.

---

### 2. 🌌 Transmedia Galaxy — Cross-Medium Echoes (NEW)
* **What it does**: Connects the 6 entertainment mediums through thematic bridges. If you love a movie, OmniVerse discovers books, games, manga, anime, and albums that echo its exact tone and narrative frequency.
* **How to see it in the UI**:
  1. Open any title in the catalog (e.g., *Inception*, *Cyberpunk 2077*, *Dune*, or *Avengers: Endgame*).
  2. On the **Media Detail Page** (`/media/:id`), scroll down past the synopsis or click the **"Transmedia Galaxy"** tab in the tab bar.
  3. You will see connected titles across the other 5 media types with **Thematic Alignment Percentages (e.g. 97% Affinity)**, shared genre tags (e.g., `#Sci-Fi`, `#Thriller`), and the dynamic narrative bridge.
  4. Filter by specific formats using the pills (*All Formats*, *Games*, *Series*, *Books*, *Manga*, *Music*) and click **"Step Into World"** to transition seamlessly into the connected title.

---

### 3. 🎬 Cinematic Billboard Hero
* **What it does**: An interactive spotlight hero showcase featuring high-res banners, dynamic color-grading backdrops, media tags, trailers, and smooth slide navigation.
* **How to see it in the UI**:
  1. Navigate to the Home page (`/`).
  2. Observe the auto-advancing spotlight banner displaying trending masterworks with community ratings, release years, and synopsis teasers.
  3. Use the arrow controls or highlight thumbnail strip on the bottom right to jump between featured titles.
  4. Click **"Watch Trailer"** to trigger a distraction-free trailer modal.

---

### 4. 🧭 Vibe Radar (Mood-Matching Pills)
* **What it does**: Allows instant, zero-latency emotional filtering of catalog titles on the home page.
* **How to see it in the UI**:
  1. Scroll down to the **"Trending across OmniVerse"** section on the Home page.
  2. Click any of the horizontal mood pills (*Late Night Rain & Melancholy*, *High-Octane Adrenaline*, *Mind-Bending Riddles*, *Cozy Comfort*, *Cosmic Wonder*, *Dark & Visceral*).
  3. Notice how the media grid below dynamically filters and updates with ambient neon glowing borders matching that emotional wavelength.

---

### 5. ⚡ OmniSwipe Matchmaker
* **What it does**: A Tinder-style gesture-based discover deck for rapidly finding entertainment you want to experience.
* **How to see it in the UI**:
  1. Click **"OmniSwipe"** in the top navigation or visit `/discover`.
  2. Use your mouse to drag and swipe cards **Right** (Add to "Plan to Watch") or **Left** (Skip to next).
  3. You can also use keyboard shortcuts: **Arrow Right** (Like), **Arrow Left** (Pass), **Arrow Up** (Flip card to read full synopsis), and **Z** (Undo last swipe).
  4. Click the **Star** button to open the instant 10-star rating popup.

---

### 6. 💬 Reddit-Style Community Debates & Channels
* **What it does**: A forum ecosystem with channels, post types (Discussions, Theories, Reviews, Hot Takes, Polls), nested comments, and upvoting/downvoting.
* **How to see it in the UI**:
  1. Click **"Community"** in the top navigation or visit `/community`.
  2. Filter by channels (*All*, *Movies*, *Series*, *Games*, *Music*, *Sports*, *Books*, *Manga*, *Q&A*).
  3. Sort posts by **Hot**, **Top**, **New**, or **Most Discussed**.
  4. Click into any post (e.g., Chuckle Chieftain's debate on *"Why immersive game design beats ultra-realistic graphics"*) to view nested replies, post comments, and cast upvotes.
  5. Click **"Create Post"** to author your own thread with markdown and tags.

---

### 7. 💊 Taste Capsule Exporter
* **What it does**: A graphic export card generator displaying your top 4 entertainment pillars across Movie, Game, Series, and Music/Book.
* **How to see it in the UI**:
  1. In the header bar under **"Curated for you"** or on your Profile (`/profile`), click **"Taste Capsule"**.
  2. Select visual themes (*Cyberpunk Neon*, *Obsidian & Gold*, *Electric Aurora*).
  3. Customize your 4 featured slots using live search.
  4. Click **"Download Capsule"** or **"Share"** to export a PNG card for social media.

---

### 8. 🔍 Global Spotlight Search (Ctrl + K)
* **What it does**: Instant universal keyboard-driven spotlight search indexing all titles, genres, and discussions.
* **How to see it in the UI**:
  1. Press **Ctrl + K** (or **Cmd + K** on macOS) anywhere in the app, or click the search input in the top bar.
  2. Type any title (e.g., *Avatar*, *Elden Ring*, *Abbey Road*, *Berserk*).
  3. View grouped instant results categorized by Movies, Games, Series, Music, Books, Manga, and Community Threads.

---

### 9. 🎵 Persistent Audio Player Dock
* **What it does**: Allows previewing audio tracks and music albums while you continue browsing the rest of the application.
* **How to see it in the UI**:
  1. Browse to any Music Album (e.g., *Abbey Road*, *Thriller*, or Hindi Pop albums).
  2. Click the **Play** button on any audio preview card.
  3. A persistent floating dock expands at the bottom of the screen with play/pause, volume control, track scrubber, and animated audio equalizer wave bars that persist across all route transitions.

---

### 10. 👤 Personal Entertainment Profile & Custom Lists
* **What it does**: A personal control center tracking your entertainment status, custom lists, and reviews.
* **How to see it in the UI**:
  1. Log in and navigate to `/profile`.
  2. Switch between status filters: *All*, *Favorites*, *Plan to Watch*, *Completed*, *On Hold*, and *Dropped*.
  3. Switch to the **Custom Lists** tab to create curated collections (e.g., *"Chuckle's Hall of Fame: GOAT Games & Movies"*).

---

### 11. 💬 Real-Time Live Support Chat (Socket.io)
* **What it does**: A live chat widget connecting users with support staff with instant notification bells and socket events.
* **How to see it in the UI**:
  1. Click the floating **"Live Support"** button on the bottom right corner of any page.
  2. Send messages to the support channel.
  3. Log in as `support@omniverse.app` in an incognito window to view the incoming conversation in real-time and reply back!

---

### 12. 🛡️ Admin Command Center
* **What it does**: Role-based access control (RBAC) panel for administrators.
* **How to see it in the UI**:
  1. Log in as `admin@omniverse.app`.
  2. Click the shield icon in the top navigation or visit `/admin`.
  3. Manage user roles (`USER`, `SUPPORT_AGENT`, `ADMIN`), view live system metrics, bulk import media, or moderate forum posts.

---

### 13. 🎛️ Zero-G 3D Tilt & Audio Haptics
* **What it does**: Interactive spatial effects (cards tilt in 3D space tracking your cursor) and subtle Web Audio sound synthesis.
* **How to see it in the UI**:
  1. Click your profile avatar / settings dropdown in the top right.
  2. Toggle **"Zero-G 3D Tilt"** On/Off.
  3. Toggle **"Audio Haptics"** On/Off to hear tactile pops, clicks, and chimes when interacting with buttons, ratings, and filters.

---

## 🔑 Demo Accounts (Seeded & Ready)

All demo accounts come with pre-seeded data and can be accessed with **1-Click Auto-Fill** on the `/login` page:

| Role | Display Name | Email | Password | Features Highlighted |
| :--- | :--- | :--- | :--- | :--- |
| **Curated Profile** | **Chuckle Chieftain** | `chuckle@omniverse.app` | `chuckle123` | **Full pre-populated library, custom GOAT lists, active debate threads & reviews** |
| **Admin** | **Omni Admin** | `admin@omniverse.app` | `admin123` | **Access to `/admin` dashboard, catalog CRUD, user role management** |
| **Support Agent** | **Support Agent** | `support@omniverse.app` | `support123` | **Live chat agent inbox & real-time messaging** |
| **Standard User** | **Demo User** | `demo@omniverse.app` | `user123` | **Clean user profile with onboarding taste tags** |

> *Note: When clicking any demo button on `/login`, the credentials will visibly auto-populate into the Email and Password fields before submitting.*

---

## 🚀 Quick Start Guide (Local Setup)

### Prerequisites
* **Node.js** v20+
* **npm** v10+

### 1. Backend Server Setup
```bash
cd server
cp .env.example .env
npm install
npm run setup          # Generates Prisma client, applies migrations, seeds 500+ items and Chuckle Chieftain
npm run dev            # Starts API on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev            # Starts Vite SPA on http://localhost:5173
```

---

## 🛠️ Architecture & Tech Stack

```
Browser Client (React 18 + Vite)
    │   REST API (/api/*) + WebSocket (/socket.io)
    ▼
Express API Server (Node.js)
    ├── Auth & Security (JWT, bcryptjs, Helmet, CORS, Rate Limiting)
    ├── Controllers & Services (Media, Vibe Mixer, Transmedia, Forum, Chat, Lists)
    ├── Socket.io Service (Real-time live messaging & notifications)
    └── Prisma ORM → PostgreSQL (Neon Database)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Zustand, Lucide Icons, Socket.io-client |
| **Backend** | Express 5, Node.js, Prisma ORM, JSON Web Tokens (JWT), bcryptjs, Helmet, Socket.io |
| **Database** | PostgreSQL (Neon Cloud) / SQLite compatible |
| **APIs** | Dedicated endpoints for Vibe Mixer, Transmedia Galaxy, Media CRUD, Reddit-style Forums, Live Chat |
