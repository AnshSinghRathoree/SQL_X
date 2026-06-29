from pydantic import BaseModel

class ExplainRequest(BaseModel):
    sql: str
    question: str