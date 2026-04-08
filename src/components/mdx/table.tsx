interface ArticleTableProps {
  headersJson?: string;
  rowsJson?: string;
}

export function ArticleTable({ headersJson, rowsJson }: ArticleTableProps) {
  const h: string[] = headersJson ? JSON.parse(headersJson) : [];
  const r: string[][] = rowsJson ? JSON.parse(rowsJson) : [];

  return (
    <div className="ab-grid is-table">
      <div className="ab-table-wrap">
        <table className="ab-table">
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
