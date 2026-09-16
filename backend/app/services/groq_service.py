from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def test_groq():
    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": "Say Hello"
            }
        ]
    )

    return response.choices[0].message.content.strip()


def chat(prompt: str, temperature: float = 0.1) -> str:
    """
    Generic Groq chat function.
    Reusable for SQL generation, Dataset Understanding,
    AI Insights, Explanations, RAG, etc.
    """

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        temperature=temperature,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content.strip()


def generate_sql_with_rag(question: str, context: str):

    print("\n" + "=" * 80)
    print("QUESTION")
    print("=" * 80)
    print(question)

    print("\n" + "=" * 80)
    print("RETRIEVED CONTEXT")
    print("=" * 80)
    print(context)

    prompt = f"""
You are an expert SQLite SQL generator.

The retrieved context contains the complete database schema.

IMPORTANT INSTRUCTIONS:

1. Identify the table name from the retrieved context.
2. Use ONLY that table name.
3. Never invent table names.
4. Never rename the table.
5. If the retrieved context contains:

Table Name:
sales_data

then every query MUST use:

FROM sales_data

Never use:

- Orders
- Customers
- Products
- dataset
- table
- my_table
- main

Use ONLY tables and columns present in the retrieved context.

=========================
RETRIEVED CONTEXT
=========================

{context}

=========================
QUESTION
=========================

{question}

=========================
RULES
=========================

- Return ONLY valid SQLite SQL.
- No markdown.
- No explanation.
- Use only columns from the schema.
- Use proper GROUP BY when using aggregates.
- For highest/top/best use ORDER BY DESC LIMIT 1.
- For lowest/least use ORDER BY ASC LIMIT 1.

SQL:
"""

    sql = chat(prompt, temperature=0)

    sql = sql.replace("```sql", "")
    sql = sql.replace("```", "")
    sql = sql.strip()

    print("\n" + "=" * 80)
    print("GENERATED SQL")
    print("=" * 80)
    print(sql)
    print("=" * 80 + "\n")

    return sql