# RepoSense AI 🔍

Intelligent Software Repository Analyzer using Machine Learning.

## Setup

```bash
pip install -r requirements.txt
```

## Step 1 — Train the Model

1. Download a defect dataset from Kaggle (NASA PROMISE: KC1, KC2, JM1, etc.)
2. Save it to `data/defects.csv`
3. Run:

```bash
python ml/train.py --data data/defects.csv
```

Expected output:
- `ml/model.pkl` — trained Random Forest
- `ml/scaler.pkl` — fitted StandardScaler
- `ml/feature_names.pkl` — feature list

## Step 2 — Launch the App

```bash
streamlit run app/app.py
```

## Step 3 — Analyze a Repository

1. Paste a public GitHub URL (e.g. `https://github.com/pallets/flask`)
2. Click **Analyze**
3. View predictions, health score, and AI insights

## Folder Structure

```
RepoSense AI/
├── app/
│   ├── app.py          # Streamlit entry point
│   └── dashboard.py    # All chart/UI components
├── analyzer/
│   ├── github_fetch.py # Clone + GitHub API metadata
│   ├── parser.py       # Code metrics (LOC, complexity, etc.)
│   └── metrics.py      # Git history metrics (churn, commits)
├── ml/
│   ├── train.py        # Model training pipeline
│   ├── predict.py      # Prediction + AI insights
│   └── model.pkl       # (generated after training)
├── utils/
│   ├── health.py       # Health score calculator
│   └── report.py       # CSV/PDF export
├── data/               # Place your Kaggle CSV here
├── reports/            # Generated reports saved here
└── requirements.txt
```

## Dataset

Recommended Kaggle datasets:
- [NASA MDP Defect Dataset](https://www.kaggle.com/datasets/semustafacevik/software-defect-prediction)
- Search: "software defect prediction PROMISE"

Required column: `defects` (0/1 or True/False)
