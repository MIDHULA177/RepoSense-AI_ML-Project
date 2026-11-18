import ast
import os
from dataclasses import dataclass

from radon.complexity import cc_visit
from radon.metrics import mi_visit


SUPPORTED_EXTENSIONS = {".py", ".js", ".ts", ".java", ".c", ".cpp", ".cs", ".go", ".rb"}


@dataclass
class FileMetrics:
    file_path: str
    extension: str
    loc: int
    blank_lines: int
    comment_lines: int
    code_lines: int
    comment_ratio: float
    function_count: int
    class_count: int
    avg_complexity: float
    maintainability_index: float


def _count_lines(source: str) -> tuple[int, int, int]:
    lines = source.splitlines()
    total = len(lines)
    blank = sum(1 for l in lines if not l.strip())
    comment = sum(1 for l in lines if l.strip().startswith(("#", "//", "*", "/*", "<!--")))
    return total, blank, comment


def _python_metrics(source: str) -> tuple[int, int]:
    try:
        tree = ast.parse(source)
        functions = sum(isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) for n in ast.walk(tree))
        classes = sum(isinstance(n, ast.ClassDef) for n in ast.walk(tree))
        return functions, classes
    except SyntaxError:
        return 0, 0


def _generic_metrics(source: str, ext: str) -> tuple[int, int]:
    lines = source.splitlines()
    if ext in {".java", ".js", ".ts", ".c", ".cpp", ".cs", ".go"}:
        func_keywords = ("function ", "def ", "func ", "void ", "int ", "public ", "private ", "protected ")
        functions = sum(1 for l in lines if any(k in l for k in func_keywords) and "{" in l)
        classes = sum(1 for l in lines if l.strip().startswith("class "))
    else:
        functions, classes = 0, 0
    return functions, classes


def _cyclomatic_complexity(source: str) -> float:
    try:
        results = cc_visit(source)
        if results:
            return sum(r.complexity for r in results) / len(results)
    except Exception:
        pass
    return 1.0


def _maintainability(source: str) -> float:
    try:
        return mi_visit(source, multi=True)
    except Exception:
        return 50.0


def parse_file(file_path: str) -> FileMetrics | None:
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        return None

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            source = f.read()
    except Exception:
        return None

    if not source.strip():
        return None

    loc, blank, comment = _count_lines(source)
    code_lines = loc - blank - comment
    comment_ratio = round(comment / loc, 4) if loc > 0 else 0.0

    if ext == ".py":
        functions, classes = _python_metrics(source)
        complexity = _cyclomatic_complexity(source)
        mi = _maintainability(source)
    else:
        functions, classes = _generic_metrics(source, ext)
        complexity = 1.0
        mi = 50.0

    return FileMetrics(
        file_path=file_path,
        extension=ext,
        loc=loc,
        blank_lines=blank,
        comment_lines=comment,
        code_lines=code_lines,
        comment_ratio=comment_ratio,
        function_count=functions,
        class_count=classes,
        avg_complexity=round(complexity, 2),
        maintainability_index=round(mi, 2),
    )


def parse_repository(repo_path: str) -> list[FileMetrics]:
    results = []
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"}]
        for fname in files:
            full_path = os.path.join(root, fname)
            metrics = parse_file(full_path)
            if metrics:
                results.append(metrics)
    return results
