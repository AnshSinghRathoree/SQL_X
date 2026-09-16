export function formatChartData(columns, rows) {
  if (!rows || rows.length === 0) return [];

  // Try to detect numeric column automatically
  let valueIndex = -1;

  for (let i = 0; i < columns.length; i++) {
    const isNumeric = rows.some(row => typeof row[i] === 'number');
    if (isNumeric) {
      valueIndex = i;
      break;
    }
  }

  // If no numeric column found → no chart possible
  if (valueIndex === -1) return [];

  // Pick first non-numeric column as label
  let labelIndex = 0;
  if (labelIndex === valueIndex) labelIndex = 1;

  return rows.map(row => ({
    name: String(row[labelIndex]),
    value: Number(row[valueIndex]) || 0
  }));
}


