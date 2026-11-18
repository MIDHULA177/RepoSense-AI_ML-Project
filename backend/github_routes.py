from fastapi import APIRouter, HTTPException, Query, Depends
from github import Github
from backend.auth import get_current_user
from backend.database import User

router = APIRouter(prefix="/github")


def _repo_to_dict(repo) -> dict:
    try:
        lang = repo.language or ""
    except Exception:
        lang = ""
    return {
        "full_name": repo.full_name,
        "name": repo.name,
        "owner": repo.owner.login,
        "description": repo.description or "",
        "url": repo.html_url,
        "stars": repo.stargazers_count,
        "forks": repo.forks_count,
        "language": lang,
        "topics": repo.get_topics() if hasattr(repo, "get_topics") else [],
        "updated_at": str(repo.updated_at.date()) if repo.updated_at else "",
        "open_issues": repo.open_issues_count,
    }


@router.get("/search")
def search_repos(
    q: str = Query(..., min_length=1),
    language: str = Query(default=""),
    sort: str = Query(default="stars"),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=12, le=30),
    token: str = Query(default=""),
    current_user: User = Depends(get_current_user),
):
    try:
        g = Github(token) if token else Github()
        query = q.strip()
        if language:
            query += f" language:{language}"

        results = g.search_repositories(query=query, sort=sort, order="desc")
        total = min(results.totalCount, 100)

        start = (page - 1) * per_page
        repos = []
        for repo in results[start: start + per_page]:
            try:
                repos.append(_repo_to_dict(repo))
            except Exception:
                continue

        return {"total": total, "page": page, "per_page": per_page, "repos": repos}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/readme")
def get_readme(
    owner: str = Query(...),
    repo: str = Query(...),
    current_user: User = Depends(get_current_user),
):
    try:
        g = Github()
        gh_repo = g.get_repo(f"{owner}/{repo}")
        content = gh_repo.get_readme()
        import base64
        text = base64.b64decode(content.content).decode("utf-8", errors="replace")
        return {"readme": text}
    except Exception as e:
        raise HTTPException(status_code=404, detail="README not found")


@router.get("/trending")
def trending_repos(
    language: str = Query(default=""),
    current_user: User = Depends(get_current_user),
):
    try:
        g = Github()
        query = "stars:>1000 pushed:>2024-01-01"
        if language:
            query += f" language:{language}"
        results = g.search_repositories(query=query, sort="stars", order="desc")
        repos = []
        for repo in results[:12]:
            try:
                repos.append(_repo_to_dict(repo))
            except Exception:
                continue
        return {"repos": repos}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
