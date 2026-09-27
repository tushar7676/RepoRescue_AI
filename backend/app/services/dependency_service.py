import re
import os
from typing import Dict, List, Set, Any
from app.schemas import BlastRadiusItem

class DependencyService:
    @staticmethod
    def analyze_dependencies(files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Builds internal file dependency graph and calculates blast radius for files.
        """
        # Map path -> file info
        file_map = {f["path"]: f for f in files}
        
        # Adjacency list: file -> set of files it imports
        imports_graph: Dict[str, Set[str]] = {f["path"]: set() for f in files}
        
        # Reverse adjacency list: file -> set of files that import it (dependents)
        dependents_graph: Dict[str, Set[str]] = {f["path"]: set() for f in files}
        
        # Regex patterns for import matching
        py_import_re = re.compile(r'^\s*(?:from|import)\s+([\w\.]+)', re.MULTILINE)
        js_import_re = re.compile(r'(?:import|from|require)\s*\(?[\'"]([^\'"]+)[\'"]\)?', re.MULTILINE)

        for f in files:
            path = f["path"]
            content = f.get("content", "")
            ext = f.get("extension", "")
            
            if ext in [".py"]:
                matches = py_import_re.findall(content)
                for m in matches:
                    # Try matching module name to known files
                    mod_path_parts = m.split('.')
                    for candidate in file_map:
                        cand_no_ext = os.path.splitext(candidate)[0]
                        if cand_no_ext.replace('/', '.').endswith(m) or candidate.replace('/', '.').endswith(m + '.py'):
                            if candidate != path:
                                imports_graph[path].add(candidate)
                                dependents_graph[candidate].add(path)

            elif ext in [".js", ".jsx", ".ts", ".tsx"]:
                matches = js_import_re.findall(content)
                for m in matches:
                    if m.startswith('.'):
                        # Relative import resolution
                        dir_name = os.path.dirname(path)
                        norm_target = os.path.normpath(os.path.join(dir_name, m)).replace('\\', '/')
                        
                        # Try exact match or match with extensions
                        possible_paths = [
                            norm_target,
                            norm_target + ".ts", norm_target + ".tsx",
                            norm_target + ".js", norm_target + ".jsx",
                            norm_target + "/index.ts", norm_target + "/index.tsx",
                            norm_target + "/index.js"
                        ]
                        for cand in possible_paths:
                            if cand in file_map and cand != path:
                                imports_graph[path].add(cand)
                                dependents_graph[cand].add(path)
                                break

        # Compute direct & indirect dependents (Blast Radius)
        blast_radius_list: List[BlastRadiusItem] = []
        
        for path, direct_deps in dependents_graph.items():
            direct_list = sorted(list(direct_deps))
            
            # BFS for indirect dependents
            visited = set(direct_deps)
            queue = list(direct_deps)
            while queue:
                curr = queue.pop(0)
                for dep in dependents_graph.get(curr, set()):
                    if dep not in visited and dep != path:
                        visited.add(dep)
                        queue.append(dep)
            
            indirect_list = sorted(list(visited - set(direct_deps)))
            total_dependents_count = len(visited)
            
            # Risk assessment based on blast radius
            if total_dependents_count >= 5:
                risk_level = "High"
                desc = f"Core dependency. Changes affect {total_dependents_count} files across the system."
            elif total_dependents_count >= 2:
                risk_level = "Medium"
                desc = f"Moderate impact. Directly imported by {len(direct_deps)} files."
            else:
                risk_level = "Low"
                desc = "Isolated component. Low risk of systemic breakage."

            # Only add files that either have dependents or are entry points/core files
            if total_dependents_count > 0 or file_map[path].get("is_important"):
                blast_radius_list.append(BlastRadiusItem(
                    file=path,
                    dependents_count=total_dependents_count,
                    risk_level=risk_level,
                    description=desc,
                    direct_dependents=direct_list[:8],
                    indirect_dependents=indirect_list[:8]
                ))

        # Sort blast radius by highest count first
        blast_radius_list.sort(key=lambda x: x.dependents_count, reverse=True)

        return {
            "imports_graph": {k: list(v) for k, v in imports_graph.items()},
            "dependents_graph": {k: list(v) for k, v in dependents_graph.items()},
            "blast_radius": blast_radius_list[:15] # Top 15 highest impact files
        }
