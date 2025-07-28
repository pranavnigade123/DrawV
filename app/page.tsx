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
            height: "60vh", // covers bottom 50% of video
            background: "linear-gradient(to top, black 0%, transparent 100%)",
            zIndex: 2,
            transition: "opacity 0.3s",
          }}
        />
      </div>

      <section className="w-full flex flex-col items-center mt-8 py-8">
        <TypewriterEffect
          words={[
            { text: "Welcome to Aceternity!" },
            { text: "Your journey starts here..." }
          ]}
        />
      </section>
    </>
  );
}
