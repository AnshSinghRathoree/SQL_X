from fastapi import FastAPI
from app.services.groq_service import test_groq
from app.api.query import router as query_router
from app.api.explain import router as explain_router
from app.api.insights import router as insights_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="QueryAI Backend",
    version="1.0.0"
)
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    print("VALIDATION ERROR:", exc.errors())

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query_router, prefix="/api")
app.include_router(explain_router, prefix="/api")
app.include_router(insights_router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "running",
        "message": "FastAPI backend is working"
    }

@app.get("/test-groq")
def test():
    return {
        "response": test_groq()
    }