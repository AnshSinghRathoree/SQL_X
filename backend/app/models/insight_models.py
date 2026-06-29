from pydantic import BaseModel

class InsightRequest(BaseModel):
    schema: list