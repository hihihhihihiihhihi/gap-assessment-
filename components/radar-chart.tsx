"use client";

import { useState } from "react";
import type { AreaResult } from "@/lib/assessment/scoring";

// Series colors validated for CVD separation on a light surface
// (current #9333ea vs desired #0d9488, deutan ΔE 19.6, tritan 17.0).
const CURRENT_COLOR = "#9333ea";
const DESIRED_COLOR = "#0d9488";

const CX = 210;
const CY = 150;
const R = 100;
const LABEL_R = 122;
const MAX_SCORE = 10;

function shortName(name: string): string {
  return name.split(" & ")[0];
}

function point(index: number, total: number, value: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (R * value) / MAX_SCORE;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function polygonPath(values: number[], total: number): string {
  return (
    values
      .map((v, i) => {
        const p = point(i, total, v);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join("") + "Z"
  );
}

export default function RadarChart({ areas }: { areas: AreaResult[] }) {
  // Stable canonical order so the shape is comparable across assessments
  const ordered = [...areas].sort((a, b) => a.sort_order - b.sort_order);
  const n = ordered.length;
  const [hover, setHover] = useState<number | null>(null);

  if (n < 3) return null;

  const rings = [2, 4, 6, 8, 10];
  const currentPath = polygonPath(
    ordered.map((a) => a.current_score),
    n,
  );
  const desiredPath = polygonPath(
    ordered.map((a) => a.desired_score),
    n,
  );
  const hovered = hover !== null ? ordered[hover] : null;
  const hoverPos = hover !== null ? point(hover, n, MAX_SCORE) : null;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label={`Radar chart of current versus desired scores across ${n} life areas. ${ordered
          .map(
            (a) =>
              `${a.life_area_name}: current ${a.current_score}, desired ${a.desired_score}.`,
          )
          .join(" ")}`}
        className="w-full"
      >
        {/* Grid rings + spokes (recessive) */}
        {rings.map((v) => (
          <path
            key={v}
            d={polygonPath(Array(n).fill(v), n)}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="1"
          />
        ))}
        {ordered.map((a, i) => {
          const p = point(i, n, MAX_SCORE);
          return (
            <line
              key={a.life_area_id}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke="#e5e5e5"
              strokeWidth="1"
            />
          );
        })}
        <text x={CX + 3} y={CY - (R * 4) / MAX_SCORE - 3} fontSize="8" fill="#a3a3a3">
          4
        </text>
        <text x={CX + 3} y={CY - (R * 8) / MAX_SCORE - 3} fontSize="8" fill="#a3a3a3">
          8
        </text>

        {/* Desired (target) polygon — dashed as secondary encoding */}
        <path
          d={desiredPath}
          fill={DESIRED_COLOR}
          fillOpacity="0.06"
          stroke={DESIRED_COLOR}
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
        {/* Current polygon */}
        <path
          d={currentPath}
          fill={CURRENT_COLOR}
          fillOpacity="0.16"
          stroke={CURRENT_COLOR}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Vertex markers with a 2px surface ring where series overlap */}
        {ordered.map((a, i) => {
          const pd = point(i, n, a.desired_score);
          const pc = point(i, n, a.current_score);
          return (
            <g key={a.life_area_id}>
              <circle cx={pd.x} cy={pd.y} r="4" fill={DESIRED_COLOR} stroke="#ffffff" strokeWidth="2" />
              <circle cx={pc.x} cy={pc.y} r="4" fill={CURRENT_COLOR} stroke="#ffffff" strokeWidth="2" />
            </g>
          );
        })}

        {/* Axis labels */}
        {ordered.map((a, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const x = CX + LABEL_R * Math.cos(angle);
          const y = CY + LABEL_R * Math.sin(angle);
          const anchor =
            Math.abs(Math.cos(angle)) < 0.3
              ? "middle"
              : Math.cos(angle) > 0
                ? "start"
                : "end";
          return (
            <text
              key={a.life_area_id}
              x={x}
              y={y + 3}
              fontSize="10"
              fontWeight={hover === i ? 600 : 400}
              fill={hover === i ? "#171717" : "#525252"}
              textAnchor={anchor}
            >
              {shortName(a.life_area_name)}
            </text>
          );
        })}

        {/* Invisible per-sector hover targets (wedges) */}
        {ordered.map((a, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const half = Math.PI / n;
          const p1x = CX + (R + 18) * Math.cos(angle - half);
          const p1y = CY + (R + 18) * Math.sin(angle - half);
          const p2x = CX + (R + 18) * Math.cos(angle + half);
          const p2y = CY + (R + 18) * Math.sin(angle + half);
          return (
            <path
              key={a.life_area_id}
              d={`M${CX},${CY} L${p1x.toFixed(1)},${p1y.toFixed(1)} A${R + 18},${R + 18} 0 0 1 ${p2x.toFixed(1)},${p2y.toFixed(1)}Z`}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && hoverPos && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${(hoverPos.x / 420) * 100}%`,
            top: `${(hoverPos.y / 300) * 100 - 2}%`,
          }}
        >
          <div className="font-semibold text-neutral-900">
            {hovered.life_area_name}
          </div>
          <div className="mt-1 space-y-0.5 text-neutral-600">
            <div>
              <span
                aria-hidden
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: CURRENT_COLOR }}
              />
              Current {hovered.current_score}
            </div>
            <div>
              <span
                aria-hidden
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: DESIRED_COLOR }}
              />
              Desired {hovered.desired_score}
            </div>
            <div className="font-medium text-neutral-800">
              Gap +{hovered.gap_score}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-neutral-600">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CURRENT_COLOR }}
          />
          Current
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="18" height="6" aria-hidden>
            <line
              x1="0"
              y1="3"
              x2="18"
              y2="3"
              stroke={DESIRED_COLOR}
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          </svg>
          Desired
        </span>
      </div>
    </div>
  );
}
