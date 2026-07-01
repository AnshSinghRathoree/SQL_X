from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

def explain_sql(sql: str, question: str):

    prompt = f"""
You are an expert business data analyst.

User Question:
{question}

Generated SQL:
{sql}

Explain the query in a way that a non-technical business manager can understand.

Requirements:

1. Start by explaining what business question is being answered.

2. Explain what information the query is looking for.

3. Explain what insights the result can provide.

4. Avoid SQL terminology whenever possible.

5. Do NOT explain SELECT, FROM, GROUP BY, ORDER BY syntax.

6. Write in simple conversational English.

7. Use short paragraphs and bullet points.

8. Mention why the result is useful for decision making.

9. Keep the explanation between 100 and 200 words.

Example style:

This analysis helps identify which products are contributing the most revenue.

The system reviews all sales records and combines sales values for each product. It then ranks products from highest to lowest revenue.

This insight can help:
• Identify best-selling products
• Focus marketing efforts
• Improve inventory planning

A business manager can use these results to understand which products are driving overall sales performance.

Generate only the explanation.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content.strip()