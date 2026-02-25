import Nav from "@/components/nav";
import Footer from "@/components/footer";
import CustomCursor from "@/components/cursor";
import RevealProvider from "@/components/reveal-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CustomCursor />
      <Nav />
      {/* Decorative 8-column grid overlay */}
      <div className="grid-overlay">
        <div className="grid-col" />
        <div className="grid-col" />
        <div className="grid-col" />
        <div className="grid-col" />
        <div className="grid-col" />
        <div className="grid-col" />
        <div className="grid-col" />
        <div className="grid-col" />
      </div>
      <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
      <Footer />
      <RevealProvider />
    </>
  );
}
