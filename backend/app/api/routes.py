from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.cache import cache, hash_payload
from app.core.db import get_session
from app.core.limiter import limiter
from app.models.analysis import AnalysisRecord
from app.schemas.analysis import (
    AnalyzeRequest,
    AnalyzeResponse,
    AlternativesRequest,
    AlternativesResponse,
    EscalationRequest,
    EscalationResponse,
    HistoryItem
)
from app.services.analysis_service import analyze, generate_alternatives, predict_escalation

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/minute")
async def analyze_message(
    request: Request,
    payload: AnalyzeRequest,
    session: AsyncSession = Depends(get_session)
):
    response = await analyze(payload)

    record = AnalysisRecord(
        user_id=payload.user_id,
        text_hash=hash_payload({"text": payload.text}),
        context_hash=hash_payload({"context": payload.context})
        if payload.context
        else None,
        ml_score=payload.ml_score
    )
    session.add(record)
    await session.commit()

    return response


@router.post("/generate-alternatives", response_model=AlternativesResponse)
@limiter.limit("10/minute")
async def alternatives(
    request: Request,
    payload: AlternativesRequest
):
    return await generate_alternatives(payload)


@router.post("/predict-escalation", response_model=EscalationResponse)
@limiter.limit("20/minute")
async def escalation(
    request: Request,
    payload: EscalationRequest
):
    return await predict_escalation(payload)


@router.get("/history/{user_id}", response_model=list[HistoryItem])
@limiter.limit("30/minute")
async def history(
    request: Request,
    user_id: str,
    session: AsyncSession = Depends(get_session)
):
    result = await session.execute(
        select(AnalysisRecord)
        .where(AnalysisRecord.user_id == user_id)
        .order_by(AnalysisRecord.created_at.desc())
        .limit(50)
    )
    records = result.scalars().all()
    return [
        HistoryItem(
            user_id=record.user_id,
            text_hash=record.text_hash,
            context_hash=record.context_hash,
            ml_score=record.ml_score,
            created_at=record.created_at.isoformat()
        )
        for record in records
    ]
