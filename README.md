# 2048 Game

A minimalist, highly polished, and modernized clone of the famous 2048 game built with **Vanilla JavaScript (ES6+ Modules)**. Join the numbers and get to the **2048 tile!**

![2048 Game Screenshot](https://jet2511.github.io/2048/assets/meta/og_image.png)

## 🚀 Live Demo
Play it here: [https://jet2511.github.io/2048/](https://jet2511.github.io/2048/)

---

## ✨ Features
- **Strategy Pattern Game Modes**: Choose from **Classic**, **Time Attack** (60s timer + 1s bonus/move), and **Survival** (15s fast-paced countdown).
- **Multiple Grid Sizes**: Select 3x3, 4x4, 5x5, or 6x6 grids for different challenge levels.
- **Independent High Scores**: Best scores are tracked and saved separately for each grid size.
- **Smart Undo Move & Glow Hint**: Made a mistake? Undo your last moves (with a 100-point penalty). When Game Over occurs, the Undo button automatically pulses with a gold highlight.
- **Glassmorphism & Accessible Modals**: Beautiful backdrop blur dialogs for Settings, Top 5 Leaderboard, and 3 Save/Load Slots with keyboard ESC support.
- **Modern Dark Mode**: Full-page desaturated dark mode theme with sleek contrast.
- **Micro-animations & Confetti**: Spring curves for tile merges, floating score indicators, and confetti explosion on reaching 2048.
- **Web Audio API Sound Effects**: Pure JavaScript audio synthesizer for slide, merge, bonus, and victory sounds.
- **Automated E2E Testing**: Full Playwright test suite (`npm run test`) for robust UI/UX verification.

---

## 🛠️ How to Play
1. Use your **Arrow Keys** (or swipe gestures on mobile) to move the tiles.
2. When two tiles with the same number touch, they **merge into one!**
3. Reach the **2048** tile to win, but you can keep playing for higher scores!

---

## 💻 Development & Testing

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run automated Playwright E2E tests
npm run test

# Build for production
npm run build
```

---

## 📂 Project Structure
```text
2048/
├── .github/workflows/   # CI/CD GitHub Actions & Playwright integration
├── assets/
│   ├── css/             # Modular Stylesheets (base, main, ui, game, tiles, animations)
│   ├── js/              # Core game logic (ES6 Modules)
│   │   ├── modes/       # Strategy Pattern Game Modes (Classic, TimeAttack, Survival)
│   │   ├── application.js
│   │   ├── game_manager.js
│   │   ├── html_actuator.js
│   │   ├── grid.js
│   │   ├── tile.js
│   │   └── keyboard_input_manager.js
│   └── meta/            # Favicon & OpenGraph assets
├── tests/               # Playwright E2E automated test suite
├── index.html           # HTML5 Entry point
├── playwright.config.js # Playwright E2E testing configuration
├── vite.config.js       # Vite & PWA configuration
└── README.md            # Project documentation
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
