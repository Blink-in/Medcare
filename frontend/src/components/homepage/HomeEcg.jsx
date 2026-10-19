const HomeEcg = ({ className = "", stroke = "currentColor", animate = true }) => (
  <svg
    viewBox="0 0 400 60"
    preserveAspectRatio="none"
    className={className}
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M0 30 H70 L82 30 L92 8 L104 52 L116 30 H190 L200 30 L210 16 L220 44 L230 30 H400"
      stroke={stroke}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className={animate ? "ecg-path" : ""}
    />
  </svg>
);

export default HomeEcg;
