import os
import re
import json
from dataclasses import dataclass, field


@dataclass
class SetupGuide:
    prerequisites: list[str] = field(default_factory=list)
    install_commands: list[str] = field(default_factory=list)
    run_commands: list[str] = field(default_factory=list)
    build_commands: list[str] = field(default_factory=list)
    env_variables: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    has_docker: bool = False
    has_tests: bool = False
    test_commands: list[str] = field(default_factory=list)


def _read(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception:
        return ""


def _extract_code_blocks(markdown: str) -> list[str]:
    """Extract commands from markdown code blocks."""
    blocks = re.findall(r"```(?:bash|sh|shell|cmd|powershell)?\n(.*?)```", markdown, re.DOTALL | re.IGNORECASE)
    commands = []
    for block in blocks:
        for line in block.strip().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and len(line) < 200:
                commands.append(line)
    return commands


def _extract_env_vars(content: str) -> list[str]:
    """Extract env variable names from .env.example or any config."""
    vars_ = []
    for line in content.splitlines():
        line = line.strip()
        if "=" in line and not line.startswith("#") and not line.startswith("//"):
            key = line.split("=")[0].strip()
            if key and key.isupper() or "_" in key:
                vars_.append(key)
    return vars_


def _classify_command(cmd: str) -> str:
    cmd_l = cmd.lower()
    if any(k in cmd_l for k in ["npm install", "pip install", "yarn", "poetry install", "go mod", "bundle install", "cargo build"]):
        return "install"
    if any(k in cmd_l for k in ["npm run dev", "npm start", "python -m", "uvicorn", "flask run", "go run", "rails s", "cargo run"]):
        return "run"
    if any(k in cmd_l for k in ["npm run build", "npm run prod", "python setup.py", "mvn package", "gradle build", "cargo build --release"]):
        return "build"
    if any(k in cmd_l for k in ["npm test", "pytest", "python -m pytest", "go test", "mvn test", "rspec", "cargo test"]):
        return "test"
    return "other"


def _detect_prerequisites(repo_path: str, content_blob: str) -> list[str]:
    prereqs = []
    checks = [
        ("node_modules" in os.listdir(repo_path) or os.path.exists(os.path.join(repo_path, "package.json")), "Node.js & npm"),
        (os.path.exists(os.path.join(repo_path, "requirements.txt")) or os.path.exists(os.path.join(repo_path, "pyproject.toml")), "Python 3.8+"),
        (os.path.exists(os.path.join(repo_path, "go.mod")), "Go"),
        (os.path.exists(os.path.join(repo_path, "Cargo.toml")), "Rust & Cargo"),
        (os.path.exists(os.path.join(repo_path, "pom.xml")), "Java & Maven"),
        (os.path.exists(os.path.join(repo_path, "build.gradle")), "Java & Gradle"),
        (os.path.exists(os.path.join(repo_path, "Gemfile")), "Ruby & Bundler"),
        (os.path.exists(os.path.join(repo_path, "Dockerfile")) or os.path.exists(os.path.join(repo_path, "docker-compose.yml")), "Docker"),
        ("postgresql" in content_blob or "psycopg2" in content_blob, "PostgreSQL"),
        ("mongodb" in content_blob or "pymongo" in content_blob, "MongoDB"),
        ("redis" in content_blob, "Redis"),
    ]
    for condition, name in checks:
        if condition:
            prereqs.append(name)
    return prereqs


def generate_setup_guide(repo_path: str) -> SetupGuide:
    guide = SetupGuide()

    readme_content = ""
    for fname in ["README.md", "README.rst", "README.txt", "readme.md"]:
        fpath = os.path.join(repo_path, fname)
        if os.path.exists(fpath):
            readme_content = _read(fpath)
            break

    env_example = ""
    for fname in [".env.example", ".env.sample", ".env.template"]:
        fpath = os.path.join(repo_path, fname)
        if os.path.exists(fpath):
            env_example = _read(fpath)
            guide.env_variables = _extract_env_vars(env_example)
            break

    # Also scan for env vars in config files
    if not guide.env_variables:
        for fname in ["config.py", "settings.py", "config.js", "config.ts"]:
            fpath = os.path.join(repo_path, fname)
            if os.path.exists(fpath):
                content = _read(fpath)
                vars_ = re.findall(r'os\.environ\.get\(["\'](\w+)["\']', content)
                vars_ += re.findall(r'process\.env\.(\w+)', content)
                guide.env_variables.extend(vars_)
                break

    # Extract commands from README
    readme_commands = _extract_code_blocks(readme_content)
    for cmd in readme_commands:
        kind = _classify_command(cmd)
        if kind == "install" and cmd not in guide.install_commands:
            guide.install_commands.append(cmd)
        elif kind == "run" and cmd not in guide.run_commands:
            guide.run_commands.append(cmd)
        elif kind == "build" and cmd not in guide.build_commands:
            guide.build_commands.append(cmd)
        elif kind == "test" and cmd not in guide.test_commands:
            guide.test_commands.append(cmd)

    # Fallback: infer from known files
    if not guide.install_commands:
        if os.path.exists(os.path.join(repo_path, "package.json")):
            guide.install_commands.append("npm install")
        if os.path.exists(os.path.join(repo_path, "requirements.txt")):
            guide.install_commands.append("pip install -r requirements.txt")
        if os.path.exists(os.path.join(repo_path, "pyproject.toml")):
            guide.install_commands.append("poetry install")
        if os.path.exists(os.path.join(repo_path, "go.mod")):
            guide.install_commands.append("go mod download")
        if os.path.exists(os.path.join(repo_path, "Gemfile")):
            guide.install_commands.append("bundle install")
        if os.path.exists(os.path.join(repo_path, "Cargo.toml")):
            guide.install_commands.append("cargo build")

    # Infer run commands from package.json scripts
    pkg_json_path = os.path.join(repo_path, "package.json")
    if os.path.exists(pkg_json_path):
        try:
            pkg = json.loads(_read(pkg_json_path))
            scripts = pkg.get("scripts", {})
            if "dev" in scripts and "npm run dev" not in guide.run_commands:
                guide.run_commands.append("npm run dev")
            elif "start" in scripts and "npm start" not in guide.run_commands:
                guide.run_commands.append("npm start")
            if "build" in scripts and "npm run build" not in guide.build_commands:
                guide.build_commands.append("npm run build")
            if "test" in scripts and "npm test" not in guide.test_commands:
                guide.test_commands.append("npm test")
        except Exception:
            pass

    # Docker
    guide.has_docker = (
        os.path.exists(os.path.join(repo_path, "Dockerfile")) or
        os.path.exists(os.path.join(repo_path, "docker-compose.yml"))
    )
    if guide.has_docker and not any("docker" in c for c in guide.run_commands):
        if os.path.exists(os.path.join(repo_path, "docker-compose.yml")):
            guide.run_commands.append("docker-compose up")
        else:
            guide.run_commands.append("docker build -t app . && docker run app")

    # Tests
    guide.has_tests = bool(guide.test_commands) or any(
        os.path.exists(os.path.join(repo_path, f))
        for f in ["pytest.ini", "conftest.py", "jest.config.js", "jest.config.ts"]
    )

    # Warnings
    content_blob = readme_content.lower() + env_example.lower()
    guide.prerequisites = _detect_prerequisites(repo_path, content_blob)

    if guide.env_variables:
        guide.warnings.append(f"Requires {len(guide.env_variables)} environment variable(s) — copy .env.example to .env and fill in values")
    if not guide.has_tests:
        guide.warnings.append("No test suite detected — consider adding tests before deploying")
    if not readme_content.strip():
        guide.warnings.append("No README found — documentation is missing")
    if guide.has_docker:
        guide.warnings.append("Docker detected — ensure Docker daemon is running before starting")

    return guide
