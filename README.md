# Component A — Diagnostic Engine
## Project R26-IT-088

Adaptive cognitive screening engine that classifies Grade 5 students into
Group A / B / C using Thompson Sampling + IRT 2PL, with per-domain cognitive
profile output.

---

## Architecture

```
component-a-diagnostic-engine/
├── backend/          FastAPI service (Python)
│   ├── core/         Algorithm modules (IRT, TS, classifier, multimodal)
│   ├── api/v1/       REST endpoints (screening.py)
│   ├── models/       Pydantic schemas
│   ├── store/        In-memory session store (SQLite in Phase 3)
│   └── main.py       App entry point
├── mobile/           React Native app (Expo)
│   └── src/
│       ├── screens/  Welcome, Screening, Results
│       ├── components/games/  4 cognitive game UIs
│       └── services/ API client
└── tests/            pytest suite for backend algorithms
```

---

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

### Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

- Press `a` for Android emulator, `i` for iOS simulator
- Scan QR with Expo Go on physical device

> **Android emulator**: API connects to `http://10.0.2.2:8000`
> **iOS / physical device**: API connects to `http://localhost:8000`
> Override with env var `EXPO_PUBLIC_API_BASE_URL`

### Tests

```bash
pip install pytest
pytest tests/ -v
```

---

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/students/{id}/screening/start` | Start screening session |
| `POST` | `/api/v1/screening/sessions/{id}/respond` | Submit item response |
| `GET`  | `/api/v1/students/{id}/classification` | Get latest classification |
| `GET`  | `/api/v1/students/{id}/profile` | Get domain ability profile |
| `GET`  | `/health` | Service health check |

---

## Algorithms

| Module | Algorithm | Reference |
|--------|-----------|-----------|
| `core/irt.py` | 2PL IRT, EAP ability estimation | [2][6] |
| `core/thompson_sampling.py` | Non-stationary windowed TS | [3] |
| `core/stopping_rule.py` | Confidence-aware stopping (≥ 90%) | [37] |
| `core/classifier.py` | Random Forest tri-group classifier | [27] |
| `core/multimodal.py` | Reaction time + hesitation → engagement | [10][12] |

---

## PP1 Demo Flow

1. Launch backend: `uvicorn main:app --reload`
2. Launch mobile: `npx expo start --android`
3. Enter student name → tap **Begin Screening**
4. Answer 6–8 cognitive mini-tasks
5. Watch confidence tracker reach 90% threshold
6. Results screen shows Group A/B/C + domain profile

---

## Owner

IT22193568 — Component A
