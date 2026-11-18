import sys
import os
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from analyzer.github_fetch import fetch_repo_info, cleanup_repo
from analyzer.parser import parse_repository
from analyzer.metrics import extract_git_metrics, merge_metrics
from analyzer.tech_stack import detect_tech_stack
from analyzer.setup_assistant import generate_setup_guide
from analyzer.dependency_graph import build_dependency_graph
from analyzer.impact_analysis import analyze_impact_multi
from ml.predict import predict_risk, generate_insights, get_risk_factors, generate_recommendations, summarize_readme
from utils.health import calculate_health
from backend.schemas import (
    AnalyzeRequest, AnalyzeResponse, FileRisk, HealthResult, HealthBreakdown,
    RepoOverview, TechStackResult, SetupGuideResult, ImpactResultItem,
)
from backend.auth import get_current_user
from backend.database import get_db, Analysis, User

router = APIRouter()
_executor = ThreadPoolExecutor(max_workers=4)


def _run_analysis(url: str, github_token: str, changed_files: list):
    """All blocking work in one function — runs in thread pool."""
    repo_info = None
    try:
        repo_info      = fetch_repo_info(url, github_token)
        file_metrics   = parse_repository(repo_info.local_path)
        git_metrics    = extract_git_metrics(repo_info.local_path)
        merged         = merge_metrics(repo_info.local_path, file_metrics, git_metrics)
        predictions    = predict_risk(merged)
        health         = calculate_health(repo_info, predictions)
        tech_stack     = detect_tech_stack(repo_info.local_path)
        setup_guide    = generate_setup_guide(repo_info.local_path)
        dep_graph      = build_dependency_graph(repo_info.local_path, file_metrics)
        impact_results = analyze_impact_multi(changed_files, dep_graph, predictions) if changed_files else []
        return repo_info, predictions, health, tech_stack, setup_guide, impact_results, dep_graph.edges
    except Exception:
        if repo_info:
            cleanup_repo(repo_info)
        raise


def _build_response(repo_info, predictions, health, tech_stack, setup_guide, impact_results, dep_edges) -> AnalyzeResponse:
    file_risks = [
        FileRisk(
            file_path=p.get("file_path", ""),
            extension=p.get("extension", ""),
            loc=int(p.get("loc", 0)),
            avg_complexity=float(p.get("avg_complexity", 0)),
            commit_count=int(p.get("commit_count", 0)),
            contributor_count=int(p.get("contributor_count", 0)),
            churn=int(p.get("churn", 0)),
            bug_probability=float(p.get("bug_probability", 0)),
            risk_level=p.get("risk_level", "Low"),
            insight=generate_insights(p),
            risk_factors=get_risk_factors(p),
        )
        for p in predictions
    ]

    breakdown = HealthBreakdown(
        bug_risk=health.breakdown.get("Bug Risk", 0),
        commit_activity=health.breakdown.get("Commit Activity", 0),
        contributors=health.breakdown.get("Contributors", 0),
        documentation=health.breakdown.get("Documentation", 0),
        code_complexity=health.breakdown.get("Code Complexity", 0),
    )

    ts = TechStackResult(
        languages=tech_stack.languages,
        frameworks=tech_stack.frameworks,
        databases=tech_stack.databases,
        tools=tech_stack.tools,
        dependency_files=tech_stack.dependency_files,
        raw_dependencies=tech_stack.raw_dependencies,
    ) if tech_stack else None

    sg = SetupGuideResult(
        prerequisites=setup_guide.prerequisites,
        install_commands=setup_guide.install_commands,
        run_commands=setup_guide.run_commands,
        build_commands=setup_guide.build_commands,
        env_variables=setup_guide.env_variables,
        warnings=setup_guide.warnings,
        has_docker=setup_guide.has_docker,
        has_tests=setup_guide.has_tests,
        test_commands=setup_guide.test_commands,
    ) if setup_guide else None

    impact = [
        ImpactResultItem(
            changed_file=r.changed_file,
            direct_dependents=r.direct_dependents,
            indirect_dependents=r.indirect_dependents,
            high_risk_affected=r.high_risk_affected,
            actions=r.actions,
            total_affected=r.total_affected,
        )
        for r in impact_results
    ]

    return AnalyzeResponse(
        repo=RepoOverview(
            name=repo_info.name,
            owner=repo_info.owner,
            description=repo_info.description,
            stars=repo_info.stars,
            forks=repo_info.forks,
            open_issues=repo_info.open_issues,
            contributors=repo_info.contributors,
            total_commits=repo_info.total_commits,
            languages=repo_info.languages,
            created_at=repo_info.created_at,
            updated_at=repo_info.updated_at,
        ),
        health=HealthResult(total=health.total, grade=health.grade, breakdown=breakdown, badges=health.badges),
        predictions=file_risks,
        total_files=len(file_risks),
        high_risk_count=sum(1 for f in file_risks if f.risk_level == "High"),
        medium_risk_count=sum(1 for f in file_risks if f.risk_level == "Medium"),
        low_risk_count=sum(1 for f in file_risks if f.risk_level == "Low"),
        recommendations=generate_recommendations([p.__dict__ if hasattr(p, "__dict__") else p for p in predictions]),
        tech_stack=ts,
        setup_guide=sg,
        impact_analysis=impact,
        dependency_edges=dep_edges[:500],
        readme_summary=summarize_readme(repo_info.readme, predictions),
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repository(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        loop = asyncio.get_event_loop()
        repo_info, predictions, health, tech_stack, setup_guide, impact_results, dep_edges = \
            await loop.run_in_executor(
                _executor,
                _run_analysis,
                request.url.strip(),
                request.github_token,
                request.changed_files,
            )

        response = _build_response(repo_info, predictions, health, tech_stack, setup_guide, impact_results, dep_edges)

        analysis = Analysis(
            user_id=current_user.id,
            repo_url=request.url.strip(),
            repo_name=repo_info.name,
            repo_owner=repo_info.owner,
            health_score=health.total,
            health_grade=health.grade,
            total_files=response.total_files,
            high_risk=response.high_risk_count,
            medium_risk=response.medium_risk_count,
            low_risk=response.low_risk_count,
            result_json=response.model_dump_json(),
            tech_stack_json=json.dumps(tech_stack.__dict__) if tech_stack else None,
            setup_guide_json=json.dumps(setup_guide.__dict__) if setup_guide else None,
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        cleanup_repo(repo_info)
        return response

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).order_by(Analysis.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "repo_url": a.repo_url,
            "repo_name": a.repo_name,
            "repo_owner": a.repo_owner,
            "health_score": a.health_score,
            "health_grade": a.health_grade,
            "total_files": a.total_files,
            "high_risk": a.high_risk,
            "medium_risk": a.medium_risk,
            "low_risk": a.low_risk,
            "created_at": str(a.created_at),
        }
        for a in analyses
    ]


@router.get("/history/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return json.loads(analysis.result_json)


@router.delete("/history/{analysis_id}")
def delete_analysis(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    db.delete(analysis)
    db.commit()
    return {"message": "Deleted"}
