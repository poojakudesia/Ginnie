from typing import Optional, Any
from pydantic import BaseModel


class AuraMessageRequest(BaseModel):
    message: str
    screen: Optional[str] = None   # e.g., "home", "wish_detail", "journal", "techniques"
    wish_ids: Optional[list[str]] = None  # IDs of wishes to include as context


class AuraMessageResponse(BaseModel):
    message: str
    streaming: bool = False
