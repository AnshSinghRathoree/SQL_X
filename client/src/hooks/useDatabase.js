import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

export function useDatabase() {
  const [db, setDb] = useState(null);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);

  const [datasetStats, setDatasetStats] = useState({
    table: '',
    rows: 0,
    columns: 0,
  });

  const sqlJsRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';

    script.onload = () => {
      window.initSqlJs({
        locateFile: file =>
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
      }).then(SQL => {
        sqlJsRef.current = SQL;

        const savedCSV = localStorage.getItem("savedCSV");
        const savedTable = localStorage.getItem("savedTable");
        const savedStats = localStorage.getItem("datasetStats");

        if (savedStats) {
          setDatasetStats(JSON.parse(savedStats));
        }

        if (savedCSV && savedTable) {
          loadCSV(savedCSV, savedTable);
        }

        setLoading(false);
      });
    };

    document.head.appendChild(script);
  }, []);

  const loadCSV = (csvText, tableName) => {
    if (!sqlJsRef.current) return;

    const result = Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
    });

    const rows = result.data.filter(row =>
      Object.values(row).some(
        val => val !== null && val !== ''
      )
    );

    const columns = result.meta.fields;

    const colDefs = columns.map(col => {
      const sample = rows.find(
        r => r[col] != null
      )?.[col];

      const type =
        typeof sample === 'number'
          ? 'REAL'
          : 'TEXT';

      return {
        name: col,
        type,
      };
    });

    let database =
      new sqlJsRef.current.Database();

    const colDefStr = colDefs
      .map(c => `${c.name} ${c.type}`)
      .join(', ');

    database.run(
      `CREATE TABLE ${tableName} (${colDefStr})`
    );

    const placeholders = columns
      .map(() => '?')
      .join(', ');

    const stmt = database.prepare(
      `INSERT INTO ${tableName} VALUES (${placeholders})`
    );

    rows.forEach(row => {
      stmt.run(
        columns.map(c => {
          let val = row[c];

          if (
            val === undefined ||
            val === null ||
            val === ''
          ) {
            return null;
          }

          return val;
        })
      );
    });

    stmt.free();

    // Update database immediately
    setDb(database);

    // Build new schema
    const schemaData = [
      {
        table: tableName,
        columns: colDefs,
      },
    ];

    // Update schema immediately
    setSchema(schemaData);

    // Build dataset statistics
    const stats = {
      table: tableName,
      rows: rows.length,
      columns: columns.length,
    };

    // Update Dataset Summary immediately
    setDatasetStats(stats);

    // Persist data
    localStorage.setItem(
      "datasetStats",
      JSON.stringify(stats)
    );

    localStorage.setItem(
      "savedCSV",
      csvText
    );

    localStorage.setItem(
      "savedTable",
      tableName
    );

    localStorage.setItem(
      "savedSchema",
      JSON.stringify(schemaData)
    );

    return {
      success: true,
      stats,
    };
  };

  // ===========================
  // AI Dataset Understanding
  // ===========================

  const analyzeDataset = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "http://127.0.0.1:8000/dataset/analyze",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Dataset analysis failed"
      );
    }

    return await response.json();
  };

  // ===========================
  // Run SQL Query
  // ===========================

  const runQuery = sql => {
    if (!db) {
      throw new Error('No DB');
    }

    const res = db.exec(sql);

    if (!res.length) {
      return {
        columns: [],
        rows: [],
      };
    }

    return {
      columns: res[0].columns,
      rows: res[0].values,
    };
  };

  return {
    schema,
    loading,
    loadCSV,
    analyzeDataset,
    runQuery,
    datasetStats,
  };
}