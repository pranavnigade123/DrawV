"use client";

import { ColourfulText } from "@/components/aceternity/colourful-text";
import { PinContainer } from "@/components/aceternity/3d-pin";
import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo";
import { EvervaultCard } from "@/components/aceternity/evervault-card";

const pins = [
  { title: "Pin One", img: "/om.png", name: "Om Raja", designation: "President" },
  { title: "Pin Two", img: "/vedant.png", name: "Vedant Mankar", designation: "Vice President" },
  { title: "Pin Three", img: "/aditya.png", name: "Aditya Mathur", designation: "General Secretary" },
  { title: "Pin Four", img: "/saket.png", name: "Saket Raja", designation: "Design Head" },
  { title: "Pin Five", img: "/pranav1.jpg", name: "Pranav Nigade", designation: "Technical Head" },
  { title: "Pin Six", img: "/sashwat.jpg", name: "Shaswat Nande", designation: "Innovation Hub President" },
  { title: "Pin Seven", img: "/swastik.jpg", name: "Swastik Singh", designation: "Innovation Hub Vice President" },
  { title: "Pin Eight", img: "/Viraj.jpg", name: "Viraj Pawar", designation: "Design Mentor", href: "/somewhere8" },
];

export default function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center py-12 bg-[var(--background)] text-[var(--foreground)] min-h-screen">

{/* --- MODIFIED VIDEO SECTION --- */}
          <div
        style={{
          position: "relative",
          width: "90vw", // Slightly wider for better mobile fit
          maxWidth: "980px", // A max-width for very large screens
          margin: "15vh auto 0", // Adjusted margin for better vertical positioning
          aspectRatio: "16 / 9", // This is the key property
          overflow: "hidden",
          borderRadius: "1rem"
        }}
      >
        <video
          src="/dv-animation.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain", // Use contain now that the container has the right ratio
            display: "block",
            background: "#000"
          }}
        />
      </div>


      {/* Huge static gradient headline at page top */}
      <div className="w-full flex justify-center pt-8 pb-6">
        <div style={{ width: "100vw", maxWidth: "1100px", height: 120 }}>
          <h1 className="w-full text-center text-5xl sm:text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mt-18 mb-8 drop-shadow-lg tracking-tight">
            WHO WE ARE
          </h1>
        </div>
      </div>

        
      {/* About Us Section */}
      <div className="w-full max-w-6xl px-4 pt-20">

        {/* Top Row: DRAW V */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-44">
          {/* Text - Draw V */}
          <section className="flex flex-col justify-center p-6">
            <h2 className="text-left font-extrabold text-3xl sm:text-4xl tracking-tight mb-6 text-white">
              What is <ColourfulText text="DRAW V" colorTheme="blue" />?
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Draw V was born from the spark of a simple dream — a few passionate gamers and creators who dared to believe in building something unique, together. What started as casual conversations turned into bold plans. From hosting friendly tournaments and late-night strategies to slowly finding our place in the collegiate eSports community, every step taught us something.<br /><br />
              We didn’t begin as champions. We began as believers — learning, falling, rising, and most importantly, never stopping. Our strength lies not just in gameplay, but in our unity, creativity, and will to grow. Today, Draw V stands as a team, a family, and a movement — constantly evolving and empowering.
            </p>
          </section>

          {/* Logo - Draw V */}
          <div className="flex items-center justify-center p-6">
            <img src="/logo-dark.png" alt="Draw V Logo" className="h-24 w-auto" />
          </div>
        </div>

        {/* Bottom Row: Innovation Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Logo - Innovation Hub */}
          <div className="flex items-center justify-center p-6">
            <img src="/IH-logo.jpg" alt="Innovation Hub Logo" className="h-34 w-auto" />
          </div>

          {/* Text - Innovation Hub */}
          <section className="flex flex-col justify-center p-6">
            <h2 className="text-left font-extrabold text-3xl sm:text-4xl tracking-tight mb-6 text-white">
              What is <ColourfulText text="Innovation Hub" colorTheme="redYellow" />?
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              The Innovation Hub at MIT-WPU is the official Student Innovation Council, fueled by curiosity and collaboration. It cultivates a culture of innovation by equipping students with practical skills through workshops, hackathons, and mentorship in technology, design, and entrepreneurship. With a diverse team and strong community, it drives impactful projects, national wins, and research publications. The Hub supports students’ journeys from ideation to execution, bridging gaps in confidence and career readiness to shape future leaders and changemakers.
            </p>
          </section>
        </div>
      </div>

{/* Team Section */}
<div className="w-full max-w-6xl px-4 md:px-8 py-16">
  <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-12">
    Meet Our Team
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
    {pins.map((pin, index) => (
      <div
        key={index}
        className="bg-transparent border border-white rounded-lg overflow-hidden flex flex-col items-center p-4 sm:p-5 transition-transform duration-300 hover:scale-105 max-w-[220px] sm:max-w-none mx-auto"
      >
        {/* Image */}
        <div className="w-full aspect-square overflow-hidden rounded-md mb-3 sm:mb-4">
          <img
            src={pin.img}
            alt={pin.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Name */}
        <h3 className="text-lg sm:text-xl font-bold text-center text-white">
          {pin.name}
        </h3>
        {/* Designation */}
        <p className="text-sm sm:text-base text-gray-300 text-center">
          {pin.designation}
        </p>
      </div>
    ))}
  </div>
</div>






      {/* Features Section */}
      <div className="px-3 sm:px-6 md:px-8 py-10 w-full max-w-7xl">
        <FeaturesSectionDemo />
      </div>
    </main>
  );
}
