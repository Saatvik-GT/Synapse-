from typing import Optional

from pydantic import BaseModel


class Settings(BaseModel):
    github_api_base_url: str = "https://api.github.com"
    github_token: Optional[str] = None
    github_timeout_seconds: float = 20.0


settings = Settings()
