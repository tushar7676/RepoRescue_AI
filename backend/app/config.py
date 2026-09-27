import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Scanner & Clone limits
    MAX_REPO_FILES: int = 400
    MAX_FILE_SIZE_BYTES: int = 150000  # ~150KB limit per file for reading
    MAX_TOTAL_SCAN_CHARS: int = 120000 # ~120k chars budget for LLM payload
    CLONE_TIMEOUT_SECONDS: int = 45
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
