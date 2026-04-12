# 2048 Game

A polished, modern clone of the famous 2048 puzzle game. Join the numbers and get to the **2048 tile!**

![2048 Logo](./assets/meta/logo.png)

## Live Demo
Play it here: [https://jet2511.github.io/2048/](https://jet2511.github.io/2048/)

## Features
- **Multiple Grid Sizes**: Choose from 3x3, 4x4, 5x5, or 6x6 grids
- **High Scores**: Best scores tracked separately for each grid size
- **Undo Move**: Revert your last moves (with score penalty)
- **Dark Mode**: Full dark mode support
- **Responsive**: Works on desktop and mobile

## How to Play
1. Use **Arrow Keys** (or swipe on mobile) to move tiles
2. When two tiles with the same number touch, they **merge!**
3. Reach the **2048** tile to win

## Tech Stack
- Vanilla JavaScript (ES6+)
- Vite for development
- Playwright for testing

## Project Structure
```
2048/
├── assets/
│   ├── css/           # Stylesheets
│   ├── js/            # Game logic
│   └── meta/          # Assets
├── tests/             # E2E tests
├── index.html        # Entry point
└── vite.config.js    # Vite config
```

## License
[MIT](./LICENSE)