import "./auth.css";
import PostHogProvider from "@/components/analytics/posthog-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      <div className="auth-page">{children}</div>
    </PostHogProvider>
  );
}
