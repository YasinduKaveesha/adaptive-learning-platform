# Component A — Diagnostic Engine
## Project R26-IT-088 | PP1 Demo Branch

Child-friendly cognitive screening mobile app for Grade 5 students.  
This branch (`demo_PP1`) contains the **mobile app only** — no backend required.

---

## What This Demo Does

1. Enter a student name on the Welcome screen and tap **Let's Go**
2. Tap **Play** on the Game Intro screen
3. Answer 5 image-based questions (pattern recognition, memory, reasoning)
4. View a Results screen with score, per-question breakdown, and feedback

Everything runs fully offline — no server needed.

---

## Prerequisites

Install these once on your machine before anything else.

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org |
| Expo Go (phone) | latest | App Store / Play Store |

> You do **not** need Android Studio or Xcode. Expo Go on your phone is enough.

---

## Setup & Run

```bash
# 1. Go into the mobile folder
cd mobile

# 2. Install all dependencies (only needed once, or after pulling new changes)
npm install

# 3. Start the dev server
npx expo start
```

After running `npx expo start` a QR code appears in the terminal.

- **Physical phone** — open Expo Go and scan the QR code
- **Android emulator** — press `a` in the terminal
- **Web browser** — press `w` in the terminal (limited, mobile view recommended)

> **Important for physical phone:** Your phone and laptop must be on the **same WiFi network**, otherwise Expo Go cannot connect.

---

## If Something Looks Wrong (Cache Fix)

If images or screens don't load correctly after pulling changes, clear the Metro cache:

```bash
npx expo start --clear
```

---

## Project Structure

```
mobile/
├── App.tsx                  # Navigation setup
├── assets/                  # All images used in the game
│   ├── q1.png – Q5.png      # Question images
│   ├── fox_excellent.png    # Results celebration image
│   ├── gamebg.png           # Game screen background
│   └── screeningBG.png      # Results screen background
└── src/
    ├── screens/
    │   ├── WelcomeScreen.tsx
    │   ├── GameIntroScreen.tsx
    │   ├── Game1Screen.tsx        # 5-question game
    │   └── Game1ResultsScreen.tsx # Score & summary
    ├── constants/
    │   └── theme.ts         # Colors, spacing, fonts
    └── types/
        └── index.ts         # Navigation types
```

---

## Dependencies

All dependencies are listed in `mobile/package.json` and installed automatically via `npm install`. No separate requirements file is needed.

Key packages:

| Package | Purpose |
|---------|---------|
| `expo ~51.0.0` | App framework |
| `react-native 0.74.1` | UI framework |
| `@react-navigation/native` | Navigation core |
| `@react-navigation/native-stack` | Stack navigation |
| `@expo-google-fonts/poppins` | Poppins font family |
| `expo-font` | Font loading engine |
| `expo-haptics` | Haptic feedback |
| `react-native-reanimated` | Animations |
| `react-native-safe-area-context` | Safe area handling |
| `react-native-screens` | Native screen containers |

---

## Owner

IT22193568 — Component A
