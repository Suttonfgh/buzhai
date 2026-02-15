from typing import Any

from app.core.cache import cache, hash_payload
from app.core.config import settings
from app.schemas.analysis import (
    AnalyzeRequest,
    AnalyzeResponse,
    AlternativesRequest,
    AlternativesResponse,
    EscalationRequest,
    EscalationResponse
)
from app.services.groq_client import generate_json

ANALYSIS_PROMPT = """
You are a conflict mediation expert trained in NVC.
Return JSON with keys: emotions (array), needs (array), patterns (array), escalation (0-100).
""".strip()

ALTERNATIVES_PROMPT = """
You are a mediator. Rewrite the user's message in three styles.
Return JSON with keys: empathic, rational, socratic - each value must be a plain string (the rewritten message), not an object.
Example: {"empathic": "I feel...", "rational": "Let's consider...", "socratic": "What if..."}
""".strip()

ESCALATION_PROMPT = """
You predict conflict escalation severity change. Return JSON with key: severity_change (-50 to 30).
""".strip()


async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    payload = request.model_dump()
    cache_key = hash_payload({"type": "analyze", **payload})
    print(f"[Analyze] Text: {request.text[:50]}... Key: {cache_key[:16]}")
    
    cached = await cache.get(cache_key)
    if cached:
        print(f"[Analyze] Cache HIT")
        return AnalyzeResponse(**cached)
    
    print(f"[Analyze] Cache MISS - calling LLM")
    analysis_payload = {
        "text": request.text,
        "ml_score": request.ml_score,
        "context": request.context if request.context_scoring else []
    }
    response = await generate_json(ANALYSIS_PROMPT, str(analysis_payload))
    emotions = response.get("emotions") or []
    needs = response.get("needs") or []
    patterns = response.get("patterns") or []
    llm_escalation = int(response.get("escalation") or 0)
    base_score = int(request.ml_score or 0)
    escalation = min(100, max(base_score, llm_escalation))

    alt_request = AlternativesRequest(
        text=request.text,
        context=request.context,
        severity=escalation
    )
    alternatives = await generate_alternatives(alt_request)

    result = AnalyzeResponse(
        emotions=emotions,
        needs=needs,
        patterns=patterns,
        escalation=escalation,
        alternatives=alternatives.model_dump()
    )
    await cache.set(cache_key, result.model_dump(), settings.cache_ttl_seconds)
    return result


async def generate_alternatives(
    request: AlternativesRequest
) -> AlternativesResponse:
    payload = request.model_dump()
    cache_key = hash_payload({"type": "alternatives", **payload})
    cached = await cache.get(cache_key)
    if cached:
        return AlternativesResponse(**cached)

    response = await generate_json(ALTERNATIVES_PROMPT, str(payload))
    
    def extract_text(value) -> str:
        """Extract string from value that might be nested dict"""
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            # Try common keys that LLMs might use
            for key in ["text", "response", "message", "approach", "content"]:
                if key in value:
                    return str(value[key])
            # Just get first string value
            for v in value.values():
                if isinstance(v, str):
                    return v
        return str(value) if value else ""
    
    result = AlternativesResponse(
        empathic=extract_text(response.get("empathic")),
        rational=extract_text(response.get("rational")),
        socratic=extract_text(response.get("socratic"))
    )
    await cache.set(cache_key, result.model_dump(), settings.cache_ttl_seconds)
    return result


async def predict_escalation(
    request: EscalationRequest
) -> EscalationResponse:
    payload = request.model_dump()
    response = await generate_json(ESCALATION_PROMPT, str(payload))
    return EscalationResponse(severity_change=int(response.get("severity_change") or 0))
