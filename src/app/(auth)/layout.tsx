import "./auth.css";
import Nav from "@/components/nav";
import PostHogProvider from "@/components/analytics/posthog-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      <Nav />
      <div className="auth-page">{children}</div>
    </PostHogProvider>
  );
}
