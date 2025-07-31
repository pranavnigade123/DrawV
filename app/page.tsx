'use client';

import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";
import { ContainerScroll } from "@/components/aceternity/container-scroll-animation";
import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo"; 
import BorderMagicButton from "@/components/aceternity/BorderMagicButton";
import { BorderStaticButton } from "@/components/border-static-btn"; 

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
        <div className="flex justify-center w-full mt-28">
  <div className=" border-1 border-white rounded-2xl px-8 py-10 max-w-md w-full shadow-xl flex flex-col items-center">
    <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-center mb-8 tracking-tight">
  Recruitments are Live&nbsp;!
</h2>

    <div className="flex gap-6">
      <BorderStaticButton onClick={() => window.location.href = "/about"}>
        About Us
      </BorderStaticButton>
      <BorderMagicButton onClick={() => window.location.href = "/register"}>
        Register
      </BorderMagicButton>
    </div>
  </div>
</div>


      </section>

      {/* Scroll animation section */}
      <div className="w-full flex justify-center mb-12">
        <ContainerScroll
  titleComponent={
    <div>
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Scroll to Discover</h2>
      <p className="text-lg md:text-2xl text-gray-200">Unleash the Power of Draw V!</p>
    </div>
  }
>
  <div className="flex items-center justify-center h-full w-full">
    <img
      src="/valo1.png" 
      alt="Valorant Tournament"
      className="w-full h-full object-cover rounded-xl"
    />
  </div>
</ContainerScroll>


      </div>

      {/* FeaturesSectionDemo (OG bento grid with globe/YouTube/cards) */}
      <FeaturesSectionDemo />
    </>
  );
}
