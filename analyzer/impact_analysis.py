from dataclasses import dataclass, field
from analyzer.dependency_graph import DependencyGraph


@dataclass
class ImpactResult:
    changed_file: str
    direct_dependents: list[str] = field(default_factory=list)
    indirect_dependents: list[str] = field(default_factory=list)
    high_risk_affected: list[str] = field(default_factory=list)
    actions: list[str] = field(default_factory=list)
    total_affected: int = 0


def _bfs(start: str, reverse: dict[str, list[str]], depth: int = 3) -> tuple[list[str], list[str]]:
    """BFS on reverse graph. Returns (direct, indirect) dependents."""
    visited = set()
    direct = []
    indirect = []

    queue = [(start, 0)]
    while queue:
        node, level = queue.pop(0)
        for parent in reverse.get(node, []):
            if parent not in visited:
                visited.add(parent)
                if level == 0:
                    direct.append(parent)
                else:
                    indirect.append(parent)
                if level < depth:
                    queue.append((parent, level + 1))

    return direct, indirect


def analyze_impact(
    changed_file: str,
    graph: DependencyGraph,
    predictions: list[dict],
) -> ImpactResult:
    result = ImpactResult(changed_file=changed_file)

    direct, indirect = _bfs(changed_file, graph.reverse)
    result.direct_dependents = direct
    result.indirect_dependents = [f for f in indirect if f not in direct]

    # Map risk levels
    risk_map = {p["file_path"]: p["risk_level"] for p in predictions}
    all_affected = set(direct + result.indirect_dependents)
    result.high_risk_affected = [f for f in all_affected if risk_map.get(f) == "High"]
    result.total_affected = len(all_affected)

    # Generate actions
    if direct:
        result.actions.append(f"Review {len(direct)} directly dependent module(s)")
    if result.indirect_dependents:
        result.actions.append(f"Check {len(result.indirect_dependents)} indirectly affected file(s)")
    if result.high_risk_affected:
        names = ", ".join(f.split("/")[-1] for f in result.high_risk_affected[:3])
        result.actions.append(f"High-risk files affected: {names} — prioritize review")
    if result.total_affected > 0:
        result.actions.append("Run related test suites before merging")
    if not result.actions:
        result.actions.append("No dependents found — change is isolated")

    return result


def analyze_impact_multi(
    changed_files: list[str],
    graph: DependencyGraph,
    predictions: list[dict],
) -> list[ImpactResult]:
    return [analyze_impact(f, graph, predictions) for f in changed_files]
