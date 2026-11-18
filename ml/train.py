"""
Train bug prediction model on a Kaggle defect dataset.

Run:
    python ml/train.py --data data/SoftwareDefectDataset.csv
"""

import argparse
import os
import warnings

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    f1_score, precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

MODEL_PATH    = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH   = os.path.join(os.path.dirname(__file__), "scaler.pkl")
FEATURES_PATH = os.path.join(os.path.dirname(__file__), "feature_names.pkl")

FEATURE_MAP = {
    "LOC":           "loc",
    "CYCLO":         "avg_complexity",
    "LENGTH":        "code_lines",
    "VOLUME":        "maintainability_index",
    "DIFFICULTY":    "churn",
    "INT_FAN_IN":    "contributor_count",
    "INT_FAN_OUT":   "commit_count",
    "NUM_OPERATORS": "function_count",
    "NUM_OPERANDS":  "class_count",
    "BRANCH_COUNT":  "file_age_days",
}

LABEL_COL = "DEFECT_LABEL"


def load_dataset(path: str):
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()

    if LABEL_COL not in df.columns:
        raise ValueError(f"Label column '{LABEL_COL}' not found. Columns: {list(df.columns)}")

    y = df[LABEL_COL].astype(int)
    feature_cols = [c for c in FEATURE_MAP if c in df.columns]
    if not feature_cols:
        raise ValueError(f"No matching feature columns found. Expected: {list(FEATURE_MAP.keys())}")

    X = df[feature_cols].copy().rename(columns=FEATURE_MAP).fillna(0)

    print(f"\n{'='*55}")
    print(f"  Dataset loaded: {len(X)} samples | {len(X.columns)} features")
    print(f"  Features: {list(X.columns)}")
    print(f"  Class distribution:")
    vc = y.value_counts()
    for label, count in vc.items():
        pct = count / len(y) * 100
        print(f"    {'Bug' if label == 1 else 'No Bug':8s} ({label}): {count:5d} ({pct:.1f}%)")
    print(f"{'='*55}\n")
    return X, y


def print_metrics(name: str, y_true, y_pred, y_prob=None):
    acc  = accuracy_score(y_true, y_pred)
    f1   = f1_score(y_true, y_pred, zero_division=0)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec  = recall_score(y_true, y_pred, zero_division=0)
    cm   = confusion_matrix(y_true, y_pred)

    print(f"\n{'─'*55}")
    print(f"  {name} — Test Set Metrics")
    print(f"{'─'*55}")
    print(f"  Accuracy  : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    if y_prob is not None:
        auc = roc_auc_score(y_true, y_prob)
        print(f"  ROC-AUC   : {auc:.4f}")
    print(f"\n  Confusion Matrix:")
    print(f"                 Predicted")
    print(f"                 No Bug  Bug")
    print(f"  Actual No Bug  {cm[0][0]:5d}  {cm[0][1]:5d}")
    print(f"  Actual Bug     {cm[1][0]:5d}  {cm[1][1]:5d}")
    print(f"\n  Classification Report:")
    print(classification_report(y_true, y_pred, target_names=["No Bug", "Bug"]))
    return acc, f1


def compare_models(X_train, y_train, X_test, y_test):
    print(f"\n{'='*55}")
    print("  Model Comparison (Train → Test Split)")
    print(f"{'='*55}")

    candidates = {
        "Random Forest":      RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42),
        "XGBoost":            XGBClassifier(n_estimators=200, eval_metric="logloss", random_state=42),
        "Decision Tree":      DecisionTreeClassifier(class_weight="balanced", random_state=42),
        "Logistic Regression": LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}

    print(f"\n  {'Model':<25} {'CV F1':>8} {'CV AUC':>8} {'Test Acc':>10} {'Test F1':>8}")
    print(f"  {'─'*25} {'─'*8} {'─'*8} {'─'*10} {'─'*8}")

    for name, model in candidates.items():
        cv_f1  = cross_val_score(model, X_train, y_train, cv=cv, scoring="f1").mean()
        cv_auc = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc").mean()

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        test_acc = accuracy_score(y_test, y_pred)
        test_f1  = f1_score(y_test, y_pred, zero_division=0)

        print(f"  {name:<25} {cv_f1:>8.4f} {cv_auc:>8.4f} {test_acc:>10.4f} {test_f1:>8.4f}")
        results[name] = {"cv_f1": cv_f1, "test_f1": test_f1, "test_acc": test_acc}

    best = max(results, key=lambda k: results[k]["cv_f1"])
    print(f"\n  Best by CV F1: {best} ({results[best]['cv_f1']:.4f})")
    return results


def tune_random_forest(X_train, y_train) -> RandomForestClassifier:
    print(f"\n{'='*55}")
    print("  Tuning Random Forest (GridSearchCV 5-Fold)")
    print(f"{'='*55}")

    params = {
        "n_estimators":      [100, 200],
        "max_depth":         [None, 10, 20],
        "min_samples_split": [2, 5],
        "class_weight":      ["balanced"],
    }
    grid = GridSearchCV(
        RandomForestClassifier(random_state=42),
        params,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="f1",
        n_jobs=-1,
        verbose=0,
    )
    grid.fit(X_train, y_train)
    print(f"  Best params : {grid.best_params_}")
    print(f"  Best CV F1  : {grid.best_score_:.4f}")
    return grid.best_estimator_


def train(data_path: str):
    X, y = load_dataset(data_path)

    # ── 1. Train/Test Split (80/20 stratified) ──
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {len(X_train)} samples | Test: {len(X_test)} samples (80/20 split)")

    # ── 2. Scale ──
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X.columns)
    X_test_scaled  = pd.DataFrame(scaler.transform(X_test),      columns=X.columns)

    # ── 3. SMOTE on train only (never on test) ──
    X_res, y_res = SMOTE(random_state=42).fit_resample(X_train_scaled, y_train)
    print(f"  After SMOTE (train only): {pd.Series(y_res).value_counts().to_dict()}")

    # ── 4. Compare all models ──
    compare_models(X_res, y_res, X_test_scaled, y_test)

    # ── 5. Tune Random Forest ──
    final_model = tune_random_forest(X_res, y_res)

    # ── 6. Final evaluation on held-out test set ──
    final_model.fit(X_res, y_res)
    y_pred = final_model.predict(X_test_scaled)
    y_prob = final_model.predict_proba(X_test_scaled)[:, 1]

    print(f"\n{'='*55}")
    print("  FINAL MODEL — Honest Test Set Evaluation")
    print(f"{'='*55}")
    acc, f1 = print_metrics("Tuned Random Forest", y_test, y_pred, y_prob)

    # ── 7. Feature importance ──
    importances = pd.Series(final_model.feature_importances_, index=X.columns)
    importances = importances.sort_values(ascending=False)
    print(f"\n  Feature Importances:")
    for feat, imp in importances.items():
        bar = "█" * int(imp * 40)
        print(f"  {feat:<30} {imp:.4f} {bar}")

    # ── 8. Save artifacts ──
    joblib.dump(final_model, MODEL_PATH)
    joblib.dump(scaler,      SCALER_PATH)
    joblib.dump(list(X.columns), FEATURES_PATH)

    print(f"\n{'='*55}")
    print(f"  ✓ Model saved    → {MODEL_PATH}")
    print(f"  ✓ Scaler saved   → {SCALER_PATH}")
    print(f"  ✓ Features saved → {FEATURES_PATH}")
    print(f"\n  Final Test Accuracy : {acc*100:.2f}%")
    print(f"  Final Test F1 Score : {f1:.4f}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", required=True, help="Path to defect CSV")
    args = parser.parse_args()
    train(args.data)
