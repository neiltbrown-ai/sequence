import Link from "next/link";
import ButtonArrow from "@/components/ui/button-arrow";

/**
 * Advisory CTA at the bottom of the Roadmap page — same visual pattern
 * as the public case-study gate (dark band with features on the right).
 * Prompts members who want help translating their roadmap into action.
 */
export default function RoadmapAdvisoryCTA() {
  return (
    <div className="cs-gate">
      <div className="cs-gate-content">
        <div className="cs-gate-lbl">1:1 Advisory</div>
        <div className="cs-gate-title">
          Get help turning this plan into action.
        </div>
        <div className="cs-gate-desc">
          Your roadmap maps the structural moves. A Sequence advisor helps
          you execute them — deal review, negotiation prep, entity setup,
          and accountability through the transitions that matter.
        </div>
        <div className="cs-gate-actions">
          <Link href="/coaching" className="btn btn--white">
            Book a Session
            <ButtonArrow />
          </Link>
        </div>
      </div>
      <div className="cs-gate-features">
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Deal Review</div>
          <div className="cs-gate-feat-desc">
            Pressure-test specific offers before you sign — structures,
            red flags, alternative approaches.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Negotiation Prep</div>
          <div className="cs-gate-feat-desc">
            Language, leverage, and fallbacks before you walk into the
            conversation.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Structural Moves</div>
          <div className="cs-gate-feat-desc">
            Entity formation, IP protection, advisory arrangements — the
            infrastructure your next stage requires.
          </div>
        </div>
        <div className="cs-gate-feat">
          <div className="cs-gate-feat-title">Accountability</div>
          <div className="cs-gate-feat-desc">
            Progress checkpoints that keep you moving through the
            transitions the roadmap identifies.
          </div>
        </div>
      </div>
    </div>
  );
}
