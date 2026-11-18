import os
import json
from dataclasses import dataclass, field

EXT_LANGUAGE = {
    ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript", ".tsx": "TypeScript",
    ".jsx": "JavaScript", ".java": "Java", ".cs": "C#", ".go": "Go", ".rb": "Ruby",
    ".php": "PHP", ".rs": "Rust", ".cpp": "C++", ".c": "C", ".kt": "Kotlin",
    ".swift": "Swift", ".scala": "Scala", ".r": "R", ".m": "MATLAB",
    ".html": "HTML", ".css": "CSS", ".scss": "SCSS", ".sql": "SQL",
    ".sh": "Shell", ".yaml": "YAML", ".yml": "YAML", ".json": "JSON",
    ".xml": "XML", ".md": "Markdown", ".tf": "Terraform", ".dart": "Dart",
}

FRAMEWORK_SIGNALS = {
    "React":      lambda d: "react" in d,
    "Vue":        lambda d: "vue" in d,
    "Angular":    lambda d: "@angular/core" in d,
    "Next.js":    lambda d: "next" in d,
    "Svelte":     lambda d: "svelte" in d,
    "Express":    lambda d: "express" in d,
    "FastAPI":    lambda d: "fastapi" in d,
    "Django":     lambda d: "django" in d,
    "Flask":      lambda d: "flask" in d,
    "Spring":     lambda d: "spring-boot" in d or "springframework" in d,
    "Laravel":    lambda d: "laravel/framework" in d,
    "Rails":      lambda d: "rails" in d,
    "Gin":        lambda d: "gin-gonic/gin" in d,
    "NestJS":     lambda d: "@nestjs/core" in d,
    "Nuxt":       lambda d: "nuxt" in d,
    "Remix":      lambda d: "@remix-run" in d,
    "Astro":      lambda d: "astro" in d,
    "Vite":       lambda d: "vite" in d,
    "Tailwind":   lambda d: "tailwindcss" in d,
    "Prisma":     lambda d: "prisma" in d,
    "SQLAlchemy": lambda d: "sqlalchemy" in d,
    "Celery":     lambda d: "celery" in d,
    "Pandas":     lambda d: "pandas" in d,
    "PyTorch":    lambda d: "torch" in d,
    "TensorFlow": lambda d: "tensorflow" in d,
    "Scikit-learn": lambda d: "scikit-learn" in d,
}

DB_SIGNALS = {
    "PostgreSQL": ["psycopg2", "pg", "postgres", "postgresql"],
    "MySQL":      ["mysql", "pymysql", "mysql2"],
    "MongoDB":    ["pymongo", "mongoose", "mongodb"],
    "SQLite":     ["sqlite", "sqlite3"],
    "Redis":      ["redis", "ioredis"],
    "Supabase":   ["supabase"],
    "Firebase":   ["firebase"],
    "Elasticsearch": ["elasticsearch"],
    "Cassandra":  ["cassandra"],
}

TOOL_FILES = {
    "Docker":       ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
    "GitHub Actions": [".github/workflows"],
    "Kubernetes":   ["k8s", "kubernetes", "helm"],
    "Terraform":    [".tf"],
    "Make":         ["Makefile"],
    "ESLint":       [".eslintrc", ".eslintrc.js", ".eslintrc.json"],
    "Prettier":     [".prettierrc", "prettier.config.js"],
    "Jest":         ["jest.config.js", "jest.config.ts"],
    "Pytest":       ["pytest.ini", "conftest.py"],
    "Webpack":      ["webpack.config.js"],
    "Vite":         ["vite.config.js", "vite.config.ts"],
}


@dataclass
class TechStack:
    languages: dict[str, int] = field(default_factory=dict)   # lang -> file count
    frameworks: list[str] = field(default_factory=list)
    databases: list[str] = field(default_factory=list)
    tools: list[str] = field(default_factory=list)
    dependency_files: list[str] = field(default_factory=list)
    raw_dependencies: list[str] = field(default_factory=list)


def _read_file(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().lower()
    except Exception:
        return ""


def _parse_dependencies(repo_path: str) -> tuple[list[str], list[str]]:
    dep_files_found = []
    all_deps = []

    pkg_json = os.path.join(repo_path, "package.json")
    if os.path.exists(pkg_json):
        dep_files_found.append("package.json")
        try:
            data = json.loads(open(pkg_json, encoding="utf-8", errors="ignore").read())
            deps = list(data.get("dependencies", {}).keys()) + list(data.get("devDependencies", {}).keys())
            all_deps.extend(d.lower() for d in deps)
        except Exception:
            pass

    for fname in ["requirements.txt", "requirements-dev.txt"]:
        fpath = os.path.join(repo_path, fname)
        if os.path.exists(fpath):
            dep_files_found.append(fname)
            content = _read_file(fpath)
            for line in content.splitlines():
                line = line.strip().split("==")[0].split(">=")[0].split("[")[0].strip()
                if line and not line.startswith("#"):
                    all_deps.append(line.lower())

    for fname in ["pom.xml", "build.gradle"]:
        fpath = os.path.join(repo_path, fname)
        if os.path.exists(fpath):
            dep_files_found.append(fname)
            all_deps.append(_read_file(fpath))

    for fname in ["go.mod", "Cargo.toml", "pyproject.toml", "Gemfile"]:
        fpath = os.path.join(repo_path, fname)
        if os.path.exists(fpath):
            dep_files_found.append(fname)
            all_deps.append(_read_file(fpath))

    return dep_files_found, all_deps


def detect_tech_stack(repo_path: str) -> TechStack:
    stack = TechStack()

    # Languages from file extensions
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"}]
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            lang = EXT_LANGUAGE.get(ext)
            if lang:
                stack.languages[lang] = stack.languages.get(lang, 0) + 1

    # Dependencies
    dep_files, all_deps = _parse_dependencies(repo_path)
    stack.dependency_files = dep_files
    dep_blob = " ".join(all_deps)
    stack.raw_dependencies = [d for d in all_deps if len(d) < 60 and d.strip()][:80]

    # Frameworks
    for name, check in FRAMEWORK_SIGNALS.items():
        if check(dep_blob):
            stack.frameworks.append(name)

    # Databases
    for db_name, keywords in DB_SIGNALS.items():
        if any(kw in dep_blob for kw in keywords):
            stack.databases.append(db_name)

    # Tools from file presence
    all_files_flat = []
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules"}]
        for fname in files:
            rel = os.path.relpath(os.path.join(root, fname), repo_path).replace("\\", "/")
            all_files_flat.append(rel.lower())

    for tool, indicators in TOOL_FILES.items():
        for ind in indicators:
            if any(ind.lower() in f for f in all_files_flat):
                if tool not in stack.tools:
                    stack.tools.append(tool)
                break

    return stack
