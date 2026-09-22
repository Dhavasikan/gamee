# 👑 RAJA RANI — Real-Time Royal Multiplayer Card Game

A complete, polished, real-time multiplayer web game based on the traditional Indian role-prediction game **Raja Rani**. Built with **Node.js, Express, Socket.IO, SQLite**, and a **mobile-first React** frontend adorned with royal Indian aesthetics (velvet purple, midnight navy, imperial gold, and 3D card animations).

---

## 🌟 The Core Game Mechanic

Unlike ordinary guessing games, **Raja Rani** features an authentic role-exchange mechanic:

1. **Correct Prediction:**
   - Active player receives the **target role's points** (e.g. Raja receives 80 pts for finding Rani).
   - Target player is publicly revealed.
   - Target player becomes the new active turn, advancing to the next role in the royal sequence:
     $$\text{Raja} \longrightarrow \text{Rani} \longrightarrow \text{Manthiri} \longrightarrow \text{Police} \longrightarrow \text{Sippai} \longrightarrow \text{Thirudan}$$

2. **Wrong Prediction (Character Transfer):**
   - The active character and the wrongly guessed player's secret character are **SWAPPED**!
   - The guessed player receives the active character and **becomes the new active turn**!
   - The original active player receives the guessed player's character.
   - The **target role remains unchanged**!
   - The new active player attempts to find the target role again.

---

## 👑 Character Roster & Points

| Order | Role | Title | Emoji | Points Value | Mission |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Raja** | King | 👑 | 100 | Reveals majesty publicly, finds Rani |
| 2 | **Rani** | Queen | 👸 | 80 | Found by Raja, then searches for Manthiri |
| 3 | **Manthiri** | Minister | 🧙 | 60 | Found by Rani, then searches for Police |
| 4 | **Police** | Police | 👮 | 40 | Found by Manthiri, then searches for Sippai |
| 5 | **Sippai** | Soldier | ⚔️ | 20 | Found by Police, then captures Thirudan |
| 6 | **Thirudan** | Thief | 🕵️ | 0 | Found by Sippai, yields 0 pts; round ends |

---

## 🏰 Features & Highlights

- **Real-Time Multiplayer Room System:** Unique chamber codes (e.g. `RR-7K29`), copy-to-clipboard, host management, and live lobby court.
- **Strict Anti-Cheating Architecture:** Secret roles are never leaked in public socket payloads. Each client's secret card is delivered strictly to their individual socket connection.
- **Solo & Quick-Test Bot Support:** Host can click **"🤖 Fill with Royal Bots"** in the lobby to immediately fill empty court slots with intelligent Royal AI guards.
- **Immersive Royal Indian Aesthetics:** Dark velvet palette, ornate borders, 3D flip card animations, gold foil buttons, and victory confetti.
- **Zero-Dependency Sound Synthesizer:** Built with native Web Audio API (fanfares, chimes, error gongs, and card flips) with instant response and no external asset loading failures.
- **Role Swap & Reveal Animations:** Visual animation displaying the card exchange when a guess fails, and celebration banners when a character is found.
- **Chamber History & Scoreboard:** Real-time log chronicle and podium rankings (🥇, 🥈, 🥉).
- **SQLite Database Persistence:** Match histories and player scores automatically logged to `database/rajarani.sqlite`.
- **Tournament / Rematch Options:** Play again keeping cumulative tournament points or start fresh.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm**

### 2. Running Locally

To run the unified production server (serves both backend API and React frontend on port 5000):

```bash
# Start backend server with frontend bundle
npm start
```

Then open your browser and navigate to:
👉 **`http://localhost:5000`**

### 3. Development Mode (Optional)

To run the backend and frontend dev servers with hot reload:

```bash
# Terminal 1 - Backend
node backend/src/server.js

# Terminal 2 - Frontend Vite Dev Server
cd frontend
npm run dev
```

---

## 🧪 Automated Verification Suite

Run the exact unit tests matching **Requirement #37** of the game specification:

```bash
# Run Core Game Engine Unit Test (verifies Requirement #37 step-by-step)
npm test
```

Run the end-to-end multi-client Socket.IO integration test:

```bash
# Run E2E 6-Client Multiplayer Simulation Test
$env:NODE_PATH="frontend/node_modules;backend/node_modules"; node test/fullGamePlaythrough.test.js
```

---

## 📁 Project Architecture

```
c:\Users\jdhav\QK\
├── backend/
│   ├── src/
│   │   ├── server.js             # Express + Socket.IO HTTP server & static dist handler
│   │   ├── gameEngine.js         # Core Raja Rani state machine & role swap logic
│   │   ├── roomManager.js        # Chamber lifecycle, bots, and disconnect handling
│   │   ├── socketHandlers.js     # Secure public/private Socket.IO event controllers
│   │   └── db.js                 # SQLite persistent storage
│   ├── test/
│   │   └── gameEngine.test.js    # Requirement #37 test case & scoring tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Royal header with sound toggle & room code
│   │   │   ├── HomePage.jsx      # Landing screen (Create / Join / How-To)
│   │   │   ├── LobbyPage.jsx     # Court roster, ready counter & Bot fill
│   │   │   ├── GameBoard.jsx     # Active arena, sequence bar & player cards
│   │   │   ├── SecretCardModal.jsx# 3D flip card inspection modal
│   │   │   ├── PredictionModal.jsx# Confirmation dialog for role guessing
│   │   │   ├── SwapAnimation.jsx # Role transfer exchange animation
│   │   │   ├── RevealAnimation.jsx# Celebration fanfare & point banner
│   │   │   ├── GameHistory.jsx   # Live chronicle timeline
│   │   │   ├── FinalResults.jsx  # Game over podium & rematch controls
│   │   │   └── HowToPlayModal.jsx# Rules guide
│   │   ├── audio/
│   │   │   └── soundEffects.js   # Web Audio API royal sound synthesizer
│   │   ├── App.jsx               # Main controller & screen router
│   │   ├── main.jsx              # React entry
│   │   └── index.css             # Royal Indian theme design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── rajarani.sqlite           # Persistent SQLite database
├── test/
│   ├── integration.test.js       # Socket.IO connection & anti-cheat test
│   └── fullGamePlaythrough.test.js# 6-player automated match simulation
└── package.json                  # Root runner script
```
