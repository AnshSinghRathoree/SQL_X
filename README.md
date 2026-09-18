[README.md](https://github.com/user-attachments/files/32367971/README.md)
# SQL_X --- AI Data Analytics Copilot

SQL_X is an AI-powered data analytics copilot that lets users upload CSV
datasets, ask questions in natural language, and receive generated SQL,
query results, AI explanations, and insights.

## 🚀 Live Demo

-   **Frontend:** https://sql-x-nine.vercel.app
-   **Backend:** https://sql-x-2aye.onrender.com
-   **API Docs:** https://sql-x-2aye.onrender.com/docs

## ✨ Features

-   CSV upload and dataset replacement
-   Automatic dataset profiling
-   AI-generated dataset understanding
-   Natural-language data queries
-   RAG-based schema/context retrieval
-   AI SQL generation with Groq
-   SQLite query execution
-   Results displayed in tables
-   AI explanations and insights
-   Dynamic dataset-specific suggested questions
-   SQL auto-fix
-   Query history
-   Export functionality
-   Responsive themed UI

## 🏗️ Architecture

``` text
CSV Upload
    ↓
Dataset Profiling
    ↓
Schema / Dataset Understanding
    ↓
Embedding + ChromaDB RAG
    ↓
Natural Language Question
    ↓
Groq LLM
    ↓
SQL Generation
    ↓
SQLite Execution
    ↓
Results
    ↓
AI Explanation / Insights
```

## 🛠️ Tech Stack

### Frontend

-   React
-   Vite
-   JavaScript
-   CSS

### Backend

-   Python
-   FastAPI
-   Uvicorn
-   Pandas
-   SQLite

### AI / RAG

-   Groq API
-   ChromaDB
-   Lightweight local text vectorization
-   Retrieval-Augmented Generation (RAG)

### Deployment

-   Vercel --- Frontend
-   Render --- Backend

## 📁 Project Structure

``` text
SQL_X/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   └── services/
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## ⚙️ Run Locally

### Clone

``` bash
git clone https://github.com/AnshSinghRathoree/SQL_X.git
cd SQL_X
```

### Backend

``` bash
cd backend
python -m venv venv
```

Windows PowerShell:

``` powershell
.env\Scripts\Activate.ps1
```

Install dependencies:

``` bash
pip install -r requirements.txt
```

Create a `.env` file and add:

``` text
GROQ_API_KEY=your_groq_api_key
```

Start the API:

``` bash
uvicorn main:app --reload
```

Backend:

``` text
http://127.0.0.1:8000
```

Swagger:

``` text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal:

``` bash
cd client
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

## 🔌 Main API Endpoints

  -------------------------------------------------------------------------
  Method                  Endpoint                  Purpose
  ----------------------- ------------------------- -----------------------
  POST                    `/dataset/analyze`        Analyze an uploaded CSV

  POST                    `/dataset/analyze-text`   Analyze dataset text
                                                    and generate AI
                                                    understanding

  POST                    `/api/query`              Generate and execute a
                                                    natural-language SQL
                                                    query

  POST                    `/api/explain`            Generate an AI
                                                    explanation

  POST                    `/api/insights`           Generate dataset
                                                    insights
  -------------------------------------------------------------------------

## 🧠 RAG Pipeline

1.  Extract dataset metadata and schema.
2.  Convert dataset information into searchable documents.
3.  Generate lightweight local vector representations.
4.  Store vectors in ChromaDB.
5.  Vectorize the user's question.
6.  Retrieve relevant dataset context.
7.  Provide the context to the LLM.
8.  Generate SQL grounded in the available schema.

## 💡 Example Questions

``` text
What is the total sales revenue per region?
Which product generated the highest revenue?
How do sales vary over time?
What is the average order value?
Which category contributes most to sales?
```

## ☁️ Deployment

### Frontend --- Vercel

https://sql-x-nine.vercel.app

### Backend --- Render

https://sql-x-2aye.onrender.com

The Render service runs FastAPI with:

``` bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

## 🧪 Tested

The deployed application has been tested with:

-   `sales_data` --- 200 rows, 8 columns
-   `Employee` --- 4,653 rows, 9 columns

The end-to-end flow has been verified from dataset analysis through SQL
generation, execution, and result display.

## 🔐 Security

-   Store API keys in environment variables.
-   Never commit `.env` files or secrets.
-   Treat uploaded datasets as potentially sensitive.
-   Review generated SQL before using the system with sensitive or
    production data.

## 🎯 Goal

SQL_X makes structured-data analysis accessible without requiring users
to manually write SQL.

Instead of:

``` text
Understand schema → Write SQL → Execute → Interpret
```

users can simply ask a question in natural language and let SQL_X handle
the analytics workflow.

## 👨‍💻 Author

**Ansh Singh Rathoree**

GitHub: https://github.com/AnshSinghRathoree/SQL_X

------------------------------------------------------------------------

⭐ If you find SQL_X useful, consider starring the repository.
