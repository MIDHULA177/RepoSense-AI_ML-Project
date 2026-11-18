import os
import re
import warnings

warnings.filterwarnings("ignore", category=SyntaxWarning)

import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "feature_names.pkl")

RISK_LABELS = {0: "Low", 1: "High"}


def _load_artifacts():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("model.pkl not found. Run ml/train.py first.")
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_names = joblib.load(FEATURES_PATH)
    return model, scaler, feature_names


def _build_feature_row(file_data: dict, feature_names: list) -> list:
    row = []
    for feat in feature_names:
        row.append(float(file_data.get(feat, 0)))
    return row


def predict_risk(merged_data: list[dict]) -> list[dict]:
    model, scaler, feature_names = _load_artifacts()

    rows = [_build_feature_row(d, feature_names) for d in merged_data]
    X = pd.DataFrame(rows, columns=feature_names)
    X_scaled = scaler.transform(X)

    predictions = model.predict(X_scaled)
    probabilities = model.predict_proba(X_scaled)[:, 1]

    results = []
    for i, file_data in enumerate(merged_data):
        prob = float(probabilities[i])
        if prob >= 0.65:
            risk = "High"
        elif prob >= 0.35:
            risk = "Medium"
        else:
            risk = "Low"

        results.append({
            **file_data,
            "bug_probability": round(prob, 4),
            "risk_level": risk,
        })

    return sorted(results, key=lambda x: x["bug_probability"], reverse=True)


RISK_FACTORS = [
    ("churn",             lambda v: v > 500,  "High code churn ({v} lines changed)"),
    ("contributor_count", lambda v: v > 5,    "Many contributors ({v} developers modified this file)"),
    ("avg_complexity",    lambda v: v > 5,    "High cyclomatic complexity ({v})"),
    ("commit_count",      lambda v: v > 30,   "Frequently modified ({v} commits)"),
    ("comment_ratio",     lambda v: v < 0.05, "Low documentation (comment ratio {v:.0%})"),
    ("loc",               lambda v: v > 500,  "Large file size ({v} lines)"),
    ("bug_fix_commits",   lambda v: v > 5,    "Many bug-fix commits ({v} fixes)"),
    ("file_age_days",     lambda v: v > 730,  "Old file ({v} days since creation)"),
]


def generate_insights(file_data: dict) -> str:
    reasons = get_risk_factors(file_data)
    name = file_data.get("file_path", "This file").split("/")[-1]
    risk = file_data.get("risk_level", "Unknown")
    if not reasons:
        return f"{name} has {risk.lower()} bug risk with no major warning signs."
    reason_str = ", ".join(r["label"] for r in reasons)
    return f"{name} has {risk.lower()} bug risk due to: {reason_str}."


def get_risk_factors(file_data: dict) -> list[dict]:
    factors = []
    for key, check, template in RISK_FACTORS:
        val = file_data.get(key, 0)
        if check(val):
            factors.append({"key": key, "label": template.format(v=val), "value": val})
    return factors


def summarize_readme(readme: str, predictions: list[dict] = None, repo_info: dict = None) -> dict:
    if not readme or not readme.strip():
        return {"available": False}

    lines = readme.splitlines()
    readme_lower = readme.lower()

    # --- Full project summary: collect first meaningful paragraphs ---
    summary_sentences = []
    repo_title = ''
    found_title = False
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if s.startswith('#'):
            if not found_title:
                repo_title = re.sub(r'^#+\s*', '', s).strip()
            found_title = True
            continue
        if not found_title:
            continue
        # skip badges, images, pure links
        if re.match(r'^(!\[|<|\[!)', s) or re.match(r'^\[.*\]\(.*\)$', s):
            continue
        if len(s) > 20:
            clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', s)  # strip md links
            clean = re.sub(r'`([^`]+)`', r'\1', clean)            # strip code ticks
            clean = re.sub(r'[*_]{1,2}([^*_]+)[*_]{1,2}', r'\1', clean)  # strip bold/italic
            summary_sentences.append(clean)
        if len(summary_sentences) >= 5:
            break
    project_summary = ' '.join(summary_sentences).strip()
    if not project_summary and repo_title:
        project_summary = f"{repo_title} — extracted from repository README."
    if not project_summary:
        project_summary = next(
            (l.strip() for l in lines if l.strip() and not l.strip().startswith(('#', '!', '[', '<'))), ''
        )

    # --- Key features: bullet points ---
    features = []
    for line in lines:
        s = line.strip()
        if re.match(r'^[-*+]\s+.{10,}', s):
            clean = re.sub(r'^[-*+]\s+', '', s)
            clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
            features.append(clean)
        if len(features) >= 6:
            break

    # --- Tech stack ---
    tech_keywords = [
        "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node",
        "FastAPI", "Flask", "Django", "Express", "Spring", "Rails",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure",
        "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy",
        "GraphQL", "REST", "gRPC", "Kafka", "RabbitMQ",
    ]
    detected_tech = [t for t in tech_keywords if t.lower() in readme_lower]

    # --- Categories ---
    purpose_map = {
        "web framework": ["web", "http", "server", "api", "rest", "endpoint"],
        "machine learning": ["model", "train", "predict", "neural", "ml", "ai", "dataset"],
        "data processing": ["data", "pipeline", "etl", "transform", "csv", "dataframe"],
        "CLI tool": ["command", "cli", "terminal", "shell", "argument"],
        "library / SDK": ["library", "sdk", "package", "module", "import"],
        "DevOps / infra": ["deploy", "docker", "kubernetes", "ci", "cd", "infrastructure"],
        "mobile app": ["android", "ios", "mobile", "flutter", "react native"],
        "database": ["database", "query", "schema", "migration", "orm"],
    }
    categories = [cat for cat, kws in purpose_map.items() if any(k in readme_lower for k in kws)]

    # --- ML stats ---
    ml_summary = {}
    if predictions:
        high  = sum(1 for p in predictions if p.get("risk_level") == "High")
        med   = sum(1 for p in predictions if p.get("risk_level") == "Medium")
        total = len(predictions)
        avg_complexity = round(sum(p.get("avg_complexity", 0) for p in predictions) / max(total, 1), 2)
        top_risky = [p["file_path"].split("/")[-1] for p in predictions if p.get("risk_level") == "High"][:3]
        ml_summary = {
            "total_files": total,
            "high_risk": high,
            "medium_risk": med,
            "avg_complexity": avg_complexity,
            "top_risky_files": top_risky,
            "overall_risk": "High" if high > total * 0.3 else "Medium" if high > 0 else "Low",
        }

    return {
        "available": True,
        "project_summary": project_summary,
        "features": features,
        "detected_tech": detected_tech[:10],
        "categories": categories[:4],
        "ml_analysis": ml_summary,
    }


def generate_recommendations(predictions: list[dict]) -> list[str]:
    recs = []
    high = [p for p in predictions if p["risk_level"] == "High"]
    med  = [p for p in predictions if p["risk_level"] == "Medium"]

    if high:
        names = ", ".join(p["file_path"].split("/")[-1] for p in high[:3])
        recs.append(f"Review high-risk files first: {names}")

    complex_files = sorted(predictions, key=lambda p: p.get("avg_complexity", 0), reverse=True)[:3]
    if complex_files and complex_files[0].get("avg_complexity", 0) > 5:
        names = ", ".join(p["file_path"].split("/")[-1] for p in complex_files)
        recs.append(f"Refactor highly complex functions in: {names}")

    high_churn = [p for p in predictions if p.get("churn", 0) > 500]
    if high_churn:
        names = ", ".join(p["file_path"].split("/")[-1] for p in high_churn[:3])
        recs.append(f"Monitor files with high code churn: {names}")

    low_docs = [p for p in predictions if p.get("comment_ratio", 1) < 0.05 and p["risk_level"] != "Low"]
    if low_docs:
        recs.append(f"Improve documentation in {len(low_docs)} under-documented high/medium risk files")

    if high:
        recs.append(f"Increase test coverage for {len(high)} high-risk files")

    multi_contrib = [p for p in predictions if p.get("contributor_count", 0) > 5]
    if multi_contrib:
        names = ", ".join(p["file_path"].split("/")[-1] for p in multi_contrib[:2])
        recs.append(f"Coordinate ownership for files with many contributors: {names}")

    if not recs:
        recs.append("Repository looks healthy. Keep maintaining good coding practices.")

    return recs
