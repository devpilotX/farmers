import type { Point } from "../types";
export function PlotPreview({
  points,
  name,
}: {
  points: Point[];
  name: string;
}) {
  const lng = points.map((point) => point.longitude);
  const lat = points.map((point) => point.latitude);
  const width = Math.max(...lng) - Math.min(...lng);
  const height = Math.max(...lat) - Math.min(...lat);
  const scale = 210 / Math.max(width, height, 0.000001);
  const polygon = points
    .map(
      (point) =>
        `${45 + (point.longitude - Math.min(...lng)) * scale},${265 - (point.latitude - Math.min(...lat)) * scale}`,
    )
    .join(" ");
  return (
    <div className="plot-preview">
      <svg
        viewBox="0 0 320 310"
        role="img"
        aria-label={`Recorded boundary of ${name}. Schematic, not a risk map.`}
      >
        <defs>
          <pattern
            id="plot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="#b1c4b3"
              strokeWidth="0.6"
            />
          </pattern>
          <pattern
            id="plot-lines"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#315d43"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="320" height="310" fill="#e9eee3" />
        <rect width="320" height="310" fill="url(#plot-grid)" />
        <polygon
          points={polygon}
          fill="#b8cc96"
          stroke="#315d43"
          strokeWidth="3"
        />
        <polygon points={polygon} fill="url(#plot-lines)" opacity=".3" />
        {points.slice(0, -1).map((point, index) => (
          <circle
            key={index}
            cx={45 + (point.longitude - Math.min(...lng)) * scale}
            cy={265 - (point.latitude - Math.min(...lat)) * scale}
            r="4"
            fill="#fff"
            stroke="#315d43"
            strokeWidth="2"
          />
        ))}
        <text x="284" y="30" fill="#315d43" fontSize="14">
          N ↑
        </text>
      </svg>
      <span className="plot-label">Recorded plot · schematic only</span>
    </div>
  );
}
