import os
import pathspec
from typing import Dict, List, Any, Tuple, Set
from app.config import settings

IGNORED_DIRS: Set[str] = {
    ".git", "node_modules", "venv", ".venv", "env", ".env", "__pycache__",
    "dist", "build", ".next", ".nuxt", "target", ".idea", ".vscode", "coverage",
    ".pytest_cache", ".mypy_cache", ".cargo", "vendor", "bin", "obj", ".gradle"
}

IGNORED_EXTENSIONS: Set[str] = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".pdf", ".zip",
    ".tar", ".gz", ".7z", ".rar", ".exe", ".dll", ".so", ".dylib", ".pyc",
    ".pyo", ".class", ".jar", ".war", ".min.js", ".min.css", ".map", ".lock",
    ".ttf", ".woff", ".woff2", ".eot", ".mp3", ".mp4", ".mov", ".db", ".sqlite"
}

IGNORED_EXACT_FILES: Set[str] = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Cargo.lock", "poetry.lock",
    "Pipfile.lock", "composer.lock", "mix.lock", "Gemfile.lock"
}

IMPORTANT_FILES: Set[str] = {
    "readme.md", "readme.txt", "readme", "package.json", "requirements.txt",
    "pyproject.toml", "cargo.toml", "dockerfile", "docker-compose.yml", "docker-compose.yaml",
    "go.mod", "pom.xml", "build.gradle", "makefile", "main.py", "app.py", "index.ts",
    "index.js", "server.js", "next.config.js", "next.config.mjs"
}

class FlattenerService:
    @staticmethod
    def scan_and_flatten(repo_dir: str) -> Dict[str, Any]:
        """
        Scans repo, applies strict ignore rules, extracts directory tree and file contents.
        Returns detailed structured representation.
        """
        all_files: List[Dict[str, Any]] = []
        file_tree: List[str] = []
        total_lines = 0
        total_chars_read = 0
        languages_found: Dict[str, int] = {}
        
        # Read .gitignore if present
        gitignore_spec = None
        gitignore_path = os.path.join(repo_dir, ".gitignore")
        if os.path.exists(gitignore_path):
            try:
                with open(gitignore_path, "r", encoding="utf-8", errors="ignore") as f:
                    gitignore_spec = pathspec.PathSpec.from_lines("gitwildmatch", f)
            except Exception:
                pass

        for root, dirs, files in os.walk(repo_dir):
            # Exclude ignored directories in place
            dirs[:] = [
                d for d in dirs
                if d.lower() not in IGNORED_DIRS and not d.startswith(".")
            ]
            
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, repo_dir).replace("\\", "/")
                
                # Check gitignore
                if gitignore_spec and gitignore_spec.match_file(rel_path):
                    continue
                
                # Check extension and exact name
                ext = os.path.splitext(f)[1].lower()
                if ext in IGNORED_EXTENSIONS or f in IGNORED_EXACT_FILES:
                    continue
                
                # Skip hidden files except dockerfile/env examples
                if f.startswith(".") and f not in {".env.example", ".gitignore", ".dockerignore"}:
                    continue
                
                try:
                    file_stat = os.stat(full_path)
                    if file_stat.st_size > settings.MAX_FILE_SIZE_BYTES:
                        file_tree.append(f"{rel_path} (Skipped: size > {settings.MAX_FILE_SIZE_BYTES // 1024}KB)")
                        continue
                    
                    # Language detection based on extension
                    lang = FlattenerService._detect_language(rel_path)
                    languages_found[lang] = languages_found.get(lang, 0) + 1
                    
                    file_tree.append(rel_path)
                    
                    # Read content if under char budget or if it's an important configuration file
                    is_important = f.lower() in IMPORTANT_FILES or rel_path.lower() in IMPORTANT_FILES
                    
                    content = ""
                    line_count = 0
                    if total_chars_read < settings.MAX_TOTAL_SCAN_CHARS or is_important:
                        try:
                            with open(full_path, "r", encoding="utf-8", errors="ignore") as file_obj:
                                text = file_obj.read()
                                line_count = len(text.splitlines())
                                total_lines += line_count
                                
                                # Take top portion if file is very long
                                if len(text) > 8000 and not is_important:
                                    snippet = text[:8000] + f"\n... [Truncated remaining {len(text) - 8000} characters]"
                                else:
                                    snippet = text
                                
                                content = snippet
                                total_chars_read += len(snippet)
                        except Exception:
                            content = "[Unreadable content]"
                    
                    all_files.append({
                        "path": rel_path,
                        "extension": ext,
                        "language": lang,
                        "size_bytes": file_stat.st_size,
                        "line_count": line_count,
                        "content": content,
                        "is_important": is_important
                    })

                except Exception as e:
                    print(f"Error reading {rel_path}: {e}")

        # Determine primary language
        primary_lang = "Unknown"
        if languages_found:
            # Sort by count excluding Config/Text if possible
            code_langs = {k: v for k, v in languages_found.items() if k not in {"Markdown", "JSON", "YAML", "Plain Text"}}
            target_dict = code_langs if code_langs else languages_found
            primary_lang = max(target_dict, key=target_dict.get)

        return {
            "all_files": all_files,
            "file_tree": file_tree,
            "file_count": len(all_files),
            "total_lines": total_lines,
            "languages": list(languages_found.keys()),
            "primary_language": primary_lang,
            "flattened_text_budget": total_chars_read
        }

    @staticmethod
    def _detect_language(filepath: str) -> str:
        ext = os.path.splitext(filepath)[1].lower()
        mapping = {
            ".py": "Python",
            ".ts": "TypeScript",
            ".tsx": "TypeScript (React)",
            ".js": "JavaScript",
            ".jsx": "JavaScript (React)",
            ".go": "Go",
            ".rs": "Rust",
            ".java": "Java",
            ".cs": "C#",
            ".cpp": "C++",
            ".c": "C",
            ".html": "HTML",
            ".css": "CSS",
            ".scss": "SCSS",
            ".json": "JSON",
            ".yaml": "YAML",
            ".yml": "YAML",
            ".md": "Markdown",
            ".sql": "SQL",
            ".sh": "Shell",
            ".dockerfile": "Docker",
        }
        filename = os.path.basename(filepath).lower()
        if filename in {"dockerfile", "dockerfile.dev", "dockerfile.prod"}:
            return "Docker"
        if filename == "makefile":
            return "Makefile"
        return mapping.get(ext, "Plain Text")
