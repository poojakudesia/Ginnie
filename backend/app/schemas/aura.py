from typing import Optional, Any
from pydantic import BaseModel


class AuraMessageRequest(BaseModel):
    message: str
    screen: Optional[str] = None   # e.g., "home", "wish_detail", "journal", "techniques"
    wish_ids: Optional[list[str]] = None  # IDs of wishes to include as context


class AuraMessageResponse(BaseModel):
    message: str
    streaming: bool = False


# ── Method Match (Ginnie recommendation quiz) ────────────────────────────────

class MethodCandidate(BaseModel):
    id: str
    name: str
    tags: list[str] = []
    effort: Optional[str] = None   # "low" | "medium" | "high"


class RecommendMethodsRequest(BaseModel):
    modality: str                       # Q1 — visual | verbal | written | feeling
    habitStyle: str                     # Q2 — structured | intuitive | micro | immersive
    blocker: str                        # Q3 — consistency | doubt | impatience | clarity
    mindOpen: Optional[str] = None      # Q4 — morning | walk | shower | meditation | sleep
    mentalState: Optional[str] = None   # Q5 — limiting belief
    top5: list[MethodCandidate]


class MethodRecommendation(BaseModel):
    id: str
    reason: str


class RecommendMethodsResponse(BaseModel):
    recommendations: list[MethodRecommendation]
