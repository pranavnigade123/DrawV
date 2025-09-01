"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Icons available in public/icons.
 * Use root-relative paths (Next.js serves /public as web root).
 */
const ICONS = [
  { kind: "code", src: "/icons/code.png", count: 7 },
  { kind: "console", src: "/icons/console.png", count: 6 },
  { kind: "developer", src: "/icons/developer.png", count: 6 },
  { kind: "figma", src: "/icons/figma.png", count: 5 },
  { kind: "live", src: "/icons/live.png", count: 5 },
] as const;

type IconKind = typeof ICONS[number]["kind"];

type IconSpec = {
  id: string;
  kind: IconKind;
  src: string;
  leftPct: number; // 0..100 (vw)
  topPct: number;  // 0..100 (vh)
  size: number;    // px
  opacity: number; // 0..1
  rotate: number;  // deg
};

const CONFIG = {
  size: { min: 26, max: 46 },
  opacity: { min: 0.10, max: 0.18 },
  driftStrength: 10, // px across full section scroll; set 0 to disable
  paddingVW: 3.5,
  paddingVH: 6,
  leftBias: 0.65, // slightly more icons toward the left
};

/* ---------- Deterministic RNG to avoid layout shifts ---------- */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function biasedLeftPercent(rnd: () => number, bias: number) {
  // Blend skewed-left with uniform for pleasant scatter
  const u = rnd();
  const skew = Math.pow(u, 2.2); // skew toward 0 (left)
  return 100 * (bias * skew + (1 - bias) * u);
}

function generateIcons(seed = 20250826): IconSpec[] {
  const rnd = mulberry32(seed);
  const specs: IconSpec[] = [];
  const padX = CONFIG.paddingVW;
  const padY = CONFIG.paddingVH;

  for (const { kind, src, count } of ICONS) {
    for (let i = 0; i < count; i++) {
      // Horizontal distribution: left-biased but can appear anywhere
      const left = rnd() < 0.7 ? biasedLeftPercent(rnd, CONFIG.leftBias) : 100 * rnd();
      const leftPct = clamp(left, padX, 100 - padX);

      // Vertical distribution: encourage top and bottom thirds for composition
      const r = rnd();
      let topRaw =
        r < 0.45
          ? Math.pow(rnd(), 1.8) * 38
          : r < 0.9
          ? 62 + Math.pow(rnd(), 1.8) * 38
          : 38 + rnd() * 24;
      const topPct = clamp(topRaw, padY, 100 - padY);

      const size = Math.round(lerp(CONFIG.size.min, CONFIG.size.max, rnd()));
      const opacity = lerp(CONFIG.opacity.min, CONFIG.opacity.max, rnd());
      const rotate = Math.round(lerp(-8, 8, rnd()));

      specs.push({
        id: `${kind}-${i}`,
        kind,
        src,
        leftPct,
        topPct,
        size,
        opacity,
        rotate,
      });
    }
  }
  return specs;
}

/* ---------- Page ---------- */
export default function DemoScatterPage() {
  const icons = useMemo(() => generateIcons(20250826), []);

  // Optional gentle drift tied to scroll
  const [offsetY, setOffsetY] = useState(0);
  useEffect(() => {
    if (!CONFIG.driftStrength) return;
    let raf = 0;
    const onScroll = () => {
      const y = window.scrollY || 0;
      // Scale drift based on viewport height for subtlety
      const drift = (y / window.innerHeight) * CONFIG.driftStrength;
      raf = requestAnimationFrame(() => setOffsetY(drift));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <main style={{ position: "relative", minHeight: "220vh", background: "#0e0e0e" }}>
      {/* Fixed black background + scattered icons */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "#0e0e0e",
          transform: `translateY(${offsetY.toFixed(2)}px)`,
          willChange: "transform",
        }}
      >
        {icons.map((ic) => (
          <img
            key={ic.id}
            src={ic.src}
            alt=""
            width={ic.size}
            height={ic.size}
            style={{
              position: "absolute",
              left: `${ic.leftPct}vw`,
              top: `${ic.topPct}vh`,
              transform: `translate(-50%, -50%) rotate(${ic.rotate}deg)`,
              opacity: ic.opacity,
              filter:
                "drop-shadow(0 0 10px rgba(124,93,255,.45)) drop-shadow(0 0 18px rgba(124,93,255,.28))",
              imageRendering: "auto",
            }}
          />
        ))}
      </div>

      {/* Foreground content: transparent and scrollable */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          color: "#eaeaea",
          padding: "12vh 6vw",
          maxWidth: 1100,
          margin: "0 auto",
          background: "transparent",
        }}
      >
        <h1 style={{ fontSize: "clamp(34px,6vw,68px)", lineHeight: 1.05, margin: 0 }}>
          Transparent content over a scattered icon background
        </h1>
        <p style={{ opacity: 0.85, marginTop: 16 }}>
          Icons are served from public/icons and arranged randomly across the screen with a subtle glow.
          Foreground stays transparent and scrolls independently.
        </p>

        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <article
              key={i}
              style={{
                padding: 20,
                borderRadius: 14,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ddd",
              }}
            >
              <h3 style={{ margin: "0 0 8px" }}>Card {i + 1}</h3>
              <p style={{ opacity: 0.82 }}>Add real content here. The background remains visible and fixed.</p>
            </article>
          ))}
        </div>

        <div style={{ height: "70vh" }} />
        <h2>More sections</h2>
        <p style={{ opacity: 0.82 }}>Extend the page; the icon layer won’t move or reflow.</p>
        <div style={{ height: "70vh" }} />
      </section>

      {/* Minor responsive/a11y tweaks */}
      <style>{`
        @media (max-width: 640px) {
          img[alt=""] { transform-origin: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          /* Neutralize drift for motion-sensitive users */
          :root { scroll-behavior: auto; }
        }
      `}</style>
    </main>
  );
}
