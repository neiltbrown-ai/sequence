import { ReactNode } from "react";

interface CbPullQuoteProps {
  children: ReactNode;
}

export function CbPullQuote({ children }: CbPullQuoteProps) {
  return (
    <div className="cb-grid is-quote">
      <blockquote className="cb-pullquote">{children}</blockquote>
    </div>
  );
}
