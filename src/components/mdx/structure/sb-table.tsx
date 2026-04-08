interface SbTableProps {
  headers?: string[];
  rows?: string[][];
  headersJson?: string;
  rowsJson?: string;
}

export function SbTable({ headers, rows, headersJson, rowsJson }: SbTableProps) {
  const h: string[] = headers || (headersJson ? JSON.parse(headersJson) : []);
  const r: string[][] = rows || (rowsJson ? JSON.parse(rowsJson) : []);

  return (
    <div className="sb-grid is-table">
      <div className="sb-table-wrap">
        <table className="sb-table">
          <thead>
            <tr>
              {h.map((hdr) => (
                <th key={hdr}>{hdr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
