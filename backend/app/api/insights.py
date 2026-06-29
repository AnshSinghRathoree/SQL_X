from fastapi import APIRouter
from app.models.insight_models import InsightRequest
from app.services.insight_service import generate_insights

router = APIRouter()

@router.post("/insights")
def insights(request: InsightRequest):

    insights = generate_insights(
        schema=request.schema_data
    )

    return {
        "insights": insights
    }