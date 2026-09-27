import json
import re
from typing import Dict, Any, Optional
from app.config import settings
from app.schemas import AnalyzeResponse, ImpactResponse

class GeminiService:
    @staticmethod
    def generate_analysis_with_ai(repo_data: Dict[str, Any], static_health: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Calls Google Gemini API to generate structured repository understanding.
        Returns JSON dictionary or None if Gemini API key is missing/fails.
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return None

        try:
            from google import genai
            client = genai.Client(api_key=api_key)

            file_list = [f["path"] for f in repo_data["all_files"][:60]]
            sample_snippets = []
            for f in repo_data["all_files"]:
                if f.get("is_important") or len(sample_snippets) < 15:
                    sample_snippets.append(f"--- File: {f['path']} ---\n{f.get('content', '')[:1500]}")

            prompt = f"""
You are RepoRescue AI, an expert software architecture analyst.
Analyze the following GitHub repository and produce a structured JSON response.

Repository Name: {repo_data['repo_info']['name']}
Owner: {repo_data['repo_info']['owner']}
Primary Language: {repo_data['primary_language']}
Total Files: {repo_data['file_count']}
Total Lines: {repo_data['total_lines']}

File Directory Structure:
{json.dumps(file_list[:80], indent=2)}

Source Code Samples:
{"\n".join(sample_snippets[:10])}

Return ONLY a valid JSON object strictly matching this schema structure:
{{
  "summary": "Clear 2-3 sentence overview of what this repository does, its primary goal, and target users.",
  "architecture": {{
    "pattern": "Identified pattern e.g. Next.js App Router Monolith, FastAPI Microservice, Modular Monolith",
    "summary": "High-level architecture explanation",
    "tech_stack": ["React", "FastAPI", "Python", "Tailwind CSS"],
    "main_components": [
      {{"name": "Frontend", "role": "User dashboard interface"}},
      {{"name": "Backend API", "role": "REST endpoints and orchestrator"}}
    ],
    "entry_points": ["main.py", "app/page.tsx"],
    "data_flow": "Step by step description of how requests/data flow through the system"
  }},
  "workflow": {{
    "summary": "Core execution flow summary",
    "steps": [
      {{
        "step_number": 1,
        "title": "Initialization",
        "description": "System boots and initializes routes",
        "involved_files": ["main.py"]
      }}
    ]
  }},
  "mermaid_diagram": "graph TD\\n  A[User Client] -->|HTTP Request| B[FastAPI Backend]\\n  B -->|Clone & Scan| C[Git & Scanner]\\n  B -->|AI Prompt| D[AI Engine]",
  "runbook": [
    {{
      "step": 1,
      "category": "Setup",
      "command": "git clone https://github.com/...",
      "description": "Clone the repository",
      "expected_output": "Cloning into..."
    }}
  ],
  "health_score": 85,
  "health_reasons": [
    "Clean directory structure and clear module separation",
    "Missing explicit automated unit tests"
  ]
}}
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )

            text = response.text
            # Extract JSON if wrapped in markdown code blocks
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return json.loads(text)

        except Exception as e:
            print(f"Gemini API analysis notice: {e}. Falling back to deterministic analysis engine.")
            return None

    @staticmethod
    def generate_impact_with_ai(repo_summary: str, file_tree: list, change_request: str) -> Optional[Dict[str, Any]]:
        """
        Calls Google Gemini API to analyze change impact.
        Returns JSON dictionary or None if Gemini API key is missing/fails.
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return None

        try:
            from google import genai
            client = genai.Client(api_key=api_key)

            prompt = f"""
You are RepoRescue AI Change Impact Analyzer.
Proposed Change: "{change_request}"

Repository Overview:
{repo_summary}

Files in Repository:
{json.dumps(file_tree[:100], indent=2)}

Analyze which files and modules are affected by this proposed change, assess risk, and suggest next steps.
Return ONLY valid JSON with this structure:
{{
  "risk_level": "High",
  "summary": "Detailed explanation of change impact and blast radius.",
  "affected_files": [
    {{
      "file": "app/config.py",
      "impact_type": "Direct",
      "risk_level": "High",
      "reason": "Stores database connections and settings.",
      "suggested_changes": "Update connection string and connection pooling logic."
    }}
  ],
  "affected_modules": ["Database Layer", "Configuration Service"],
  "recommended_changes": ["Update config schemas", "Add migration scripts"],
  "workflow_changes": ["Database initialization workflow will require new driver"],
  "tests_to_review": ["tests/test_db.py"]
}}
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )

            text = response.text
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return json.loads(text)

        except Exception as e:
            print(f"Gemini Impact API notice: {e}. Falling back to deterministic engine.")
            return None
