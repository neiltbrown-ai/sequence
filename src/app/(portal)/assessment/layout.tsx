export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No special layout — assessment renders within the standard portal shell
  return <>{children}</>;
}
