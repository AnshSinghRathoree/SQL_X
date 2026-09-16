export default function SchemaPanel({ schema }) {
  if (!schema?.length) return null;
  return (
    <div className="schema-panel">
      {schema.map(table => (
        <div key={table.table} className="schema-table">
          <div className="schema-table-name">{table.table}</div>
          <div className="schema-cols">
            {table.columns.map(col => (
              <div key={col.name} className="schema-col">
                <span className="col-name">{col.name}</span>
                <span className="col-type">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


