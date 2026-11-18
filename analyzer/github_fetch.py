import os
import re
import shutil
import tempfile
from dataclasses import dataclass, field
from typing import Optional

import git
from github import Github


@dataclass
class RepoInfo:
    name: str
    owner: str
    description: str
    stars: int
    forks: int
    open_issues: int
    contributors: int
    total_commits: int
    languages: dict
    default_branch: str
    created_at: str
    updated_at: str
    local_path: str
    readme: str = field(default="", repr=False)
    clone_dir: Optional[str] = field(default=None, repr=False)


def parse_github_url(url: str) -> tuple[str, str]:
    url = url.strip().rstrip("/")
    pattern = r"github\.com[/:]([^/]+)/([^/\.]+)"
    match = re.search(pattern, url)
    if not match:
        raise ValueError(f"Invalid GitHub URL: {url}")
    return match.group(1), match.group(2)


def fetch_repo_info(url: str, github_token: Optional[str] = None) -> RepoInfo:
    owner, repo_name = parse_github_url(url)

    g = Github(github_token) if github_token else Github()
    gh_repo = g.get_repo(f"{owner}/{repo_name}")

    try:
        contributors = gh_repo.get_contributors().totalCount
    except Exception:
        contributors = 0

    try:
        commits = gh_repo.get_commits().totalCount
    except Exception:
        commits = 0

    clone_dir = tempfile.mkdtemp(prefix="reposense_")
    clone_url = f"https://github.com/{owner}/{repo_name}.git"

    git.Repo.clone_from(clone_url, clone_dir, depth=100)

    # Fetch README
    readme_text = ""
    try:
        import base64
        content = gh_repo.get_readme()
        readme_text = base64.b64decode(content.content).decode("utf-8", errors="replace")
    except Exception:
        pass

    return RepoInfo(
        name=gh_repo.name,
        owner=owner,
        description=gh_repo.description or "",
        stars=gh_repo.stargazers_count,
        forks=gh_repo.forks_count,
        open_issues=gh_repo.open_issues_count,
        contributors=contributors,
        total_commits=commits,
        languages=gh_repo.get_languages(),
        default_branch=gh_repo.default_branch,
        created_at=str(gh_repo.created_at.date()),
        updated_at=str(gh_repo.updated_at.date()),
        local_path=clone_dir,
        readme=readme_text,
        clone_dir=clone_dir,
    )


def cleanup_repo(repo_info: RepoInfo):
    if repo_info.clone_dir and os.path.exists(repo_info.clone_dir):
        shutil.rmtree(repo_info.clone_dir, ignore_errors=True)
