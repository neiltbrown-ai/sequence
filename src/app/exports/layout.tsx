/**
 * Exports layout — completely bare. No navbar, footer, grid overlay, or background.
 * Pure transparent canvas for screenshotting individual UI elements.
 */
export default function ExportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
