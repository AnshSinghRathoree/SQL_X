from groq import Groq
from dotenv import load_dotenv
import os
import json

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_insights(schema: list):

    schema_text = ""

    for table in schema:
        schema_text += f"Table {table['table']}: "

        columns = [
            f"{col['name']} ({col['type']})"
            for col in table["columns"]
        ]

        schema_text += ", ".join(columns)
        schema_text += "\n"

    prompt = f"""
You are a data analyst.

Given a database schema, generate 4 useful analytical SQL queries.

RULES:
- Use only given schema
- Each query must be meaningful
- Use aggregation (SUM, COUNT, AVG)
- Ensure results are chart-friendly (1 category + 1 numeric)
- Use GROUP BY when needed
- Keep queries simple

Return ONLY valid JSON array:

[
  {{
    "title": "...",
    "sql": "..."
  }}
]

SCHEMA:
{schema_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    text = response.choices[0].message.content.strip()

    return json.loads(text)