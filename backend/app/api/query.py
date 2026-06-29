from fastapi import APIRouter
from app.models.query_models import QueryRequest
from app.services.groq_service import generate_sql

router = APIRouter()

@router.post("/query")
def query(request: QueryRequest):

    sql = generate_sql(
        question=request.question,
        schema=request.schema_data
    )

    return {
        "sql": sql
    }