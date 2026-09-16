from fastapi import APIRouter

from app.models.query_models import QueryRequest
from app.services.groq_service import generate_sql_with_rag
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/query")
def query(request: QueryRequest):

    rag_service = RAGService()

    context = rag_service.retrieve_context(
        request.question
    )

    sql = generate_sql_with_rag(
        question=request.question,
        context=context
    )

    return {
        "sql": sql,
        "retrieved_context": context
    }


@router.post("/retrieve")
def retrieve(request: QueryRequest):

    rag_service = RAGService()

    context = rag_service.retrieve_context(
        request.question
    )

    print("\n========== RETRIEVED CONTEXT ==========")
    print(context)
    print("=======================================\n")

    return {
        "context": context
    }