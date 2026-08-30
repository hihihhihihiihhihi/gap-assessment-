"use client";

import { useState } from "react";
import {
  AREA_KEYS,
  AREA_LABELS,
  type RankedArea,
} from "@/lib/scoring/gap-calculator";

// Palette validated for CVD separation on a light surface (deutan dE 19.6).
const NOW_COLOR = "#9333ea";
const WANT_COLOR = "#0d9488";

const CX = 210;
const CY = 150;
const R = 100;
const LABEL_R = 122;
const MAX = 10;

function point(index: number, total: number, value: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const r = (R * value) / MAX;
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

function polygon(values: number[], total: number): string {
  return (
    values
      .map((v, i) => {
        const p = point(i, total, v);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join("") + "Z"
  );
}

export default function RadarChart({ areas }: { areas: RankedArea[] }) {
  // Fixed wizard order so the shape is comparable between audits.
  const ordered = [...areas].sort(
    (a, b) => AREA_KEYS.indexOf(a.area) - AREA_KEYS.indexOf(b.area),
  );
  const n = ordered.length;
  const [hover, setHover] = useState<number | null>(null);

  if (n < 3) return null;

  const hovered = hover !== null ? ordered[hover] : null;
  const hoverPos = hover !== null ? point(hover, n, MAX) : null;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 420 300"
        role="img"
        aria-label={`Radar chart across ${n} life areas. ${ordered
          .map(
            (a) =>
              `${AREA_LABELS[a.area]}: the current ${a.now}, wants ${a.want}.`,
          )
          .join(" ")}`}
        className="w-full"
      >
        {[2, 4, 6, 8, 10].map((v) => (
          <path
            key={v}
            d={polygon(Array(n).fill(v), n)}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth="1"
          />
        ))}
        {ordered.map((a, i) => {
          const p = point(i, n, MAX);
          return (
            <line
              key={a.area}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke="#e7e5e4"
              strokeWidth="1"
            />
          );
        })}

        {/* Where she wants to be — dashed, so identity survives without color */}
        <path
          d={polygon(ordered.map((a) => a.want), n)}
          fill={WANT_COLOR}
          fillOpacity="0.06"
          stroke={WANT_COLOR}
          strokeWidth="2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
        {/* The current */}
        <path
          d={polygon(ordered.map((a) => a.now), n)}
          fill={NOW_COLOR}
          fillOpacity="0.16"
          stroke={NOW_COLOR}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {ordered.map((a, i) => {
          const pw = point(i, n, a.want);
          const pn = point(i, n, a.now);
          return (
            <g key={a.area}>
              <circle cx={pw.x} cy={pw.y} r="4" fill={WANT_COLOR} stroke="#fff" strokeWidth="2" />
              <circle cx={pn.x} cy={pn.y} r="4" fill={NOW_COLOR} stroke="#fff" strokeWidth="2" />
            </g>
          );
        })}

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
              key={a.area}
              x={x}
              y={y + 3}
              fontSize="10"
              fontWeight={hover === i ? 600 : 400}
              fill={hover === i ? "#171717" : "#57534e"}
              textAnchor={anchor}
            >
              {AREA_LABELS[a.area]}
            </text>
          );
        })}

        {/* Invisible wedge hit targets — bigger than the marks */}
        {ordered.map((a, i) => {
          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const half = Math.PI / n;
          const p1x = CX + (R + 18) * Math.cos(angle - half);
          const p1y = CY + (R + 18) * Math.sin(angle - half);
          const p2x = CX + (R + 18) * Math.cos(angle + half);
          const p2y = CY + (R + 18) * Math.sin(angle + half);
          return (
            <path
              key={a.area}
              d={`M${CX},${CY} L${p1x.toFixed(1)},${p1y.toFixed(1)} A${R + 18},${R + 18} 0 0 1 ${p2x.toFixed(1)},${p2y.toFixed(1)}Z`}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {hovered && hoverPos && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${(hoverPos.x / 420) * 100}%`,
            top: `${(hoverPos.y / 300) * 100 - 2}%`,
          }}
        >
          <div className="font-semibold text-neutral-900">
            {AREA_LABELS[hovered.area]}
          </div>
          <div className="mt-1 space-y-0.5 text-neutral-600">
            <div>The current {hovered.now}</div>
            <div>Wants {hovered.want}</div>
            <div className="font-medium text-neutral-800">
              The gap +{hovered.gap}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
