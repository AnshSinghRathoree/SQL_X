export async function generateSQL(question, schema) {
  try {
    const res = await fetch('http://localhost:8000/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question, schema })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();

    if (!data?.sql) {
      throw new Error("No SQL returned from server");
    }

    return data;

  } catch (err) {
    console.error("❌ generateSQL error:", err.message);
    throw err;
  }
}

export async function explainSQL(sql, question) {
  try {
    const res = await fetch('http://localhost:8000/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, question })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();

    if (!data?.explanation) {
      throw new Error("No explanation returned");
    }

    return data;

  } catch (err) {
    console.error("❌ explainSQL error:", err.message);
    throw err;
  }
}

export async function getInsights(schema) {
  try {
    const res = await fetch('http://localhost:8000/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ schema })
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();

    if (!data?.insights) {
      throw new Error("No insights returned");
    }

    return data;

  } catch (err) {
    console.error("❌ getInsights error:", err.message);
    throw err;
  }
}