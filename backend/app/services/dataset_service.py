import json
from io import StringIO

import pandas as pd

from app.models.dataset_models import DatasetUnderstandingResponse
from app.services.groq_service import chat


class DatasetService:

    def extract_metadata(self, file_path: str):

        df = pd.read_csv(file_path)

        metadata = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "data_types": {
                col: str(dtype)
                for col, dtype in df.dtypes.items()
            },
            "missing_values": df.isnull().sum().to_dict(),
            "sample_rows": df.head(5).to_dict(orient="records")
        }

        return metadata

    def build_prompt(self, metadata: dict) -> str:

        prompt = f"""
You are an expert data analyst.

Analyze the following dataset metadata.

Return ONLY valid JSON.

Do not include markdown.
Do not include explanations.

Metadata:

Rows:
{metadata["row_count"]}

Columns:
{metadata["columns"]}

Data Types:
{metadata["data_types"]}

Missing Values:
{metadata["missing_values"]}

Sample Rows:
{metadata["sample_rows"]}

Return exactly this JSON:

{{
"title":"",
"summary":"",
"business_domain":"",
"analysis_capabilities":[],
"suggested_questions":[]
}}
"""

        return prompt

    def analyze_dataset(self, metadata: dict) -> DatasetUnderstandingResponse:

        prompt = self.build_prompt(metadata)

        response = chat(prompt, temperature=0)

        response = response.replace("```json", "")
        response = response.replace("```", "")
        response = response.strip()

        data = json.loads(response)

        return DatasetUnderstandingResponse(**data)

    def extract_metadata_from_text(self, csv_text: str):

        df = pd.read_csv(StringIO(csv_text))

        metadata = {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "data_types": {
                col: str(dtype)
                for col, dtype in df.dtypes.items()
            },
            "missing_values": df.isnull().sum().to_dict(),
            "sample_rows": df.head(5).to_dict(orient="records")
        }

        return metadata