import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

export function useDatabase() {
  const [db, setDb] = useState(null);
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const savedSchema = localStorage.getItem("savedSchema");

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
      Object.values(row).some(val => val !== null && val !== '')
    );
    const columns = result.meta.fields;

    const colDefs = columns.map(col => {
      const sample = rows.find(r => r[col] != null)?.[col];
      const type = typeof sample === 'number' ? 'REAL' : 'TEXT';
      return { name: col, type };
    });

    let database = new sqlJsRef.current.Database();

    const colDefStr = colDefs.map(c => `${c.name} ${c.type}`).join(', ');
    database.run(`CREATE TABLE ${tableName} (${colDefStr})`);

    const placeholders = columns.map(() => '?').join(', ');
    const stmt = database.prepare(
      `INSERT INTO ${tableName} VALUES (${placeholders})`
    );

    rows.forEach(row => {
      stmt.run(
        columns.map(c => {
          let val = row[c];

          if (val === undefined || val === null || val === '') {
            return null;
          }

          return val;
        })
      );
    });

    stmt.free();

    setDb(database);
    setSchema([
      {
        table: tableName,
        columns: colDefs
      }
    ]);
    localStorage.setItem(
      "datasetStats",
      JSON.stringify({
        table: tableName,
        rows: rows.length,
        columns: columns.length
      })
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
      JSON.stringify([
        { table: tableName, columns: colDefs }
      ])
    );

    return true;
  };

  const runQuery = sql => {
    if (!db) throw new Error('No DB');

    const res = db.exec(sql);
    if (!res.length) return { columns: [], rows: [] };

    return {
      columns: res[0].columns,
      rows: res[0].values,
    };
  };

  return { schema, loading, loadCSV, runQuery };
}