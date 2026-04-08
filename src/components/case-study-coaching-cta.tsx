import Link from "next/link";
import ButtonArrow from "@/components/ui/button-arrow";

export default function CaseStudyCoachingCta() {
  return (
    <div className="cs-gate">
      <div className="cs-gate-content">
        <div className="cs-gate-lbl">1:1 Advisory</div>
        <div className="cs-gate-title">
          Apply these structures to your own deals.
        </div>
        <div className="cs-gate-desc">
          Book a <strong>1:1 coaching session</strong> to work through your
          specific deal, contract, or partnership with an advisor who
          understands creative business structures inside and out.
        </div>
        <div className="cs-gate-actions">
          <Link href="/contact" className="btn btn--white">
            Book a Session
            <ButtonArrow />
          </Link>
        </div>
      </div>
      <div className="cs-gate-features">
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Deal Review</div>
          <div className="cs-gate-feat-desc">
            Walk through your current contract or proposal line by line with
            expert guidance.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Structure Selection</div>
          <div className="cs-gate-feat-desc">
            Identify which deal structures from the library apply to your
            specific situation.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Negotiation Strategy</div>
          <div className="cs-gate-feat-desc">
            Build a framework for your next conversation with clear terms,
            fallbacks, and leverage points.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Included with Membership</div>
          <div className="cs-gate-feat-desc">
            Members get priority booking and discounted session rates as part
            of their subscription.
          </div>
        </div>
      </div>
    </div>
  );
}
