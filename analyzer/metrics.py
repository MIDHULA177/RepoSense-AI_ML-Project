import os
from dataclasses import dataclass
from datetime import datetime, timezone

import git


@dataclass
class GitFileMetrics:
    file_path: str
    commit_count: int
    contributor_count: int
    file_age_days: int
    churn: int
    bug_fix_commits: int


BUG_KEYWORDS = {"fix", "bug", "error", "issue", "patch", "defect", "fault", "crash", "fail"}


def _is_bug_fix(message: str) -> bool:
    msg = message.lower()
    return any(kw in msg for kw in BUG_KEYWORDS)


def extract_git_metrics(repo_path: str) -> dict[str, GitFileMetrics]:
    try:
        repo = git.Repo(repo_path)
    except Exception:
        return {}

    file_metrics: dict[str, dict] = {}
    now = datetime.now(timezone.utc)

    for commit in repo.iter_commits(max_count=200):
        committed_dt = commit.committed_datetime
        if committed_dt.tzinfo is None:
            committed_dt = committed_dt.replace(tzinfo=timezone.utc)

        is_fix = _is_bug_fix(commit.message)

        try:
            stats = commit.stats.files
        except Exception:
            continue

        for file_path, file_stat in stats.items():
            if file_path not in file_metrics:
                file_metrics[file_path] = {
                    "commits": set(),
                    "contributors": set(),
                    "oldest_date": committed_dt,
                    "churn": 0,
                    "bug_fix_commits": 0,
                }

            fm = file_metrics[file_path]
            fm["commits"].add(commit.hexsha)
            fm["contributors"].add(commit.author.email)
            fm["churn"] += file_stat.get("insertions", 0) + file_stat.get("deletions", 0)
            if is_fix:
                fm["bug_fix_commits"] += 1
            if committed_dt < fm["oldest_date"]:
                fm["oldest_date"] = committed_dt

    result = {}
    for file_path, fm in file_metrics.items():
        age_days = (now - fm["oldest_date"]).days
        result[file_path] = GitFileMetrics(
            file_path=file_path,
            commit_count=len(fm["commits"]),
            contributor_count=len(fm["contributors"]),
            file_age_days=age_days,
            churn=fm["churn"],
            bug_fix_commits=fm["bug_fix_commits"],
        )

    return result


def merge_metrics(repo_path: str, file_metrics_list: list, git_metrics: dict) -> list[dict]:
    merged = []
    for fm in file_metrics_list:
        rel_path = os.path.relpath(fm.file_path, repo_path).replace("\\", "/")
        gm = git_metrics.get(rel_path, None)

        merged.append({
            "file_path": rel_path,
            "extension": fm.extension,
            "loc": fm.loc,
            "blank_lines": fm.blank_lines,
            "comment_lines": fm.comment_lines,
            "code_lines": fm.code_lines,
            "comment_ratio": fm.comment_ratio,
            "function_count": fm.function_count,
            "class_count": fm.class_count,
            "avg_complexity": fm.avg_complexity,
            "maintainability_index": fm.maintainability_index,
            "commit_count": gm.commit_count if gm else 0,
            "contributor_count": gm.contributor_count if gm else 0,
            "file_age_days": gm.file_age_days if gm else 0,
            "churn": gm.churn if gm else 0,
            "bug_fix_commits": gm.bug_fix_commits if gm else 0,
        })
    return merged
