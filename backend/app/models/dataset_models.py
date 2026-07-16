from pydantic import BaseModel
from typing import List

class DatasetTextRequest(BaseModel):
    csv_text: str


class DatasetUnderstandingResponse(BaseModel):
    title: str
    summary: str
    business_domain: str
    analysis_capabilities: List[str]
    suggested_questions: List[str]