from pydantic import BaseModel
from typing import List

from pydantic import BaseModel

class DatasetTextRequest(BaseModel):
    csv_text: str
    table_name: str

class DatasetUnderstandingResponse(BaseModel):
    title: str
    summary: str
    business_domain: str
    analysis_capabilities: List[str]
    suggested_questions: List[str]