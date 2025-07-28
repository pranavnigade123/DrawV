'use client';
import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";

export default function LandingPage() {
  return (
    <>
      <video
        src="/bg-video1.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="w-screen h-screen object-cover block"
      />
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
