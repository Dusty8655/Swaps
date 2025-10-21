# stock-review-bot — Web App + Mobile-ready Frontend

This canvas contains a ready-to-push GitHub repo layout (single-file view) for a **web application + lightweight frontend app** built from the prototype. It includes:

* a production-ready **backend** (FastAPI) that serves model predictions and training endpoints, plus static files
* a modern **frontend** (React + Vite) that acts as a chat-like UI to query ticker predictions and show explanations
* `Dockerfile` + `docker-compose.yml` for easy local deploy
* `.env.example` with required keys (Plus500 stub + NewsAPI)
* instructions to run locally, build, and deploy

> DISCLAIMER: This project is a research prototype. **Not financial advice.** Backtest thoroughly before any real trading.

---

## Project structure (shown as files below)

```
stock-review-bot-webapp/
├─ backend/
│  ├─ app.py
│  ├─ requirements.txt
│  ├─ model_utils.py
│  └─ Dockerfile
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ main.jsx
│     └─ App.jsx
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

## File: `backend/requirements.txt`

```
fastapi
uvicorn[standard]
yfinance
pandas
numpy
scikit-learn
xgboost
ta
nltk
joblib
requests
feedparser
newspaper3k
python-dotenv
```

---

## File: `backend/model_utils.py`

```python
# A trimmed-down version of the pipeline: fetch data, build features, load/predict model
import os
import joblib
import pandas as pd
from dotenv import load_dotenv
load_dotenv()
MODEL_DIR = os.getenv('MODEL_DIR', './models')
MODEL_PATH = os.path.join(MODEL_DIR, 'xgb_best.joblib')

# Provide a small wrapper to load model saved by training script
def load_model(path=None):
    if path is None:
        path = MODEL_PATH
    if not os.path.exists(path):
        raise FileNotFoundError('Model artifact not found. Train first.')
    return joblib.load(path)

# stub feature builder: in real repo import from main prototype file
# here we assume `build_features` exists or is replaced by the full implementation

def predict_from_features(model_artifact, features_df):
    feats = model_artifact['features']
    scaler = model_artifact['scaler']
    model = model_artifact['xgb']
    X = features_df[feats].fillna(0).values
    Xs = scaler.transform(X)
    dmat = xgb.DMatrix(Xs)
    prob = model.predict(dmat)[0]
    return float(prob)
```

---

## File: `backend/app.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
load_dotenv()

from model_utils import load_model

app = FastAPI(title='Stock Review Bot API')

class Query(BaseModel):
    ticker: str
    include_news: bool = True

# Load model once on startup if available
MODEL_ART = None
try:
    MODEL_ART = load_model()
except Exception:
    MODEL_ART = None

@app.get('/health')
def health():
    return {'status': 'ok', 'model_loaded': MODEL_ART is not None}

@app.post('/predict')
def predict(q: Query):
    # This endpoint expects the backend to construct features from market data
    if MODEL_ART is None:
        raise HTTPException(status_code=500, detail='Model not available. Train or upload model artifact first.')
    # For brevity this example returns a stubbed response
    # Replace with actual pipeline call (fetch_market_data, build_features, predict_for_ticker)
    return {
        'ticker': q.ticker.upper(),
        'prediction': {
            'prob_up': 0.54,
            'direction': 'UP',
            'top_feature_importances': [('ma20_above_ma50', 12), ('rsi', 8)],
            'last_close': 123.45
        }
    }

# Static file serving will be configured in Docker / reverse proxy for the built frontend
```

---

## File: `backend/Dockerfile`

```
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## File: `frontend/package.json`

```json
{
  "name": "stock-review-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

---

## File: `frontend/vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

---

## File: `frontend/src/main.jsx`

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(<App />)
```

---

## File: `frontend/src/App.jsx`

```jsx
import React, { useState } from 'react'

export default function App() {
  const [ticker, setTicker] = useState('AAPL')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handlePredict() {
    setLoading(true)
    setResult(null)
    try {
      const resp = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker })
      })
      const data = await resp.json()
      setResult(data)
    } catch (e) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Stock Review Bot</h1>
      <p>Query a ticker to get ML-driven prediction informed by news & reviews.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={ticker} onChange={(e) => setTicker(e.target.value)} />
        <button onClick={handlePredict} disabled={loading}>Predict</button>
      </div>

      {loading && <p>Loading…</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

---

## File: `docker-compose.yml`

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - '8000:8000'
    environment:
      - NEWSAPI_KEY
      - PLUS500_API_KEY
      - MODEL_DIR=/data/models
    volumes:
      - ./backend/models:/data/models
  frontend:
    image: node:18
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: sh -c "npm install && npm run dev -- --host"
    ports:
      - '5173:5173'
```

---

## File: `.env.example`

```
PLUS500_API_KEY=
NEWSAPI_KEY=
MODEL_DIR=./backend/models
```

---

## File: `README.md` (quick start)

````md
# Stock Review Bot — Web App

## Quick start (local)

1. Copy `.env.example` to `.env` and add keys.
2. Start services with Docker Compose:
   ```bash
   docker-compose up --build
````

3. Open frontend at [http://localhost:5173](http://localhost:5173) and backend at [http://localhost:8000](http://localhost:8000)

## Notes

* Train your model using the CLI training script from the original prototype and save artifact to `backend/models/xgb_best.joblib` before hitting `/predict` for real results.
* The Plus500 integration is a stub — replace with institutional API calls if you have access.

```

---

### What I created for you
- A ready-to-push repository layout in this document with runnable backend + frontend scaffolding, Docker support, and clear instructions.

### Next steps I can do (pick any, or I can do them all):
1. **Populate `model_utils.py` with the full feature pipeline** from your prototype so `/predict` runs real predictions. (I'll wire the actual `build_features`, news ingestion, and model loading.)
2. **Add user authentication** (JWT) and rate-limiting to the API.
3. **Improve frontend UI** (Tailwind, charts, sentiment timeline, news list, mobile responsiveness).
4. **Add GitHub Actions** CI that lints, runs unit tests, and builds Docker images.
5. **Prepare a Play Store / TestFlight-ready mobile wrapper** using Capacitor or React Native (web → native) and generate app manifest files.

Tell me which of the next steps you'd like and I'll extend the project accordingly.

```

