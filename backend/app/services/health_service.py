import os
from typing import Dict, List, Any
from app.schemas import HealthInfo, HealthIssue

class HealthService:
    @staticmethod
    def evaluate_health(files: List[Dict[str, Any]], primary_language: str) -> HealthInfo:
        """
        Evaluates repository code health score (1-100) and produces positive findings, key risks, and recommendations.
        """
        score = 80
        positive_findings = []
        key_risks = []
        recommendations = []
        issues: List[HealthIssue] = []
        category_scores = {
            "Architecture": 85,
            "Maintainability": 80,
            "Tests": 70,
            "Documentation": 75,
            "Security": 90
        }

        paths = [f["path"].lower() for f in files]
        
        # 1. Check documentation
        has_readme = any("readme" in p for p in paths)
        if has_readme:
            positive_findings.append("Documentation: README file present providing project setup & details.")
        else:
            score -= 10
            category_scores["Documentation"] -= 25
            key_risks.append("Missing README.md or setup documentation.")
            recommendations.append("Add a comprehensive README.md detailing project architecture, setup steps, and environment requirements.")
            issues.append(HealthIssue(
                severity="High",
                category="Documentation",
                title="Missing Project Documentation",
                description="No README file was discovered in root directory.",
                recommendation="Create README.md with run instructions."
            ))

        # 2. Check test suites
        has_tests = any("test" in p or "spec" in p for p in paths)
        if has_tests:
            positive_findings.append("Test Coverage: Test directory/suite identified in codebase.")
        else:
            score -= 15
            category_scores["Tests"] -= 35
            key_risks.append("No automated test suite detected.")
            recommendations.append("Implement automated unit or integration tests to safeguard future refactoring.")
            issues.append(HealthIssue(
                severity="High",
                category="Tests",
                title="Lack of Automated Unit/Integration Tests",
                description="No test files (e.g. test_*, *.spec.ts, tests/) were identified.",
                recommendation="Add unit tests for core API endpoints and data models."
            ))

        # 3. Check environment/secrets configuration
        has_env_example = any(".env.example" in p or "config.example" in p for p in paths)
        has_raw_env = any(p.endswith(".env") and not p.endswith(".env.example") for p in paths)
        
        if has_env_example:
            positive_findings.append("Configuration: .env.example provided for safe local environment configuration.")
        else:
            recommendations.append("Provide a `.env.example` file to document required environment variables safely.")
            
        if has_raw_env:
            score -= 10
            category_scores["Security"] -= 20
            key_risks.append("Committed .env file detected in source tree.")
            issues.append(HealthIssue(
                severity="High",
                category="Security",
                title="Exposed Environment File",
                description="A .env file was found committed to the repository, which may expose secrets.",
                recommendation="Add .env to .gitignore and rotate any sensitive keys."
            ))

        # 4. Check project structure & modularity
        if len(files) > 15:
            positive_findings.append("Structure: Modular codebase layout with decoupled file responsibilities.")
        elif len(files) <= 3:
            key_risks.append("Monolithic or single-file structure detected.")
            recommendations.append("Consider breaking down large entry files into distinct modules.")

        # 5. Check containerization / CI setup
        has_docker = any("dockerfile" in p or "docker-compose" in p for p in paths)
        if has_docker:
            positive_findings.append("DevOps: Dockerfile / Docker Compose setup detected for reproducible environments.")

        # Clamp final score
        score = max(30, min(98, score))
        
        rating = "Excellent" if score >= 85 else ("Good" if score >= 70 else ("Needs Improvement" if score >= 50 else "Critical"))

        return HealthInfo(
            score=score,
            rating=rating,
            positive_findings=positive_findings,
            key_risks=key_risks,
            recommendations=recommendations,
            issues=issues,
            category_scores=category_scores
        )
