import type { Metadata } from "next";
import FaqAccordion from "@/components/faq-accordion";
import Link from "next/link";
import ButtonArrow from "@/components/ui/button-arrow";

export const metadata: Metadata = {
  title: "FAQ — In Sequence",
};

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero-title">
          <h1 className="anim-text-up">Frequently Asked<br />Questions</h1>
        </div>
        <div className="faq-hero-sub">
          <p className="rv">
            Everything you need to know about In Sequence, membership plans, and the tools inside.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="faq-body">
        <FaqAccordion />
      </section>

      {/* CTA */}
      <section className="faq-cta">
        <div className="faq-cta-content">
          <h3 className="faq-cta-title rv">Still have questions?</h3>
          <p className="faq-cta-desc rv rv-d1">
            Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="faq-cta-actions rv rv-d2">
            <Link href="/contact" className="btn btn--filled">
              Contact Us
              <ButtonArrow />
            </Link>
            <Link href="/pricing" className="btn">
              View Pricing
              <ButtonArrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
