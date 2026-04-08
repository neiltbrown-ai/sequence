export default function PortalLoading() {
  return (
    <div className="portal-loading">
      <div className="portal-loading-bar" />
      <div className="portal-loading-content">
        <div className="portal-loading-block portal-loading-block--title" />
        <div className="portal-loading-block portal-loading-block--row" />
        <div className="portal-loading-block portal-loading-block--row portal-loading-block--short" />
      </div>
    </div>
  );
}
