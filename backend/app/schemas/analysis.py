from typing import Any, Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    user_id: str = Field(default="anonymous")
    text: str
    context: list[dict[str, Any]] | None = None
    ml_score: int | None = None
    context_scoring: bool = False


class AnalyzeResponse(BaseModel):
    emotions: list[str]
    needs: list[str]
    patterns: list[str]
    escalation: int
    alternatives: dict[str, str]


class AlternativesRequest(BaseModel):
    text: str
    context: list[dict[str, Any]] | None = None
    severity: int = 0


class AlternativesResponse(BaseModel):
    empathic: str
    rational: str
    socratic: str


class HistoryItem(BaseModel):
    user_id: str
    text_hash: str
    context_hash: str | None
    ml_score: int | None
    created_at: str


class EscalationRequest(BaseModel):
    dialogue: list[dict[str, Any]]
    proposed_response: str


class EscalationResponse(BaseModel):
    severity_change: int
