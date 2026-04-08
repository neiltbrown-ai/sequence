import Link from "next/link";
import ButtonArrow from "@/components/ui/button-arrow";

interface CaseStudyGateProps {
  ctaHref?: string;
}

export default function CaseStudyGate({
  ctaHref = "/signup",
}: CaseStudyGateProps) {
  return (
    <div className="cs-gate">
      <div className="cs-gate-content">
        <div className="cs-gate-lbl">In Sequence Membership</div>
        <div className="cs-gate-title">
          Study the structures behind every deal.
        </div>
        <div className="cs-gate-desc">
          Get access to <strong>all case studies</strong>, the full{" "}
          <strong>structure library</strong>, interactive analysis tools, and
          monthly deep-dives into how creative professionals build lasting
          value.
        </div>
        <div className="cs-gate-actions">
          <Link href={ctaHref} className="btn btn--white">
            Become a Member
            <ButtonArrow />
          </Link>
        </div>
      </div>
      <div className="cs-gate-features">
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Full Case Studies</div>
          <div className="cs-gate-feat-desc">
            Deep analysis of real creative deals with interactive breakdowns.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Structure Library</div>
          <div className="cs-gate-feat-desc">
            Every deal structure mapped, scored, and compared across disciplines.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Monthly Deep-Dives</div>
          <div className="cs-gate-feat-desc">
            New analysis published monthly on emerging deal structures.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Advisory Access</div>
          <div className="cs-gate-feat-desc">
            Book sessions with deal structure advisors for personalized guidance.
          </div>
        </div>
      </div>
    </div>
  );
}
