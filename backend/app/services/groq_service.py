from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def test_groq():
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
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
        model="llama-3.3-70b-versatile",
        temperature=temperature,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content.strip()


def generate_sql(question: str, schema: list):

    schema_text = ""

    for table in schema:
        schema_text += f"Table: {table['table']}\nColumns:\n"

        for column in table["columns"]:
            schema_text += f"  {column['name']} ({column['type']})\n"

        schema_text += "\n"

    prompt = f"""
You are an expert SQLite SQL generator for business analytics.

DATABASE SCHEMA:
{schema_text}

BUSINESS DEFINITIONS:

- Revenue = SUM(Sales)
- Total Sales = SUM(Sales)
- Sales Performance = SUM(Sales)

- Quantity Sold = SUM(Quantity)
- Product Performance = GROUP BY Product
- Category Performance = GROUP BY Category
- Regional Performance = GROUP BY Region

SQL GENERATION RULES:

1. Return ONLY executable SQLite SQL.
2. Never return markdown.
3. Never explain the query.
4. Use exact table and column names from schema.
5. Always use aliases for aggregated columns.

6. When using:
   SUM()
   AVG()
   COUNT()
   MIN()
   MAX()

   Include the aggregation in SELECT.

7. For ranking queries:
   - highest
   - best
   - top
   - most

   Use:
   ORDER BY DESC
   LIMIT

8. For:
   - lowest
   - least
   - worst

   Use:
   ORDER BY ASC

9. For product analysis:
   GROUP BY Product

10. For category analysis:
    GROUP BY Category

11. For regional analysis:
    GROUP BY Region

12. For monthly trends:
    Use SQLite STRFTIME('%Y-%m', Date)

13. Always generate production-quality SQL.

EXAMPLES:

Question:
Which product generated the highest total sales?

SQL:
SELECT Product,
       SUM(Sales) AS TotalSales
FROM sales_data
GROUP BY Product
ORDER BY TotalSales DESC
LIMIT 1;

Question:
Which category generated the highest revenue?

SQL:
SELECT Category,
       SUM(Sales) AS TotalRevenue
FROM sales_data
GROUP BY Category
ORDER BY TotalRevenue DESC
LIMIT 1;

Question:
Which products sold the highest quantity?

SQL:
SELECT Product,
       SUM(Quantity) AS TotalQuantity
FROM sales_data
GROUP BY Product
ORDER BY TotalQuantity DESC
LIMIT 10;

QUESTION:
{question}

SQL:
"""

    sql = chat(prompt)

    sql = sql.replace("```sql", "")
    sql = sql.replace("```", "")
    sql = sql.strip()

    return sql