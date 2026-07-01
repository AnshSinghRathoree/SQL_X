from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    question: str
    schema_data: list = Field(alias="schema")

    class Config:
        populate_by_name = True