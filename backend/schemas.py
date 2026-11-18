from pydantic import BaseModel
from typing import Optional


class AnalyzeRequest(BaseModel):
    url: str
    github_token: Optional[str] = None
    changed_files: list[str] = []   # for impact analysis


class FileRisk(BaseModel):
    file_path: str
    extension: str
    loc: int
    avg_complexity: float
    commit_count: int
    contributor_count: int
    churn: int
    bug_probability: float
    risk_level: str
    insight: str
    risk_factors: list[dict] = []


class HealthBreakdown(BaseModel):
    bug_risk: int
    commit_activity: int
    contributors: int
    documentation: int
    code_complexity: int


class HealthResult(BaseModel):
    total: int
    grade: str
    breakdown: HealthBreakdown
    badges: list[dict]


class RepoOverview(BaseModel):
    name: str
    owner: str
    description: str
    stars: int
    forks: int
    open_issues: int
    contributors: int
    total_commits: int
    languages: dict
    created_at: str
    updated_at: str


class TechStackResult(BaseModel):
    languages: dict
    frameworks: list[str]
    databases: list[str]
    tools: list[str]
    dependency_files: list[str]
    raw_dependencies: list[str]


class SetupGuideResult(BaseModel):
    prerequisites: list[str]
    install_commands: list[str]
    run_commands: list[str]
    build_commands: list[str]
    env_variables: list[str]
    warnings: list[str]
    has_docker: bool
    has_tests: bool
    test_commands: list[str]


class ImpactResultItem(BaseModel):
    changed_file: str
    direct_dependents: list[str]
    indirect_dependents: list[str]
    high_risk_affected: list[str]
    actions: list[str]
    total_affected: int


class AnalyzeResponse(BaseModel):
    repo: RepoOverview
    health: HealthResult
    predictions: list[FileRisk]
    total_files: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    recommendations: list[str] = []
    tech_stack: Optional[TechStackResult] = None
    setup_guide: Optional[SetupGuideResult] = None
    impact_analysis: list[ImpactResultItem] = []
    dependency_edges: list[dict] = []
    readme_summary: Optional[dict] = None
