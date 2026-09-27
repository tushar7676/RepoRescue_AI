from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Request Schemas ---

class AnalyzeRequest(BaseModel):
    repo_url: str = Field(..., description="Public GitHub repository URL", example="https://github.com/fastapi/fastapi")

class ImpactRequest(BaseModel):
    repo_url: str = Field(..., description="Public GitHub repository URL")
    change_request: str = Field(..., description="Description of proposed change", example="Replace SQLite with PostgreSQL database")

# --- Model Sub-schemas ---

class RepositoryInfo(BaseModel):
    name: str
    owner: str
    repo_url: str
    description: Optional[str] = ""
    primary_language: str = "Unknown"
    default_branch: str = "main"
    file_count: int = 0
    total_lines: int = 0
    languages: List[str] = Field(default_factory=list)

class ArchitectureInfo(BaseModel):
    pattern: str = Field("Modular Monolith", description="Identified architectural pattern")
    summary: str = ""
    tech_stack: List[str] = Field(default_factory=list)
    main_components: List[Dict[str, str]] = Field(default_factory=list, description="List of component name and role")
    entry_points: List[str] = Field(default_factory=list)
    data_flow: str = ""

class WorkflowStep(BaseModel):
    step_number: int
    title: str
    description: str
    involved_files: List[str] = Field(default_factory=list)

class WorkflowInfo(BaseModel):
    summary: str = ""
    steps: List[WorkflowStep] = Field(default_factory=list)

class RunbookCommand(BaseModel):
    step: int
    category: str = Field("Setup", description="Setup, Environment, or Run")
    command: str
    description: str
    expected_output: Optional[str] = None

class HealthIssue(BaseModel):
    severity: str = Field("Medium", description="High, Medium, Low")
    category: str = Field("Maintainability", description="Architecture, Security, Test, Docs, etc.")
    title: str
    description: str
    recommendation: str
    location: Optional[str] = None

class HealthInfo(BaseModel):
    score: int = Field(..., ge=1, le=100, description="1-100 overall score")
    rating: str = Field("Good", description="Excellent, Good, Needs Improvement, Critical")
    positive_findings: List[str] = Field(default_factory=list)
    key_risks: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    issues: List[HealthIssue] = Field(default_factory=list)
    category_scores: Dict[str, int] = Field(default_factory=dict)

class BlastRadiusItem(BaseModel):
    file: str
    dependents_count: int = 0
    risk_level: str = Field("Low", description="High, Medium, Low")
    description: str = ""
    direct_dependents: List[str] = Field(default_factory=list)
    indirect_dependents: List[str] = Field(default_factory=list)

class CleanupItem(BaseModel):
    item_name: str
    item_type: str = Field("file", description="file or dependency")
    status: str = Field("unused", description="unused, redundant, deprecated")
    reason: str
    evidence: str
    safety_recommendation: str

class CleanupInfo(BaseModel):
    candidates: List[CleanupItem] = Field(default_factory=list)
    unused_file_count: int = 0
    unused_dep_count: int = 0

# --- Full Analysis Output Schema ---

class AnalyzeResponse(BaseModel):
    repository: RepositoryInfo
    summary: str
    architecture: ArchitectureInfo
    workflow: WorkflowInfo
    mermaid_diagram: str
    runbook: List[RunbookCommand]
    health: HealthInfo
    blast_radius: List[BlastRadiusItem]
    cleanup: CleanupInfo

# --- Impact Analysis Output Schema ---

class ImpactAffectedFile(BaseModel):
    file: str
    impact_type: str = Field("Direct", description="Direct or Indirect")
    risk_level: str = Field("Medium", description="High, Medium, Low")
    reason: str
    suggested_changes: str

class ImpactResponse(BaseModel):
    repo_url: str
    change_request: str
    risk_level: str = Field("Medium", description="High, Medium, Low")
    summary: str = ""
    affected_files: List[ImpactAffectedFile] = Field(default_factory=list)
    affected_modules: List[str] = Field(default_factory=list)
    recommended_changes: List[str] = Field(default_factory=list)
    workflow_changes: List[str] = Field(default_factory=list)
    tests_to_review: List[str] = Field(default_factory=list)
