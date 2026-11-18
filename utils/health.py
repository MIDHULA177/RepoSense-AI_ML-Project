from dataclasses import dataclass


@dataclass
class HealthScore:
    total: int
    grade: str
    breakdown: dict[str, int]
    badges: list[dict]


def calculate_health(repo_info, predictions: list[dict]) -> HealthScore:
    scores = {}

    # 1. Bug Risk Score (30 pts)
    if predictions:
        high = sum(1 for p in predictions if p["risk_level"] == "High")
        ratio = high / len(predictions)
        scores["Bug Risk"] = max(0, int(30 * (1 - ratio * 2)))
    else:
        scores["Bug Risk"] = 15

    # 2. Commit Activity (20 pts)
    commits = getattr(repo_info, "total_commits", 0)
    if commits >= 500:
        scores["Commit Activity"] = 20
    elif commits >= 100:
        scores["Commit Activity"] = 15
    elif commits >= 20:
        scores["Commit Activity"] = 10
    else:
        scores["Commit Activity"] = 5

    # 3. Contributor Count (15 pts)
    contributors = getattr(repo_info, "contributors", 0)
    if contributors >= 10:
        scores["Contributors"] = 15
    elif contributors >= 3:
        scores["Contributors"] = 10
    else:
        scores["Contributors"] = 5

    # 4. Documentation (20 pts)
    doc_files = sum(
        1 for p in predictions
        if any(p["file_path"].lower().endswith(ext) for ext in [".md", ".rst", ".txt"])
    )
    avg_comment_ratio = (
        sum(p.get("comment_ratio", 0) for p in predictions) / len(predictions)
        if predictions else 0
    )
    doc_score = min(20, doc_files * 5 + int(avg_comment_ratio * 40))
    scores["Documentation"] = doc_score

    # 5. Code Complexity (15 pts)
    avg_complexity = (
        sum(p.get("avg_complexity", 1) for p in predictions) / len(predictions)
        if predictions else 1
    )
    if avg_complexity <= 2:
        scores["Code Complexity"] = 15
    elif avg_complexity <= 5:
        scores["Code Complexity"] = 10
    elif avg_complexity <= 10:
        scores["Code Complexity"] = 5
    else:
        scores["Code Complexity"] = 0

    total = sum(scores.values())

    if total >= 85:
        grade = "Excellent"
    elif total >= 70:
        grade = "Good"
    elif total >= 50:
        grade = "Fair"
    else:
        grade = "Poor"

    badges = [
        {"label": "Active Development", "ok": scores["Commit Activity"] >= 15},
        {"label": "Good Documentation", "ok": scores["Documentation"] >= 12},
        {"label": "Low Predicted Risk", "ok": scores["Bug Risk"] >= 20},
        {"label": "Low Code Complexity", "ok": scores["Code Complexity"] >= 10},
        {"label": "Good Contributor Base", "ok": scores["Contributors"] >= 10},
    ]

    return HealthScore(total=min(total, 100), grade=grade, breakdown=scores, badges=badges)
