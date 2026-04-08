/* eslint-disable @next/next/no-img-element */

export function BreakoutImage({
  src,
  alt,
  caption,
  credit,
}: {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}) {
  return (
    <div className="ab-grid is-img">
      <div className="ab-img-wide rv vis">
        <img src={src} alt={alt} />
        {caption && <div className="ab-img-caption">{caption}</div>}
        {credit && <div className="ab-img-credit">{credit}</div>}
      </div>
    </div>
  );
}

export function FullWidthImage({
  src,
  alt,
  caption,
  credit,
}: {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}) {
  return (
    <div className="ab-grid is-img-full">
      <div className="ab-img-full rv vis">
        <img src={src} alt={alt} />
        {caption && (
          <div
            className="ab-img-caption"
            style={{ padding: "0 calc(12.5% + var(--gutter))" }}
          >
            {caption}
          </div>
        )}
        {credit && (
          <div
            className="ab-img-credit"
            style={{ padding: "0 calc(12.5% + var(--gutter))" }}
          >
            {credit}
          </div>
        )}
      </div>
    </div>
  );
}
