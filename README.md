# Choose Your Own Adventure – Backend

Gamified personality test that recommends a drink based on a hidden scoring system.

## Project Structure

```
ChooseYourOwnAdventure/
├── data/                        ← SQLite database file (auto-created)
│   └── adventure.db
├── public/
│   └── images/
│       ├── drinks/              ← Drink images
│       └── options/             ← Option images
├── src/
│   ├── controllers/
│   │   └── gameController.js    ← Business logic for both endpoints
│   ├── database/
│   │   ├── db.js                ← Singleton DB connection
│   │   └── init.js              ← Schema + seed data script
│   ├── routes/
│   │   └── gameRoutes.js        ← Express route definitions
│   └── server.js                ← App entry point
├── package.json
└── README.md
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialise the database (creates schema + seeds dummy data)
npm run init-db

# 3. Start the server (dev mode with hot-reload)
npm run dev

# 3b. Or start in production mode
npm start
```

Server runs on **http://localhost:3000** by default.

---

## API Reference

### GET `/api/game-flow`

Returns all questions and their associated options.  
`score_weight` is **never included** in the response.

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "swipe",
      "content": "How do you start your morning?",
      "options": [
        { "id": 1, "question_id": 1, "label": "Slow stretch and silence", "image_url": "/images/options/slow-morning.png" },
        { "id": 2, "question_id": 1, "label": "Jump out of bed, ready to go", "image_url": "/images/options/jump-morning.png" }
      ]
    },
    {
      "id": 2,
      "type": "drag_drop",
      "content": "Rank what energises you most (drag your top pick to position #1)",
      "options": [...]
    },
    {
      "id": 3,
      "type": "tarot",
      "content": "A tarot spread is laid before you. Which card draws your eye?",
      "options": [...]
    }
  ]
}
```

---

### POST `/api/calculate-result`

Accepts an array of selected option IDs and returns the matched drink.

**Request body**

```json
{
  "selectedOptionIds": [2, 5, 8]
}
```

**Response (matched)**

```json
{
  "success": true,
  "totalScore": 15,
  "drink": {
    "id": 3,
    "name": "Dark Espresso",
    "description": "Intense, focused, and unapologetically ambitious...",
    "image_url": "/images/drinks/dark-espresso.png",
    "min_score": 12,
    "max_score": 15
  }
}
```

**Response (no match)**

```json
{
  "success": true,
  "totalScore": 99,
  "drink": null,
  "message": "No drink matched score 99. Please check the Drinks score bands."
}
```

---

## Score System (Hidden from Frontend)

| Drink | Score Range |
|---|---|
| Sparkling Water | 0 – 5 |
| Tropical Smoothie | 6 – 11 |
| Dark Espresso | 12 – 15 |

| Question | Type | Options → Weights |
|---|---|---|
| Morning routine | swipe | Slow stretch → **0**, Jump up → **5** |
| Energisers | drag_drop | Nature walk → **1**, Conversation → **3**, Achievement → **5** |
| Tarot card | tarot | High Priestess → **0**, Wheel of Fortune → **3**, The Tower → **5** |

Max achievable score = **15** (5 + 5 + 5)

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `ALLOWED_ORIGIN` | `*` | CORS origin whitelist |
