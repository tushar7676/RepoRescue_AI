import os
from typing import Dict, List, Any
from app.schemas import CleanupInfo, CleanupItem

class CleanupService:
    @staticmethod
    def identify_cleanup_candidates(files: List[Dict[str, Any]], dependents_graph: Dict[str, List[str]]) -> CleanupInfo:
        """
        Identifies candidate files and dependencies for cleanup based on static reference graph.
        """
        candidates: List[CleanupItem] = []
        unused_file_count = 0
        unused_dep_count = 0

        standard_entrypoints = {
            "main.py", "app.py", "index.ts", "index.js", "page.tsx", "layout.tsx",
            "server.js", "manage.py", "wsgi.py", "asgi.py", "vite.config.ts",
            "next.config.mjs", "tailwind.config.ts", "setup.py", "index.html"
        }

        for f in files:
            path = f["path"]
            filename = os.path.basename(path)
            ext = f.get("extension", "")
            
            # Skip docs, config files, standard entrypoints
            if ext in [".md", ".json", ".yml", ".yaml", ".txt", ".sh", ".dockerfile"]:
                continue
            if filename in standard_entrypoints or path in standard_entrypoints:
                continue
            if "test" in path.lower() or "spec" in path.lower():
                continue

            dependents = dependents_graph.get(path, [])
            
            # File is not imported anywhere
            if len(dependents) == 0 and not f.get("is_important", False):
                unused_file_count += 1
                candidates.append(CleanupItem(
                    item_name=path,
                    item_type="file",
                    status="unused",
                    reason="No internal modules import or reference this source file.",
                    evidence=f"Static code scan found 0 dependent imports in the project tree for '{path}'.",
                    safety_recommendation="Verify if this is an unused legacy component or an indirect entry point before deletion."
                ))

        # Check for temporary or backup files
        for f in files:
            path = f["path"]
            if path.endswith(".bak") or path.endswith(".tmp") or path.endswith(".old") or "~" in path:
                unused_file_count += 1
                candidates.append(CleanupItem(
                    item_name=path,
                    item_type="file",
                    status="redundant",
                    reason="Backup or temporary file found in repository.",
                    evidence=f"File extension indicates a temporary copy: '{path}'.",
                    safety_recommendation="Safe to remove after confirming no active scripts rely on it."
                ))

        return CleanupInfo(
            candidates=candidates[:10],
            unused_file_count=unused_file_count,
            unused_dep_count=unused_dep_count
        )
