# RepoSense AI 🔍

> ML-Powered GitHub Repository Analyzer — Predict bugs, detect tech stacks, generate setup guides, and analyze code health in under a minute.

---

## 🚀 What It Does

RepoSense AI analyzes any public GitHub repository and gives you:

- **Bug Risk Prediction** — Random Forest ML model predicts High / Medium / Low risk per file
- **Health Score** — Composite 0–100 score across bug risk, activity, documentation, and complexity
- **Tech Stack Detection** — Auto-detects languages, frameworks, databases, and dev tools
- **Setup Guide** — Extracts install, run, build, and test commands with one-click copy
- **Dependency Graph** — Maps file-to-file import relationships
- **Impact Analysis** — Shows which files are affected when a file changes
- **GitHub Discovery** — Search and browse trending GitHub repos, analyze with one click
- **Analysis History** — Every analysis saved to your account, revisit anytime

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — UI framework and build tool
- **Recharts** — Data visualizations
- **Lucide React** — Icons
- **Axios** — HTTP client
- **React Router v6** — Client-side routing
- **Pure CSS** — Custom design system via `index.css`

### Backend
- **FastAPI** — REST API framework
- **SQLAlchemy** — ORM
- **Pydantic** — Request/response validation
- **JWT (python-jose)** — Authentication
- **Bcrypt (passlib)** — Password hashing
- **Uvicorn** — ASGI server
- **Python-dotenv** — Environment variables

### Database
- **PostgreSQL** — Production database
- **Supabase** — Cloud PostgreSQL hosting

### Machine Learning
- **Scikit-learn** — Random Forest classifier, GridSearchCV, StandardScaler
- **XGBoost** — Model comparison
- **Imbalanced-learn** — SMOTE for class balancing
- **Pandas + NumPy** — Data processing
- **Joblib** — Model serialization
- **Radon** — Cyclomatic complexity analysis

### Code Analysis
- **GitPython** — Git history extraction
- **PyGithub** — GitHub API integration

---

## 📊 ML Pipeline

```
NASA PROMISE Defect Dataset
        ↓
Feature Engineering (LOC, complexity, churn, commits, contributors)
        ↓
StandardScaler + SMOTE (handle class imbalance)
        ↓
Compare 4 models (Random Forest, XGBoost, Decision Tree, Logistic Regression)
        ↓
GridSearchCV — tune Random Forest
        ↓
Evaluate on held-out test set (80/20 split)
        ↓
Save model.pkl, scaler.pkl, feature_names.pkl
```

**Model Performance (on test set):**
| Metric | Score |
|--------|-------|
| Accuracy | ~87% |
| F1 Score | ~0.85 |
| Precision | ~88% |
| Recall | ~83% |
| ROC-AUC | ~0.93 |

---

## 🔄 Analysis Pipeline

```
GitHub URL / Discovery
        ↓
Clone repo + fetch metadata (stars, forks, contributors)
        ↓
Parse files (LOC, complexity, comment ratio)
        ↓
Extract git history (churn, commits, bug-fix commits)
        ↓
Detect tech stack (languages, frameworks, databases, tools)
        ↓
Generate setup guide (install/run/build/test commands)
        ↓
Build dependency graph (file-to-file imports)
        ↓
Run ML predictions (bug probability per file)
        ↓
Calculate health score (0-100)
        ↓
7-tab interactive dashboard
```

---

## 📁 Folder Structure

```
RepoSense AI/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── auth.py              # JWT + bcrypt
│   ├── auth_routes.py       # /api/auth/signup, /login, /me
│   ├── routes.py            # /api/analyze, /history
│   ├── github_routes.py     # /api/github/search, /trending
│   ├── database.py          # PostgreSQL + SQLAlchemy models
│   └── schemas.py           # Pydantic request/response models
├── analyzer/
│   ├── github_fetch.py      # Clone repo + GitHub API metadata
│   ├── parser.py            # LOC, complexity, comment ratio
│   ├── metrics.py           # Git churn, commits, contributors
│   ├── tech_stack.py        # Language, framework, DB detection
│   ├── setup_assistant.py   # Extract setup commands from README
│   ├── dependency_graph.py  # File import relationship mapping
│   └── impact_analysis.py   # Affected files from changed file
├── ml/
│   ├── train.py             # Model training + evaluation pipeline
│   ├── predict.py           # Risk prediction + recommendations
│   ├── model.pkl            # Trained Random Forest (generated)
│   ├── scaler.pkl           # Fitted StandardScaler (generated)
│   └── feature_names.pkl    # Feature list (generated)
├── utils/
│   ├── health.py            # Health score calculator
│   └── report.py            # CSV export
├── frontend/
│   └── src/
│       ├── pages/           # Landing, Login, Signup, AppPage, Dashboard
│       ├── components/      # Overview, Charts, RiskTable, TechStack, SetupGuide, ImpactAnalysis, RepoDiscovery
│       ├── api/client.js    # Axios API client
│       └── context/         # Auth context
├── data/                    # Place NASA defect CSV here
├── .env.example             # Environment variable template
└── requirements.txt         # Python dependencies
```

---

## ⚙️ Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/MIDHULA177/RepoSense-AI_ML-Project.git
cd RepoSense-AI_ML-Project
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your Supabase DATABASE_URL, SECRET_KEY, and GITHUB_TOKEN
```

### 3. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 4. Train the ML model
```bash
python ml/train.py --data data/SoftwareDefectDataset.csv
```

### 5. Start the backend
```bash
py -m uvicorn backend.main:app --reload --port 8000
```

### 6. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

### 7. Open the app
```
http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string (pooler port 6543) |
| `SECRET_KEY` | JWT signing secret — use a long random string |
| `GITHUB_TOKEN` | GitHub PAT — increases API rate limit 60 → 5000/hr |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Login, returns JWT |
| `/api/auth/me` | GET | Get current user |
| `/api/analyze` | POST | Full repository analysis |
| `/api/history` | GET | User's analysis history |
| `/api/history/{id}` | GET | Load saved analysis |
| `/api/history/{id}` | DELETE | Delete analysis |
| `/api/github/search` | GET | Search GitHub repositories |
| `/api/github/trending` | GET | Trending repositories |

---

## 📊 Dashboard Tabs

| Tab | Contents |
|-----|---------|
| Overview | Health gauge, stat cards, score breakdown, languages |
| Charts | Language pie, risk bar, LOC distribution, complexity |
| Risk Table | Sortable/filterable file risk table with insights |
| Recommendations | AI suggestions, risk priority ranking |
| Tech Stack | Languages, frameworks, databases, tools, dependencies |
| Setup Guide | Commands with copy button, env vars, warnings |
| Impact Analysis | Dependency graph stats, affected files |

---

## 📄 License

© 2026 RepoSenseAI · All rights reserved
