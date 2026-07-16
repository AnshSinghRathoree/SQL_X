from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.dataset_models import DatasetTextRequest
from app.services.dataset_service import DatasetService
from app.services.rag_service import RAGService

import tempfile
import shutil
import os

router = APIRouter(prefix="/dataset", tags=["Dataset"])

dataset_service = DatasetService()
rag_service = RAGService()


# ---------- Upload CSV ----------
@router.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )

    temp_file = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file = tmp.name

        # Extract metadata
        metadata = dataset_service.extract_metadata(temp_file)

        # Build embeddings and store them in ChromaDB
        rag_service.index_dataset(metadata)

        # AI Dataset Profile
        result = dataset_service.analyze_dataset(metadata)

        return result

    finally:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)


# ---------- Analyze CSV Text ----------
@router.post("/analyze-text")
async def analyze_dataset_text(request: DatasetTextRequest):

    # Extract metadata
    metadata = dataset_service.extract_metadata_from_text(
        request.csv_text
    )

    # Build embeddings and store them in ChromaDB
    rag_service.index_dataset(metadata)

    # AI Dataset Profile
    result = dataset_service.analyze_dataset(metadata)

    return result