interface SbImageProps {
  src: string;
  alt?: string;
}

export function SbImage({ src, alt = "" }: SbImageProps) {
  return (
    <div className="sb-grid is-value-img">
      <div className="sb-value-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
      </div>
    </div>
  );
}
