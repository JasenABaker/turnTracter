# D&D Initiative Tracker

A full-stack web application for tracking D&D 5e combat initiative, turns, HP, AC, conditions, and turn timers. Features a GM dashboard for managing encounters and a player-facing display for a second screen.

## Prerequisites

Install the following before proceeding:

| Requirement  | Version | Install (macOS)              | Install (Windows)                                    |
|--------------|---------|------------------------------|------------------------------------------------------|
| Java JDK     | 17+     | `brew install openjdk@17`    | [Adoptium](https://adoptium.net/)                    |
| Maven        | 3.8+    | `brew install maven`         | [Maven](https://maven.apache.org/install.html)       |
| Node.js      | 18+     | `brew install node`          | [Node.js](https://nodejs.org/)                       |
| PostgreSQL   | 14+     | `brew install postgresql@16` | [PostgreSQL](https://www.postgresql.org/download/)   |

If you have **Docker** installed, you can skip installing PostgreSQL and use the included `docker-compose.yml` instead (see Option A below).

---

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TurnTracker
```

### 2. Database Setup

#### Option A: Docker (recommended)

```bash
docker compose up -d
```

This starts a PostgreSQL 16 container with the database `initiative_tracker` preconfigured.

If using Docker, update `backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=postgres
spring.datasource.password=secret
```

#### Option B: Local PostgreSQL

Start PostgreSQL, then create the database:

```bash
# macOS (Homebrew)
brew services start postgresql@16

# Create the database
psql -c "CREATE DATABASE initiative_tracker;"
```

Update `backend/src/main/resources/application.properties` with your PostgreSQL username and password:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/initiative_tracker
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

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

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.5, Spring Data JPA, Spring WebFlux
- **Database:** PostgreSQL 14+ (or Docker)
- **Frontend:** React 18, Vite 5, React Router DOM 6
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
└── docker-compose.yml        # Optional PostgreSQL container
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
- **Database connection refused:** Ensure PostgreSQL is running and the credentials in `application.properties` match your setup.
- **Frontend can't reach backend:** Both servers must be running. The Vite dev server proxies `/api` requests to `localhost:8080`.
