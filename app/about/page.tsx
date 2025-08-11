"use client";

import { ColourfulText } from "@/components/aceternity/colourful-text";
import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo";

// Main team (first 6)
const teamPins = [
  { 
    title: "Pin One", 
    img: "/om.png", 
    name: "Om Raja", 
    designation: "President",
    linkedin: "https://www.linkedin.com/in/om-raja-84850b240?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app/"
  },
  { 
    title: "Pin Two", 
    img: "/vedant.png", 
    name: "Vedant Mankar", 
    designation: "Vice President",
    linkedin: "https://www.linkedin.com/in/vedant-mankar-804723289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app/"
  },
  { 
    title: "Pin Three", 
    img: "/aditya.png", 
    name: "Aditya Mathur", 
    designation: "General Secretary",
    linkedin: "https://www.linkedin.com/in/aditya-mathur-1185ab282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app/"
  },
  { 
    title: "Pin Four", 
    img: "/saket.png", 
    name: "Saket Raja", 
    designation: "Design Head",
    linkedin: "https://www.linkedin.com/in/saketraja?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app/"
  },
  { 
    title: "Pin Five", 
    img: "/pranav1.jpg", 
    name: "Pranav Nigade", 
    designation: "Technical Head",
    linkedin: "https://www.linkedin.com/in/pranav-nigade?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app/"
  },
  { 
    title: "Pin Eight", 
    img: "/Viraj.jpg", 
    name: "Viraj Pawar", 
    designation: "Design Mentor",
    linkedin: "https://www.linkedin.com/in/virajnpawar/"
  },
];

// Innovation hub team
const innovationPins = [
  { 
    title: "Pin Six", 
    img: "/Shaswat.jpg", 
    name: "Shashwat Nande", 
    designation: "Innovation Hub President",
    linkedin: "https://www.linkedin.com/in/shashwat-nande-786bb0289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app/"
  },
  { 
    title: "Pin Seven", 
    img: "/swastik.jpg", 
    name: "Swastik Singh", 
    designation: "Innovation Hub Vice President",
    linkedin: "https://www.linkedin.com/in/swastik-singh-b40466304?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app/"
  },
];

type Pin = {
  title: string;
  img: string;
  name: string;
  designation: string;
  linkedin?: string;
};

function TeamCard({ pin }: { pin: Pin }) {
   const card = (
    <div className="bg-transparent border border-white rounded-lg overflow-hidden flex flex-col items-center p-3 sm:p-4 mb-4 transition-transform duration-300 hover:scale-105 max-w-[200px] mx-auto">
      <div className="w-full aspect-square overflow-hidden rounded-md mb-2 sm:mb-3">
        <img
          src={pin.img}
          alt={pin.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Fixed height for consistent cards */}
      <div style={{ minHeight: "3rem", width: "100%" }}>
        <h3 className="text-base sm:text-lg font-bold text-center text-white break-words">{pin.name}</h3>
      </div>
      <div style={{ minHeight: "2rem", width: "100%" }}>
        <p className="text-xs sm:text-sm text-gray-300 text-center break-words">{pin.designation}</p>
      </div>
    </div>
  );
  return pin.linkedin ? (
    <a
      href={pin.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      {card}
    </a>
  ) : (
    <div>{card}</div>
  );
}

export default function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center py-12 bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      {/* --- MODIFIED VIDEO SECTION --- */}
      <div
        style={{
          position: "relative",
          width: "90vw",
          maxWidth: "980px",
          margin: "15vh auto 0",
          aspectRatio: "16 / 9",
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
            objectFit: "contain",
            display: "block",
            background: "#000"
          }}
        />
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: "70%",
            background: "linear-gradient(to top, black 0%, transparent 100%)",
            zIndex: 2,
          }}
        />
      </div>

      {/* About Us Section */}
      <div className="w-full max-w-6xl px-4 pt-20">
        {/* Top Row: DRAW V */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-44">
          <section className="flex flex-col justify-center p-6 pt-6 pb-2">
            <h2 className="text-left font-extrabold text-3xl sm:text-4xl tracking-tight mb-6 text-white">
              What is <ColourfulText text="DRAW V" colorTheme="blue" />?
            </h2>
            <p className="text-gray-300 text-base leading-relaxed text-justify">
    Here in Pune, Draw V was born from the spark of a simple dream—a few passionate gamers and gaming content creators who dared to believe in building a unique Indian gaming community together. What started as casual conversations on Discord about competitive gaming and scrims turned into bold plans for our future as a professional eSports team. From hosting local esports tournaments for games like [Your Main Game, e.g. Valorant] and live streaming our late-night strategy sessions, to slowly finding our place in the collegiate esports circuit of Maharashtra, every step has taught us something.
    <br /><br />
    We didn’t begin as champions. We began as believers—learning, falling, rising, and most importantly, never stopping. The strength of our eSports organization lies not just in high-level gameplay, but in our unity, creativity, and a shared will to build legitimate gaming careers. Today, Draw V stands as a competitive team, a supportive gaming family, and a grassroots movement. We are constantly evolving, empowering the next generation of esports athletes from Pune and beyond, and building a powerful presence in the Indian esports ecosystem.
</p>
          </section>
          <div className="flex items-center justify-center p-6">
  <img src="/logo-dark.png" alt="Draw V Logo" className="h-24 w-auto hidden md:block" />
</div>

        </div>
        {/* Bottom Row: Innovation Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex items-center justify-center p-6">
            <img src="/ih-logo.png" alt="Innovation Hub Logo" className="h-34 w-auto" />
          </div>
          <section className="flex flex-col justify-center p-6 ">
            <h2 className="text-left font-extrabold text-3xl sm:text-4xl tracking-tight mb-6 text-white">
              What is <ColourfulText text="Innovation Hub" colorTheme="redYellow" />?
            </h2>
            <p className="text-gray-300 text-base leading-relaxed text-justify">
              The Innovation Hub at MIT-WPU is the official Student Innovation Council, fueled by curiosity and collaboration. It cultivates a culture of innovation by equipping students with practical skills through workshops, hackathons, and mentorship in technology, design, and entrepreneurship. With a diverse team and strong community, it drives impactful projects, national wins, and research publications. The Hub supports students’ journeys from ideation to execution, bridging gaps in confidence and career readiness to shape future leaders and changemakers.
            </p>
          </section>
        </div>
      </div>

      {/* Team Section */}
      <div className="w-full max-w-6xl px-6 md:px-8 py-16 t-10">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-12">
          Meet Our Team
        </h2>
        {/* 3 columns and 2 rows: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
          {teamPins.map((pin, index) => (
            <TeamCard key={index} pin={pin} />
          ))}
        </div>
        
        {/* Innovation Hub section */}
        <h3 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-16 mb-8">
  Innovation Hub
</h3>

        <div className="flex flex-col sm:flex-row gap-4 lg:gap-32 justify-center items-center">
  {innovationPins.map((pin, index) => (
    <TeamCard key={index} pin={pin} />
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
