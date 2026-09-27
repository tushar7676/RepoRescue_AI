export interface RepositoryInfo {
  name: string;
  owner: string;
  repo_url: string;
  description?: string;
  primary_language: string;
  default_branch: string;
  file_count: number;
  total_lines: number;
  languages: string[];
}

export interface ArchitectureComponent {
  name: string;
  role: string;
}

export interface ArchitectureInfo {
  pattern: string;
  summary: string;
  tech_stack: string[];
  main_components: ArchitectureComponent[];
  entry_points: string[];
  data_flow: string;
}

export interface WorkflowStep {
  step_number: number;
  title: string;
  description: string;
  involved_files: string[];
}

export interface WorkflowInfo {
  summary: string;
  steps: WorkflowStep[];
}

export interface RunbookCommand {
  step: number;
  category: 'Setup' | 'Environment' | 'Run';
  command: string;
  description: string;
  expected_output?: string;
}

export interface HealthIssue {
  severity: 'High' | 'Medium' | 'Low';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  location?: string;
}

export interface HealthInfo {
  score: number;
  rating: string;
  positive_findings: string[];
  key_risks: string[];
  recommendations: string[];
  issues: HealthIssue[];
  category_scores: Record<string, number>;
}

export interface BlastRadiusItem {
  file: string;
  dependents_count: number;
  risk_level: 'High' | 'Medium' | 'Low';
  description: string;
  direct_dependents: string[];
  indirect_dependents: string[];
}

export interface CleanupItem {
  item_name: string;
  item_type: 'file' | 'dependency';
  status: 'unused' | 'redundant' | 'deprecated';
  reason: string;
  evidence: string;
  safety_recommendation: string;
}

export interface CleanupInfo {
  candidates: CleanupItem[];
  unused_file_count: number;
  unused_dep_count: number;
}

export interface AnalyzeResponse {
  repository: RepositoryInfo;
  summary: string;
  architecture: ArchitectureInfo;
  workflow: WorkflowInfo;
  mermaid_diagram: string;
  runbook: RunbookCommand[];
  health: HealthInfo;
  blast_radius: BlastRadiusItem[];
  cleanup: CleanupInfo;
}

export interface ImpactAffectedFile {
  file: string;
  impact_type: 'Direct' | 'Indirect';
  risk_level: 'High' | 'Medium' | 'Low';
  reason: string;
  suggested_changes: string;
}

export interface ImpactResponse {
  repo_url: string;
  change_request: string;
  risk_level: 'High' | 'Medium' | 'Low';
  summary: string;
  affected_files: ImpactAffectedFile[];
  affected_modules: string[];
  recommended_changes: string[];
  workflow_changes: string[];
  tests_to_review: string[];
}
