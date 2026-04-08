"use client";

interface OpeningCardsProps {
  onSelect: (path: "deal" | "map" | "explore") => void;
}

export default function ChatOpeningCards({ onSelect }: OpeningCardsProps) {
  return (
    <div className="adv-opening-cards">
      <div className="adv-opening-cards-row">
        <button
          type="button"
          className="adv-opening-card"
          onClick={() => onSelect("deal")}
        >
          <span className="adv-opening-card-icon">&#9997;</span>
          <h3 className="adv-opening-card-title">I have a deal to evaluate</h3>
          <p className="adv-opening-card-desc">
            Get clarity on a specific offer or opportunity.
          </p>
        </button>

        <button
          type="button"
          className="adv-opening-card"
          onClick={() => onSelect("map")}
        >
          <span className="adv-opening-card-icon">&#9678;</span>
          <h3 className="adv-opening-card-title">Map my position</h3>
          <p className="adv-opening-card-desc">
            Understand where you stand and what to do next.
          </p>
        </button>
      </div>

      <button
        type="button"
        className="adv-opening-card adv-opening-card-full"
        onClick={() => onSelect("explore")}
      >
        <span className="adv-opening-card-icon">&#128269;</span>
        <h3 className="adv-opening-card-title">I&#39;m just exploring</h3>
        <p className="adv-opening-card-desc">
          Browse the framework, ask questions, see what&#39;s possible.
        </p>
      </button>
    </div>
  );
}
