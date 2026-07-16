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

    def build_documents(self, metadata: dict):

        documents = []
        ids = []
        metadatas = []

        # Dataset Summary
        documents.append(
            f"""
Dataset Summary

Rows: {metadata['row_count']}
Columns: {metadata['column_count']}

Columns Available:
{', '.join(metadata['columns'])}
"""
        )

        ids.append("dataset_summary")

        metadatas.append({
            "type": "summary"
        })

        # Schema
        schema_text = "Schema\n\n"

        for col in metadata["columns"]:
            dtype = metadata["data_types"][col]
            schema_text += f"{col} ({dtype})\n"

        documents.append(schema_text)

        ids.append("schema")

        metadatas.append({
            "type": "schema"
        })

        # Individual Column Documents
        for column in metadata["columns"]:

            documents.append(
                f"""
Column Name: {column}

Data Type:
{metadata['data_types'][column]}

Missing Values:
{metadata['missing_values'][column]}
"""
            )

            ids.append(f"column_{column}")

            metadatas.append({
                "type": "column",
                "column": column
            })

        return ids, documents, metadatas