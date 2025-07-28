'use client';
import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";

export default function LandingPage() {
  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Fullscreen video */}
        <video
          src="/bg-video1.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-screen h-screen object-cover block"
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            display: "block",
            background: "#000"
          }}
        />
        {/* Vignette gradient overlay */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100vw",
            height: "70vh", // covers bottom 50% of video
            background: "linear-gradient(to top, black 0%, transparent 100%)",
            zIndex: 2,
            transition: "opacity 0.3s",
          }}
        />
      </div>

    <section className="w-full flex flex-col items-center mt-32 py-8">
  <TypewriterEffect
    words={[
      { text: "Welcome to DRAW", className: "text-blue-500" },
      { text: "V", className: "text-[#191CFF]" } // Changed color of 'V' to #191CFF
    ]}
    className="text-center text-white text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl"
    cursorClassName="bg-purple-500"
  />
</section>

    </>
  );
}
