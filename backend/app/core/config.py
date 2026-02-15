from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str
    groq_model: str = "llama-3.3-70b-versatile"
    database_url: str = "sqlite+aiosqlite:///./conflict_translator.db"
    redis_url: str | None = None
    cache_ttl_seconds: int = 86400

    @property
    def cache_backend(self) -> str:
        return "redis" if self.redis_url else "memory"

    class Config:
        env_prefix = ""
        env_file = ".env"


settings = Settings()
