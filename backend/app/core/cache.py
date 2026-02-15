import hashlib
import json
import time
from typing import Any

from app.core.config import settings

try:
    import redis.asyncio as redis
except ImportError:  # pragma: no cover
    redis = None


class Cache:
    def __init__(self):
        self._memory: dict[str, tuple[str, float]] = {}
        self._redis = None

    async def connect(self) -> None:
        if settings.redis_url and redis:
            try:
                self._redis = redis.from_url(settings.redis_url)
                await self._redis.ping()
            except Exception:
                self._redis = None

    async def get(self, key: str) -> Any | None:
        if self._redis:
            try:
                value = await self._redis.get(key)
                return json.loads(value) if value else None
            except Exception:
                self._redis = None

        if key in self._memory:
            value, expires_at = self._memory[key]
            if expires_at < time.time():
                self._memory.pop(key, None)
                return None
            return json.loads(value)

        return None

    async def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        payload = json.dumps(value)
        if self._redis:
            try:
                await self._redis.set(key, payload, ex=ttl_seconds)
                return
            except Exception:
                self._redis = None

        self._memory[key] = (payload, time.time() + ttl_seconds)


cache = Cache()


def hash_payload(payload: dict[str, Any]) -> str:
    serialized = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
