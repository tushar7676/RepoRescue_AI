import os
import re
import shutil
import tempfile
import subprocess
from typing import Tuple, Optional
from urllib.parse import urlparse

class GitServiceError(Exception):
    pass

class GitService:
    @staticmethod
    def parse_github_url(repo_url: str) -> Tuple[str, str]:
        """Validates and extracts (owner, repo_name) from a GitHub URL."""
        cleaned_url = repo_url.strip().rstrip('/')
        if cleaned_url.endswith('.git'):
            cleaned_url = cleaned_url[:-4]
            
        # Match standard github URLs
        pattern = r'^https?://(?:www\.)?github\.com/([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)$'
        match = re.match(pattern, cleaned_url)
        if not match:
            # Try short format owner/repo
            short_pattern = r'^([a-zA-Z0-9_.-]+)/([a-zA-Z0-9_.-]+)$'
            short_match = re.match(short_pattern, cleaned_url)
            if short_match:
                return short_match.group(1), short_match.group(2)
            raise GitServiceError("Invalid GitHub URL. Must be formatted like https://github.com/owner/repository")
        
        return match.group(1), match.group(2)

    @staticmethod
    def clone_repository(repo_url: str, timeout_seconds: int = 45) -> Tuple[str, str, str]:
        """
        Shallow clones a public repository into a unique temporary directory.
        Returns: (temp_dir_path, owner, repo_name)
        """
        owner, repo_name = GitService.parse_github_url(repo_url)
        normalized_url = f"https://github.com/{owner}/{repo_name}.git"
        
        temp_dir = tempfile.mkdtemp(prefix=f"reporescue_{owner}_{repo_name}_")
        
        try:
            cmd = ["git", "clone", "--depth", "1", "--single-branch", normalized_url, temp_dir]
            process = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=timeout_seconds,
                check=False
            )
            
            if process.returncode != 0:
                err_msg = process.stderr or process.stdout
                if "Repository not found" in err_msg or "404" in err_msg:
                    raise GitServiceError(f"Repository '{owner}/{repo_name}' not found or is private. RepoRescue AI MVP currently supports public GitHub repositories.")
                elif "Could not resolve host" in err_msg:
                    raise GitServiceError("Network error while trying to reach GitHub. Please check internet connection.")
                else:
                    raise GitServiceError(f"Failed to clone repository: {err_msg.strip()}")
                
            return temp_dir, owner, repo_name
        except subprocess.TimeoutExpired:
            GitService.cleanup(temp_dir)
            raise GitServiceError(f"Cloning timed out after {timeout_seconds} seconds. Repository may be too large.")
        except Exception as e:
            GitService.cleanup(temp_dir)
            if isinstance(e, GitServiceError):
                raise e
            raise GitServiceError(f"Error cloning repository: {str(e)}")

    @staticmethod
    def cleanup(dir_path: str):
        """Safely removes the temporary directory."""
        if dir_path and os.path.exists(dir_path):
            try:
                shutil.rmtree(dir_path, ignore_errors=True)
            except Exception as e:
                print(f"Warning: Failed to clean up temp dir {dir_path}: {e}")
