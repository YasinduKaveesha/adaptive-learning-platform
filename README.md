# Component A — Diagnostic Engine (Demo2)
## Project R26-IT-088

Adaptive cognitive screening app for Grade 5 students — frontend-only demo
showcasing the screening flow, classroom games, and playground adventure map.

---

## Architecture

```
component-a-diagnostic-engine/
└── mobile/           React Native app (Expo)
    └── src/
        ├── screens/
        │   ├── WelcomeScreen       Entry + name input
        │   ├── ScreeningScreen     Adaptive cognitive screening
        │   ├── ResultsScreen       Category scores + badge
        │   ├── GameIntroScreen     Mode selection (Classroom / Playground)
        │   ├── PlaygroundHubScreen Adventure map home (progression path)
        │   ├── Game1Screen         Classroom visual reasoning game
        │   ├── Game1ResultsScreen  Classroom game results
        │   ├── TreasurePathScreen  Playground: arrow memory sequence
        │   ├── PatternTrainScreen  Playground: pattern completion
        │   └── MatchShadowScreen   Playground: shape matching
        ├── components/games/       Game UI components + shared popup
        ├── constants/              Theme colours, spacing, radii
        └── services/               API client
```

---

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

- Press `a` for Android emulator, `i` for iOS simulator
- Scan QR with Expo Go on physical device

---

## Demo Flow

1. Launch mobile: `npx expo start --android`
2. Enter student name → tap **Begin Screening**
3. Answer cognitive mini-tasks
4. View results — Group A / B / C + domain profile
5. Choose **Classroom** or **Playground** mode
6. Play games → return to adventure map hub

---

## Owner

IT22193568 — Component A
