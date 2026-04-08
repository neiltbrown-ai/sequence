/**
 * BrowserFrame — wraps an image or video in a minimal browser-window chrome SVG
 * with a light drop shadow for subtle depth.
 *
 * Pass `video` prop for an auto-playing looping video instead of a static image.
 */
export default function BrowserFrame({
  src,
  alt,
  video,
}: {
  src?: string;
  alt: string;
  video?: string;
}) {
  return (
    <div className="browser-frame">
      <div className="browser-frame-chrome">
        <svg
          viewBox="0 0 800 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="browser-frame-bar"
          preserveAspectRatio="none"
        >
          {/* Title bar background */}
          <rect width="800" height="28" rx="8" fill="#E8E8E8" />
          {/* Bottom corners are square (content sits flush below) */}
          <rect x="0" y="8" width="800" height="20" fill="#E8E8E8" />
          {/* Traffic light dots */}
          <circle cx="20" cy="14" r="4.5" fill="#D4D4D4" />
          <circle cx="36" cy="14" r="4.5" fill="#D4D4D4" />
          <circle cx="52" cy="14" r="4.5" fill="#D4D4D4" />
          {/* URL bar */}
          <rect x="120" y="7" width="560" height="14" rx="4" fill="#F5F5F5" />
        </svg>
      </div>
      {video ? (
        <video
          className="browser-frame-img"
          autoPlay
          loop
          muted
          playsInline
          aria-label={alt}
        >
          <source src={video} type="video/mp4" />
          {/* Fallback to image if video can't load */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src && <img className="browser-frame-img" src={src} alt={alt} />}
        </video>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className="browser-frame-img" src={src} alt={alt} />
      )}
    </div>
  );
}
