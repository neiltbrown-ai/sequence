import type { ReactNode } from "react";

export function PullQuote({
  children,
  attribution,
}: {
  children: ReactNode;
  attribution?: string;
}) {
  return (
    <div className="ab-grid is-pullquote">
      <div className="ab-pullquote rv vis">
        {children}
        {attribution && (
          <div className="ab-pullquote-attr">&mdash; {attribution}</div>
        )}
      </div>
    </div>
  );
}
