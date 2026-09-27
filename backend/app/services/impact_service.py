import os
from typing import Dict, Any, List
from app.services.git_service import GitService
from app.services.flattener_service import FlattenerService
from app.services.dependency_service import DependencyService
from app.services.gemini_service import GeminiService
from app.schemas import ImpactResponse, ImpactAffectedFile

class ImpactService:
    @staticmethod
    def analyze_change_impact(repo_url: str, change_request: str) -> ImpactResponse:
        """
        Analyzes the blast-radius and change impact of a proposed modification to the codebase.
        """
        temp_dir = None
        try:
            # Shallow clone
            temp_dir, owner, repo_name = GitService.clone_repository(repo_url)
            
            # Scan repo
            scan_result = FlattenerService.scan_and_flatten(temp_dir)
            files = scan_result["all_files"]
            
            # Dependency analysis
            dep_result = DependencyService.analyze_dependencies(files)
            dependents_graph = dep_result["dependents_graph"]
            
            # Try Gemini AI Impact prediction first
            repo_summary = f"{repo_name} ({scan_result['primary_language']} repository with {len(files)} files)"
            file_paths = [f["path"] for f in files]
            
            ai_data = GeminiService.generate_impact_with_ai(repo_summary, file_paths, change_request)
            
            if ai_data and "affected_files" in ai_data:
                affected = [
                    ImpactAffectedFile(
                        file=af.get("file", "unknown"),
                        impact_type=af.get("impact_type", "Direct"),
                        risk_level=af.get("risk_level", "Medium"),
                        reason=af.get("reason", "Contains code related to change request"),
                        suggested_changes=af.get("suggested_changes", "Review and update logic")
                    )
                    for af in ai_data.get("affected_files", [])
                ]
                return ImpactResponse(
                    repo_url=repo_url,
                    change_request=change_request,
                    risk_level=ai_data.get("risk_level", "Medium"),
                    summary=ai_data.get("summary", f"Impact evaluation for change: {change_request}"),
                    affected_files=affected,
                    affected_modules=ai_data.get("affected_modules", []),
                    recommended_changes=ai_data.get("recommended_changes", []),
                    workflow_changes=ai_data.get("workflow_changes", []),
                    tests_to_review=ai_data.get("tests_to_review", [])
                )
            
            # Fallback deterministic change-impact analyzer
            return ImpactService._deterministic_impact_analysis(
                repo_url, change_request, files, dependents_graph
            )

        finally:
            if temp_dir:
                GitService.cleanup(temp_dir)

    @staticmethod
    def _deterministic_impact_analysis(
        repo_url: str, change_request: str, files: List[Dict[str, Any]], dependents_graph: Dict[str, List[str]]
    ) -> ImpactResponse:
        """Determines direct & indirect impact using string/keyword matching and static dependency propagation."""
        change_lower = change_request.lower()
        
        # Tokenize key terms from change request
        terms = [t for t in change_lower.replace(",", " ").replace(".", " ").split() if len(t) > 2]
        
        directly_affected: List[Dict[str, Any]] = []
        directly_affected_paths: set = set()
        
        for f in files:
            path = f["path"]
            content = f.get("content", "").lower()
            path_lower = path.lower()
            
            # Match path or content against change terms
            score = 0
            matching_terms = []
            for t in terms:
                if t in path_lower:
                    score += 3
                    matching_terms.append(t)
                elif t in content:
                    score += 1
                    matching_terms.append(t)
            
            if score > 0 or f.get("is_important"):
                risk = "High" if score >= 3 or f.get("is_important") else "Medium"
                reason = f"Matches keyword(s): {', '.join(set(matching_terms))}" if matching_terms else "Core configuration file."
                directly_affected.append({
                    "file": path,
                    "impact_type": "Direct",
                    "risk_level": risk,
                    "reason": reason,
                    "suggested_changes": f"Modify implementation details in {os.path.basename(path)} to align with '{change_request}'."
                })
                directly_affected_paths.add(path)

        # Limit direct affected to top candidates if many matched
        directly_affected = directly_affected[:6]

        # Calculate indirect affected files (files that import directly affected files)
        indirectly_affected: List[Dict[str, Any]] = []
        for direct_item in directly_affected:
            direct_path = direct_item["file"]
            deps = dependents_graph.get(direct_path, [])
            for dep_path in deps:
                if dep_path not in directly_affected_paths:
                    indirectly_affected.append({
                        "file": dep_path,
                        "impact_type": "Indirect",
                        "risk_level": "Medium",
                        "reason": f"Imports directly modified file '{direct_path}'.",
                        "suggested_changes": f"Verify interface compatibility with changes in '{direct_path}'."
                    })

        all_affected = directly_affected + indirectly_affected[:6]
        
        # Determine overall risk
        high_risk_count = sum(1 for a in all_affected if a["risk_level"] == "High")
        overall_risk = "High" if high_risk_count >= 2 or len(all_affected) >= 5 else ("Medium" if len(all_affected) >= 2 else "Low")
        
        # Extracted modules
        affected_modules = list(set([a["file"].split('/')[0] for a in all_affected if '/' in a["file"]]))
        if not affected_modules:
            affected_modules = ["Core Module"]

        # Tests to review
        tests = [f["path"] for f in files if "test" in f["path"].lower()][:4]

        return ImpactResponse(
            repo_url=repo_url,
            change_request=change_request,
            risk_level=overall_risk,
            summary=f"Analysis predicts modification will directly impact {len(directly_affected)} files and indirectly propagate to {len(indirectly_affected)} dependent files across {len(affected_modules)} module(s).",
            affected_files=[ImpactAffectedFile(**a) for a in all_affected],
            affected_modules=affected_modules,
            recommended_changes=[
                f"Step 1: Update configuration and core interfaces in {directly_affected[0]['file'] if directly_affected else 'core module'}.",
                f"Step 2: Refactor dependent implementations across {', '.join(affected_modules)}.",
                "Step 3: Run existing unit and integration tests to verify no regressions occur."
            ],
            workflow_changes=[
                "Initialization workflow updated to incorporate new dependency requirements.",
                "Data flow updated for modified module interfaces."
            ],
            tests_to_review=tests
        )
