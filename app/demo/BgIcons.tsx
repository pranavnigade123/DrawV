// "use client";

// import { useEffect, useMemo, useState } from "react";

// /**
//  * Icons stored in /public/icons
//  * Replace or adjust counts as desired.
//  */
// const ICONS = [
//   { kind: "code", src: "/icons/code.png", count: 7 },
//   { kind: "console", src: "/icons/console.png", count: 6 },
//   { kind: "developer", src: "/icons/developer.png", count: 6 },
//   { kind: "figma", src: "/icons/figma.png", count: 5 },
//   { kind: "live", src: "/icons/live.png", count: 5 },
// ] as const;

// type IconKind = typeof ICONS[number]["kind"];

// type IconSpec = {
//   id: string;
//   kind: IconKind;
//   src: string;
//   leftPct: number; // vw
//   topPct: number;  // vh
//   size: number;    // px
//   opacity: number; // 0..1
//   rotate: number;  // deg
// };

// const CONFIG = {
//   size: { min: 26, max: 46 },
//   opacity: { min: 0.10, max: 0.18 },
//   driftStrength: 10,            // subtle scroll-linked drift in px; set 0 to disable
//   paddingVW: 3.5,
//   paddingVH: 6,
//   leftBias: 0.65,               // slightly more icons toward the left
//   seed: 20250826,               // change to reshuffle
// };

// /* Deterministic RNG so positions are stable between client renders */
// function mulberry32(seed: number) {
//   return function () {
//     let t = (seed += 0x6D2B79F5);
//     t = Math.imul(t ^ (t >>> 15), t | 1);
//     t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
//     return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
//   };
// }
// const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
// const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// function biasedLeftPercent(rnd: () => number, bias: number) {
//   const u = rnd();
//   const skew = Math.pow(u, 2.2); // skew toward 0 (left)
//   return 100 * (bias * skew + (1 - bias) * u);
// }

// function generateIcons(seed: number): IconSpec[] {
//   const rnd = mulberry32(seed);
//   const specs: IconSpec[] = [];
//   const padX = CONFIG.paddingVW;
//   const padY = CONFIG.paddingVH;

//   for (const { kind, src, count } of ICONS) {
//     for (let i = 0; i < count; i++) {
//       const left = Math.random() < 0.7
//         ? biasedLeftPercent(rnd, CONFIG.leftBias)
//         : 100 * rnd();
//       const leftPct = clamp(left, padX, 100 - padX);

//       // Vertical: favor top and bottom thirds
//       const r = rnd();
//       let topRaw =
//         r < 0.45
//           ? Math.pow(rnd(), 1.8) * 38
//           : r < 0.9
//           ? 62 + Math.pow(rnd(), 1.8) * 38
//           : 38 + rnd() * 24;
//       const topPct = clamp(topRaw, padY, 100 - padY);

//       const size = Math.round(lerp(CONFIG.size.min, CONFIG.size.max, rnd()));
//       const opacity = lerp(CONFIG.opacity.min, CONFIG.opacity.max, rnd());
//       const rotate = Math.round(lerp(-8, 8, rnd()));

//       specs.push({
//         id: `${kind}-${i}`,
//         kind,
//         src,
//         leftPct,
//         topPct,
//         size,
//         opacity,
//         rotate,
//       });
//     }
//   }
//   return specs;
// }

// export default function BgIcons() {
//   // Generate once (client-only), stable due to deterministic RNG
//   const icons = useMemo(() => generateIcons(CONFIG.seed), []);

//   // Optional: subtle drift tied to scroll
//   const [offsetY, setOffsetY] = useState(0);
//   useEffect(() => {
//     if (!CONFIG.driftStrength) return;
//     let raf = 0;
//     const onScroll = () => {
//       const y = window.scrollY || 0;
//       const drift = (y / window.innerHeight) * CONFIG.driftStrength;
//       raf = requestAnimationFrame(() => setOffsetY(drift));
//     };
//     window.addEventListener("scroll", onScroll, { passive: true });
//     onScroll();
//     return () => {
//       window.removeEventListener("scroll", onScroll);
//       cancelAnimationFrame(raf);
//     };
//   }, []);

//   return (
//     <div
//       aria-hidden
//       style={{
//         position: "fixed",
//         inset: 0,
//         zIndex: 0,
//         pointerEvents: "none",
//         background: "#0e0e0e",
//         transform: `translateY(${offsetY.toFixed(2)}px)`,
//         willChange: "transform",
//       }}
//     >
//       {icons.map((ic) => (
//         <img
//           key={ic.id}
//           src={ic.src}
//           alt=""
//           width={ic.size}
//           height={ic.size}
//           style={{
//             position: "absolute",
//             left: `${ic.leftPct}vw`,
//             top: `${ic.topPct}vh`,
//             transform: `translate(-50%, -50%) rotate(${ic.rotate}deg)`,
//             opacity: ic.opacity,
//             filter:
//               "drop-shadow(0 0 10px rgba(124,93,255,.45)) drop-shadow(0 0 18px rgba(124,93,255,.28))",
//             imageRendering: "auto",
//           }}
//         />
//       ))}

//       <style>{`
//         @media (max-width: 640px) {
//           img[alt=""] { transform-origin: center; }
//         }
//         @media (prefers-reduced-motion: reduce) {
//           :root { scroll-behavior: auto; }
//         }
//       `}</style>
//     </div>
//   );
// }
