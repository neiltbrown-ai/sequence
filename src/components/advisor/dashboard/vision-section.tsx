interface VisionSectionProps {
  twelveMonthTarget: string;
  threeYearHorizon: string;
}

export default function VisionSection({
  twelveMonthTarget,
  threeYearHorizon,
}: VisionSectionProps) {
  return (
    <div className="adv-dash-vision-content">
      <div className="adv-dash-vision-item">
        <h4>12-Month Target</h4>
        <p>{twelveMonthTarget}</p>
      </div>
      <div className="adv-dash-vision-item">
        <h4>3-Year Horizon</h4>
        <p>{threeYearHorizon}</p>
      </div>
    </div>
  );
}
