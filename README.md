# D&D Initiative Tracker

A full-stack web application for tracking D&D 5e combat initiative, turns, HP, AC, conditions, and turn timers. Features a GM dashboard for managing encounters and a player-facing display for a second screen.

## Prerequisites

Install the following before proceeding:

| Requirement  | Version | Install (macOS)              | Install (Windows)                                    |
|--------------|---------|------------------------------|------------------------------------------------------|
| Java JDK     | 17+     | `brew install openjdk@17`    | [Adoptium](https://adoptium.net/)                    |
| Maven        | 3.8+    | `brew install maven`         | [Maven](https://maven.apache.org/install.html)       |
| Node.js      | 18+     | `brew install node`          | [Node.js](https://nodejs.org/)                       |

No database installation is required — the app uses an embedded, file-based H2 database (see below).

---

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TurnTracker
```

### 2. Database

The app uses an embedded H2 database stored at `~/.turntracker/data/initiative_tracker` by default (configured in `backend/src/main/resources/application.properties`). Nothing to install or start — the file is created automatically on first run.

> **Note:** The application uses Hibernate `ddl-auto=update` — all tables are created automatically on first startup. No manual schema setup or migrations are needed.

### 3. Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

If `./mvnw` is not present, use your system Maven:

```bash
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts on **http://localhost:5173** and proxies all `/api/*` requests to the backend automatically.

### 5. Open the App

| View           | URL                            |
|----------------|--------------------------------|
| GM Dashboard   | http://localhost:5173/gm       |
| Player Display | http://localhost:5173/player   |

Open the **GM Dashboard** to manage encounters. Open the **Player Display** on a second screen or projector for players.

---

## Production Build

```bash
cd frontend
npm run build
```

Output is written to `frontend/dist/` and can be served by any static file server.

---

## Desktop App (macOS)

TurnTracker can also be packaged as a native macOS app that runs the backend and UI inside their own window (Electron), with no separate servers to start.

```bash
./scripts/build-mac-app.sh
```

This builds the frontend, bundles it into the backend jar as static resources, packages the backend jar, and produces a `.app`/`.dmg` in `desktop/release/` via `electron-builder`. Data is stored under `~/Library/Application Support/TurnTracker/`.

Since the build is unsigned (personal use, no Apple Developer ID), the first time you open it macOS Gatekeeper will block it — right-click the app → **Open** → confirm in the dialog. After that it opens normally.

---

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Data JPA, Spring WebFlux
- **Database:** Embedded H2 (file-based)
- **Frontend:** React 18, Vite 5, React Router DOM 6
- **Desktop:** Electron + electron-builder
- **External API:** [D&D 5e API](https://www.dnd5eapi.co) (monster lookup)

## Project Structure

```
TurnTracker/
├── backend/                  # Spring Boot API
│   ├── src/main/java/        # Controllers, Services, Models, DTOs
│   ├── src/main/resources/   # application.properties
│   └── pom.xml
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # API client functions
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   └── styles/           # CSS
│   ├── package.json
│   └── vite.config.js
├── desktop/                  # Electron wrapper (native macOS app)
│   ├── main.js
│   └── package.json
└── scripts/
    └── build-mac-app.sh      # One-shot build for the desktop app
```

## API Endpoints

### Encounter & Turn
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/api/encounter/state`          | Full encounter state     |
| PUT    | `/api/encounter/turn/next`      | Advance turn             |
| PUT    | `/api/encounter/turn/previous`  | Revert turn              |
| PATCH  | `/api/encounter/timer`          | Pause/resume timer       |
| PATCH  | `/api/encounter/timer-settings` | Set turn duration        |
| DELETE | `/api/encounter/clear`          | Clear all combatants     |

### Combatant Management
| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| POST   | `/api/combatants/player`              | Add player/NPC/custom monster  |
| POST   | `/api/combatants/monster/{name}`      | Add monster from D&D 5e API    |
| PATCH  | `/api/combatants/{id}/hp`             | Update current HP / temp HP    |
| PATCH  | `/api/combatants/{id}/initiative`     | Update initiative (re-sorts)   |
| PATCH  | `/api/combatants/{id}/missed-attack`  | Update highest missed attack   |
| PATCH  | `/api/combatants/{id}/last-hit`       | Update last attack that hit    |
| PATCH  | `/api/combatants/{id}/bonus-ac`       | Update bonus AC                |
| PATCH  | `/api/combatants/{id}/damage-taken`   | Update damage taken (unknown HP) |
| PATCH  | `/api/combatants/{id}/condition`      | Toggle bloodied/dead manually  |
| PATCH  | `/api/combatants/{id}/death-saves`    | Update death save counts       |
| DELETE | `/api/combatants/{id}`                | Remove combatant               |

### Saved Combatants
| Method | Endpoint                       | Description               |
|--------|--------------------------------|---------------------------|
| GET    | `/api/saved-combatants`        | List saved templates      |
| DELETE | `/api/saved-combatants/{id}`   | Delete saved template     |

## Troubleshooting

- **Port 8080 in use:** Kill the process (`lsof -ti:8080 | xargs kill`) or change `server.port` in `application.properties`.
- **Frontend can't reach backend:** Both servers must be running. The Vite dev server proxies `/api` requests to `localhost:8080`.
- **Desktop app won't open ("unidentified developer"):** Right-click the app → **Open** the first time to bypass Gatekeeper for an unsigned build.
