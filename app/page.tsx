'use client';

import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";
import { ContainerScroll } from "@/components/aceternity/container-scroll-animation";
import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo"; 
import BorderMagicButton from "@/components/aceternity/BorderMagicButton";
import { BorderStaticButton } from "@/components/border-static-btn";
import NotificationMarquee from "@/components/NotificationMarquee"; 


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
      <section className="w-full flex flex-col items-center mt-32 py-8 mb-12">
        <TypewriterEffect
          words={[
            { text: "Welcome to DRAW", className: "text-blue-500" },
            { text: "V", className: "text-[#191CFF]" }
          ]}
          className="text-center text-white text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl"
          cursorClassName="bg-purple-500"
        />
      </section>

      {/* Notification Marquee Section */}
      <NotificationMarquee />

    {/* Scroll animation section */}
<div className="w-full flex flex-col items-center justify-center mt-16">
  <ContainerScroll
    titleComponent={
      <div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Scroll to Discover</h2>
        <p className="text-lg md:text-2xl text-gray-200">Unleash the Power of Draw V!</p>
      </div>
    }
  >
    <a
      href="https://liquipedia.net/valorant/MIT_Aarohan_Valorant_Cup_2025"
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-4 w-full h-full"
    >
      <img
        src="/valo1.png"
        alt="Valorant Tournament"
        className="w-full h-full object-cover rounded-xl"
      />
    </a>
  </ContainerScroll>
</div>

{/* Reduce/remove any padding or margin ABOVE this if present */}
<div className="-mt-38 w-full">
  <FeaturesSectionDemo />
</div>


    </>
  );
}
