import os
from typing import Dict, Any, List
from app.services.git_service import GitService, GitServiceError
from app.services.flattener_service import FlattenerService
from app.services.dependency_service import DependencyService
from app.services.health_service import HealthService
from app.services.cleanup_service import CleanupService
from app.services.gemini_service import GeminiService
from app.schemas import (
    AnalyzeResponse, RepositoryInfo, ArchitectureInfo, WorkflowInfo,
    WorkflowStep, RunbookCommand, HealthInfo, CleanupInfo, BlastRadiusItem
)

class RepositoryAnalyzer:
    @staticmethod
    def analyze_repository(repo_url: str) -> AnalyzeResponse:
        """
        Orchestrates complete repository cloning, analysis, dependency mapping,
        health scoring, and AI synthesis.
        """
        temp_dir = None
        try:
            # Step 1: Shallow Clone
            temp_dir, owner, repo_name = GitService.clone_repository(repo_url)
            
            # Step 2: Scan and flatten
            scan_result = FlattenerService.scan_and_flatten(temp_dir)
            files = scan_result["all_files"]
            
            repo_info = RepositoryInfo(
                name=repo_name,
                owner=owner,
                repo_url=f"https://github.com/{owner}/{repo_name}",
                description=f"GitHub repository {owner}/{repo_name}",
                primary_language=scan_result["primary_language"],
                default_branch="main",
                file_count=scan_result["file_count"],
                total_lines=scan_result["total_lines"],
                languages=scan_result["languages"]
            )
            
            # Step 3: Dependency Analysis & Blast Radius
            dep_result = DependencyService.analyze_dependencies(files)
            blast_radius: List[BlastRadiusItem] = dep_result["blast_radius"]
            
            # Step 4: Health Score
            health_info: HealthInfo = HealthService.evaluate_health(files, scan_result["primary_language"])
            
            # Step 5: Cleanup Candidates
            cleanup_info: CleanupInfo = CleanupService.identify_cleanup_candidates(
                files, dep_result["dependents_graph"]
            )
            
            # Step 6: Gemini AI Synthesis (or Fallback Engine)
            ai_data = GeminiService.generate_analysis_with_ai(
                repo_data={
                    "repo_info": repo_info.model_dump(),
                    "all_files": files,
                    "file_tree": scan_result["file_tree"],
                    "primary_language": scan_result["primary_language"],
                    "file_count": scan_result["file_count"],
                    "total_lines": scan_result["total_lines"]
                },
                static_health=health_info.model_dump()
            )

            # Assemble response components
            if ai_data and "architecture" in ai_data:
                summary = ai_data.get("summary", f"{repo_name} is a {scan_result['primary_language']} repository.")
                arch_raw = ai_data.get("architecture", {})
                architecture = ArchitectureInfo(
                    pattern=arch_raw.get("pattern", "Modular Structure"),
                    summary=arch_raw.get("summary", "System components and interactions"),
                    tech_stack=arch_raw.get("tech_stack", scan_result["languages"]),
                    main_components=arch_raw.get("main_components", []),
                    entry_points=arch_raw.get("entry_points", []),
                    data_flow=arch_raw.get("data_flow", "")
                )
                
                wf_raw = ai_data.get("workflow", {})
                steps = [
                    WorkflowStep(
                        step_number=s.get("step_number", i+1),
                        title=s.get("title", f"Step {i+1}"),
                        description=s.get("description", ""),
                        involved_files=s.get("involved_files", [])
                    )
                    for i, s in enumerate(wf_raw.get("steps", []))
                ]
                workflow = WorkflowInfo(
                    summary=wf_raw.get("summary", "Application execution flow"),
                    steps=steps
                )
                
                mermaid_diagram = ai_data.get("mermaid_diagram", RepositoryAnalyzer._build_default_mermaid(files, repo_name))
                
                runbook_raw = ai_data.get("runbook", [])
                runbook = [
                    RunbookCommand(
                        step=r.get("step", i+1),
                        category=r.get("category", "Setup"),
                        command=r.get("command", "echo 'No command specified'"),
                        description=r.get("description", ""),
                        expected_output=r.get("expected_output")
                    )
                    for i, r in enumerate(runbook_raw)
                ]
            else:
                # Deterministic Fallback Engine
                summary, architecture, workflow, mermaid_diagram, runbook = RepositoryAnalyzer._synthesize_fallback(
                    repo_info, files, scan_result, dep_result
                )

            # Return final schema-valid response
            return AnalyzeResponse(
                repository=repo_info,
                summary=summary,
                architecture=architecture,
                workflow=workflow,
                mermaid_diagram=mermaid_diagram,
                runbook=runbook,
                health=health_info,
                blast_radius=blast_radius,
                cleanup=cleanup_info
            )

        finally:
            if temp_dir:
                GitService.cleanup(temp_dir)

    @staticmethod
    def _synthesize_fallback(repo_info: RepositoryInfo, files: List[Dict[str, Any]], scan_result: Dict[str, Any], dep_result: Dict[str, Any]):
        """Generates realistic fallback understanding when AI key is unconfigured."""
        lang = repo_info.primary_language
        name = repo_info.name
        
        summary = (
            f"{name} is a {lang}-based software application consisting of {repo_info.file_count} scanned source files "
            f"and ~{repo_info.total_lines} total lines of code. It utilizes a structured architecture with modular file separation "
            f"and clear entry points."
        )
        
        # Discover entry points
        entry_points = [
            f["path"] for f in files
            if f["path"].lower() in [
                "main.py", "app.py", "index.ts", "index.js", "src/index.ts",
                "app/page.tsx", "server.js", "manage.py", "main.go"
            ] or f.get("is_important")
        ][:4]
        
        if not entry_points and files:
            entry_points = [files[0]["path"]]

        # Main components
        main_components = []
        dirs_seen = set()
        for f in files:
            parts = f["path"].split('/')
            if len(parts) > 1:
                parent_dir = parts[0]
                if parent_dir not in dirs_seen:
                    dirs_seen.add(parent_dir)
                    main_components.append({
                        "name": parent_dir.capitalize() + " Module",
                        "role": f"Contains core {parent_dir} logic and related assets."
                    })
        if not main_components:
            main_components = [{"name": "Core Application", "role": "Main source code module."}]

        architecture = ArchitectureInfo(
            pattern=f"Modular {lang} Architecture",
            summary=f"Organized around primary components: {', '.join([c['name'] for c in main_components[:4]])}.",
            tech_stack=repo_info.languages,
            main_components=main_components[:6],
            entry_points=entry_points,
            data_flow=f"Requests enter through initial entry points ({', '.join(entry_points[:2])}) and traverse internal submodules."
        )

        workflow = WorkflowInfo(
            summary="Standard request processing and module initialization flow.",
            steps=[
                WorkflowStep(
                    step_number=1,
                    title="Bootstrap & Configuration",
                    description="Application initializes settings, environment parameters, and dependencies.",
                    involved_files=entry_points[:2]
                ),
                WorkflowStep(
                    step_number=2,
                    title="Core Logic Execution",
                    description="Processing request payloads, invoking business domain logic, and connecting modules.",
                    involved_files=[f["path"] for f in files if f.get("is_important")][:3]
                ),
                WorkflowStep(
                    step_number=3,
                    title="Response & I/O Dispatch",
                    description="Returns formatted response or completes async background routines.",
                    involved_files=[]
                )
            ]
        )

        mermaid_diagram = RepositoryAnalyzer._build_default_mermaid(files, name)

        # Build realistic Runbook
        runbook = []
        if lang == "Python":
            runbook = [
                RunbookCommand(
                    step=1, category="Environment",
                    command="python -m venv venv && source venv/bin/activate  # Or venv\\Scripts\\activate on Windows",
                    description="Create and activate a virtual environment",
                    expected_output="Virtual environment activated"
                ),
                RunbookCommand(
                    step=2, category="Setup",
                    command="pip install -r requirements.txt",
                    description="Install project dependencies",
                    expected_output="Successfully installed..."
                ),
                RunbookCommand(
                    step=3, category="Run",
                    command=f"python {entry_points[0]}" if entry_points else "python main.py",
                    description="Start the application server or main script",
                    expected_output="Server started..."
                )
            ]
        elif lang in ["TypeScript", "JavaScript", "TypeScript (React)", "JavaScript (React)"]:
            runbook = [
                RunbookCommand(
                    step=1, category="Setup",
                    command="npm install",
                    description="Install node package dependencies",
                    expected_output="added XXX packages in Ys"
                ),
                RunbookCommand(
                    step=2, category="Environment",
                    command="cp .env.example .env  # If environment config file exists",
                    description="Copy environment template file",
                    expected_output=""
                ),
                RunbookCommand(
                    step=3, category="Run",
                    command="npm run dev",
                    description="Launch development server",
                    expected_output="Ready on http://localhost:3000"
                )
            ]
        else:
            runbook = [
                RunbookCommand(
                    step=1, category="Setup",
                    command=f"git clone {repo_info.repo_url}",
                    description="Clone repository",
                    expected_output="Cloning into..."
                ),
                RunbookCommand(
                    step=2, category="Run",
                    command="Inspect README.md for build instructions",
                    description="Execute build / launch commands",
                    expected_output=""
                )
            ]

        return summary, architecture, workflow, mermaid_diagram, runbook

    @staticmethod
    def _build_default_mermaid(files: List[Dict[str, Any]], repo_name: str) -> str:
        """Constructs a clean Mermaid flowchart representation of repository structure."""
        top_dirs = {}
        for f in files:
            parts = f["path"].split('/')
            if len(parts) > 1:
                d = parts[0]
                top_dirs[d] = top_dirs.get(d, 0) + 1

        lines = ["graph TD"]
        lines.append(f'  Client["User / Client Request"]')
        lines.append(f'  Client --> Core["{repo_name} Core Application"]')
        
        for idx, (d, count) in enumerate(list(top_dirs.items())[:5]):
            node_id = f"Mod{idx}"
            lines.append(f'  Core --> {node_id}["{d.capitalize()} Module ({count} files)"]')
            
        lines.append('  classDef default fill:#1E293B,stroke:#334155,color:#E2E8F0;')
        lines.append('  classDef highlight fill:#065F46,stroke:#10B981,color:#ECFDF5;')
        lines.append('  class Core highlight;')
        
        return "\n".join(lines)
