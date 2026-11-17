export function FenIllustration({
  restored = false,
  className = "",
}: {
  restored?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`fen-art ${restored ? "fen-restored" : ""} ${className}`}
      role="img"
      aria-label={
        restored
          ? "Willow Fen beginning to recover"
          : "Illustration of degraded Willow Fen"
      }
    >
      <div className="sun-disc" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="hill hill-back" />
      <div className="hill hill-front" />
      <div className="water-shape">
        <span />
        <span />
        <span />
      </div>
      <div className="reed reed-a">
        <i />
        <i />
        <i />
      </div>
      <div className="reed reed-b">
        <i />
        <i />
        <i />
      </div>
      <div className="reed reed-c">
        <i />
        <i />
        <i />
      </div>
      <div className="fen-heron">
        <span className="heron-neck" />
        <span className="heron-beak" />
        <span className="heron-leg" />
      </div>
      <div className="fen-label">
        <span className="label-dot" /> WILLOW FEN <span>·</span> WETLAND 04
      </div>
      {!restored && (
        <div className="blight-wisp">
          <span />
          <span />
          <span />
        </div>
      )}
      {restored && (
        <div className="returning-life">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
      )}
    </div>
  );
}
