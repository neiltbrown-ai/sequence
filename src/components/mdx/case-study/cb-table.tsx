interface CbTableProps {
  headers?: string[];
  rows?: string[][];
  headersJson?: string;
  rowsJson?: string;
}

export function CbTable({ headers, rows, headersJson, rowsJson }: CbTableProps) {
  const h: string[] = headers || (headersJson ? JSON.parse(headersJson) : []);
  const r: string[][] = rows || (rowsJson ? JSON.parse(rowsJson) : []);

  return (
    <div className="cb-grid is-table">
      <div className="cb-table-wrap">
        <table className="cb-table">
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
