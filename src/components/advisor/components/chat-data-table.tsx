"use client";

import { useEffect, useRef } from "react";

interface ChatDataTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
  onReady: () => void;
}

export function ChatDataTable({ title, headers, rows, onReady }: ChatDataTableProps) {
  const resolved = useRef(false);

  useEffect(() => {
    if (!resolved.current) {
      resolved.current = true;
      onReady();
    }
  }, [onReady]);

  if (!headers?.length || !rows?.length) return null;

  return (
    <div className="adv-visual-wrap">
      {title && <div className="adv-visual-title">{title}</div>}
      <div className="adv-visual-table-scroll">
        <table className="adv-visual-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
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
