'use client';

import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";
import { ContainerScroll } from "@/components/aceternity/container-scroll-animation";
import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo"; // <= named import

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
        // Vignette gradient overlay at bottom
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100vw",
            height: "70vh",
            background: "linear-gradient(to top, black 0%, transparent 100%)",
            zIndex: 2,
            transition: "opacity 0.3s",
          }}
        />
      </div>


      {/* Typewriter effect */}
      <section className="w-full flex flex-col items-center mt-32 py-8">
        <TypewriterEffect
          words={[
            { text: "Welcome to DRAW", className: "text-blue-500" },
            { text: "V", className: "text-[#191CFF]" }
          ]}
          className="text-center text-white text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl"
          cursorClassName="bg-purple-500"
        />
      </section>

      {/* Scroll animation section */}
      <div className="w-full flex justify-center mb-12">
        <ContainerScroll
          titleComponent={
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Scroll to Discover</h2>
              <p className="text-lg md:text-2xl text-gray-200">Unleash the Power of DrawV!</p>
            </div>
          }
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <p className="text-white text-2xl font-semibold">🏆 Automated bracket builder</p>
            <p className="text-gray-300 mt-2">Easy, fast, free — optimized for e-sports</p>
          </div>
        </ContainerScroll>
      </div>

      {/* FeaturesSectionDemo (OG bento grid with globe/YouTube/cards) */}
      <FeaturesSectionDemo />
    </>
  );
}
