import os
import re
from dataclasses import dataclass, field


@dataclass
class DependencyGraph:
    nodes: list[str] = field(default_factory=list)           # all file paths
    edges: list[dict] = field(default_factory=list)          # {from, to}
    adjacency: dict[str, list[str]] = field(default_factory=dict)  # file -> files it imports
    reverse: dict[str, list[str]] = field(default_factory=dict)    # file -> files that import it


def _extract_python_imports(source: str, file_path: str, all_files: set[str]) -> list[str]:
    imports = []
    base_dir = os.path.dirname(file_path)

    # from x import y  /  import x
    patterns = [
        r"^from\s+([\w.]+)\s+import",
        r"^import\s+([\w.]+)",
    ]
    for pat in patterns:
        for match in re.finditer(pat, source, re.MULTILINE):
            module = match.group(1)
            # Convert module path to file path
            rel = module.replace(".", "/")
            candidates = [f"{rel}.py", f"{rel}/__init__.py"]
            for c in candidates:
                if c in all_files:
                    imports.append(c)
    return imports


def _extract_js_imports(source: str, file_path: str, all_files: set[str]) -> list[str]:
    imports = []
    base_dir = os.path.dirname(file_path).replace("\\", "/")

    patterns = [
        r'(?:import|from)\s+["\'](\.[^"\']+)["\']',
        r'require\(["\'](\.[^"\']+)["\']\)',
    ]
    for pat in patterns:
        for match in re.finditer(pat, source):
            raw = match.group(1)
            # Resolve relative path
            resolved = os.path.normpath(os.path.join(base_dir, raw)).replace("\\", "/")
            candidates = [
                resolved,
                resolved + ".js", resolved + ".ts",
                resolved + ".jsx", resolved + ".tsx",
                resolved + "/index.js", resolved + "/index.ts",
            ]
            for c in candidates:
                if c in all_files:
                    imports.append(c)
                    break
    return imports


def _extract_java_imports(source: str, all_files: set[str]) -> list[str]:
    imports = []
    for match in re.finditer(r"^import\s+([\w.]+);", source, re.MULTILINE):
        module = match.group(1)
        rel = module.replace(".", "/") + ".java"
        if rel in all_files:
            imports.append(rel)
    return imports


def build_dependency_graph(repo_path: str, file_metrics: list) -> DependencyGraph:
    graph = DependencyGraph()

    # Build set of all relative file paths
    all_files = {m.file_path.replace("\\", "/") if hasattr(m, "file_path") else m["file_path"] for m in file_metrics}
    # Normalize to relative paths
    all_files_rel = set()
    for f in all_files:
        rel = os.path.relpath(f, repo_path).replace("\\", "/") if os.path.isabs(f) else f
        all_files_rel.add(rel)

    graph.nodes = sorted(all_files_rel)

    for node in graph.nodes:
        graph.adjacency[node] = []
        graph.reverse[node] = []

    for node in graph.nodes:
        abs_path = os.path.join(repo_path, node)
        try:
            with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
                source = f.read()
        except Exception:
            continue

        ext = os.path.splitext(node)[1].lower()
        if ext == ".py":
            deps = _extract_python_imports(source, node, all_files_rel)
        elif ext in {".js", ".ts", ".jsx", ".tsx"}:
            deps = _extract_js_imports(source, node, all_files_rel)
        elif ext == ".java":
            deps = _extract_java_imports(source, all_files_rel)
        else:
            continue

        for dep in set(deps):
            if dep != node and dep in all_files_rel:
                graph.adjacency[node].append(dep)
                graph.reverse[dep].append(node)
                graph.edges.append({"from": node, "to": dep})

    return graph
