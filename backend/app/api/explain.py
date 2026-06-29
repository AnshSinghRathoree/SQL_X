from fastapi import APIRouter
from app.models.explain_models import ExplainRequest
from app.services.explain_service import explain_sql

router = APIRouter()

@router.post("/explain")
def explain(request: ExplainRequest):

    explanation = explain_sql(
        sql=request.sql,
        question=request.question
    )

    return {
        "explanation": explanation
    }