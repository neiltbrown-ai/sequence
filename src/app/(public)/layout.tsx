import Nav from "@/components/nav";
import Footer from "@/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
    </>
  );
}
