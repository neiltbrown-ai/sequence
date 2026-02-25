import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact — In Sequence",
};

export default function ContactPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="ct-hero">
        <div className="ct-hero-title">
          <h1 className="anim-text-up">Contact</h1>
        </div>
        <div className="ct-hero-sub">
          <div className="ct-hero-sub-grid">
            <p className="ct-hero-desc rv">
              <strong>Have a question or want to connect?</strong> Fill out the
              form below and we&apos;ll get back to you. We typically respond
              within 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FORM + INFO ===== */}
      <section className="ct-form-section">
        <ContactForm />
      </section>
    </>
  );
}
