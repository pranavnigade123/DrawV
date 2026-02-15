"use client";

import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo";

// Main team
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
    designation: "General Secretary",
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
    title: "Pin Ten",
    img: "/niyati.jpg",
    name: "Niyati Mahawar",
    designation: "Marketing Head",
    linkedin: "https://www.linkedin.com/in/niyati-mahawar-601924310/"
  },
  { 
    title: "Pin Nine",
    img: "/Sanket.png",
    name: "Sanket Kharche",
    designation: "Design Head",
    linkedin: "https://www.linkedin.com/in/sanket-kharche-67231b256/"
  },
  { 
    title: "Pin Eight", 
    img: "/Viraj.jpg", 
    name: "Viraj Pawar", 
    designation: "Design Mentor",
    linkedin: "https://www.linkedin.com/in/virajnpawar/"
  },
  { 
    title: "Pin Seven", 
    img: "/swastik.jpg", 
    name: "Swastik Singh", 
    designation: "Vice President",
    linkedin: "https://www.linkedin.com/in/swastik-singh-b40466304?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app/"
  },
  { 
    title: "Faculty Mentor", 
    img: "/nilam.png",  
    name: "Dr. Nilam Pradhan", 
    designation: "Faculty Mentor",
    linkedin: "https://www.linkedin.com/in/nilam-pradhan-b45392a1/" 
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

      {/* Name */}
      <div style={{ minHeight: "2.25rem", width: "100%" }}>
        <h3 className="text-base sm:text-lg font-bold text-center text-white break-words leading-tight mb-1">
          {pin.name}
        </h3>
      </div>

      {/* Designation */}
      <div style={{ minHeight: "1.5rem", width: "100%" }}>
        <p className="text-xs sm:text-sm text-gray-300 text-center break-words leading-tight mt-0">
          {pin.designation}
        </p>
      </div>
    </div>
  );

  return pin.linkedin ? (
    <a href={pin.linkedin} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      {card}
    </a>
  ) : (
    <div>{card}</div>
  );
}


export default function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center py-12 bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      {/* Video Section */}
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
          src="/logo-animation.mp4"
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

      {/* About DrawV Section - Cool Design */}
      <div className="w-full max-w-6xl px-4 sm:px-6 md:px-8 pt-16 pb-12 mx-auto">
        <section className="space-y-16">
          {/* Hero Section with Gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B56FD]/20 via-transparent to-[#0118D8]/20 blur-3xl"></div>
            <div className="relative space-y-6 text-center py-12">
              <h2 className="font-bold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
                Welcome to the <span className="text-[#1B56FD]">Table</span>
              </h2>
              <p className="text-gray-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto">
                At Draw Five, we believe the best memories are made over competitive gaming and a bit of healthy rivalry. Whether you're here to master a new strategy or just looking for a way to compete between classes, we've built a space where <span className="text-[#1B56FD] font-semibold">play comes first</span>.
              </p>
            </div>
          </div>

          {/* Why Draw Five - Card Style */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#1B56FD] to-[#0118D8] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#1B56FD]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="space-y-4 flex-1">
                  <h3 className="font-bold text-2xl sm:text-3xl text-white">
                    Why "Draw Five"?
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Because the best games start with a full hand. We're dedicated to creating digital experiences that feel as engaging and social as competing alongside your teammates in a LAN party.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values - Modern Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Community First */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1B56FD] to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#1B56FD]/50 transition-all duration-300 h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1B56FD]/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-xl text-white">Community First</h4>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Built for players, by players. Every feature, every tournament, every update comes from listening to our community.
                  </p>
                </div>
              </div>
            </div>

            {/* Seamless Play */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1B56FD] to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#1B56FD]/50 transition-all duration-300 h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1B56FD]/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-xl text-white">Seamless Play</h4>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Smooth mechanics, zero lag. We obsess over performance so you can focus on the game, not the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Constant Innovation */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1B56FD] to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-[#1B56FD]/50 transition-all duration-300 h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-[#1B56FD]/10 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-xl text-white">Constant Innovation</h4>
                  <p className="text-gray-400 text-base leading-relaxed">
                    New tournaments, new features, and new ways to compete. We're always evolving with the gaming landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Do - Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-[#1B56FD]/10 border border-[#1B56FD]/30 text-[#1B56FD] text-sm font-semibold">
                  What We Do
                </span>
              </div>
              <h3 className="font-bold text-3xl sm:text-4xl text-white leading-tight">
                Your esports & game tech community
              </h3>
              <div className="space-y-4 text-gray-300 text-base leading-relaxed">
                <p>
                  DrawV is where competitive gaming meets cutting-edge technology. We organize tournaments, build gaming platforms, and create spaces where students can compete, learn, and grow.
                </p>
                <p>
                  From casual Friday night matches to competitive championship brackets, we handle the tech so you can focus on the game. Our tournament management platform makes it easy to register, compete, and track your progress.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-gray-300 text-sm">
                  Valorant
                </span>
                <span className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-gray-300 text-sm">
                  CS:GO
                </span>
                <span className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-gray-300 text-sm">
                  League of Legends
                </span>
                <span className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-gray-300 text-sm">
                  & More
                </span>
              </div>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1B56FD]/30 to-[#0118D8]/30 rounded-3xl blur-2xl"></div>
              <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">Tournament Management</p>
                    <p className="text-sm text-gray-400 mt-1">Streamlined registration and brackets</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#1B56FD]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">Live Updates</p>
                    <p className="text-sm text-gray-400 mt-1">Real-time match tracking and results</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#1B56FD]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">Community Driven</p>
                    <p className="text-sm text-gray-400 mt-1">Built by gamers, for gamers</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#1B56FD]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[#1B56FD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B56FD]/10 via-[#0118D8]/10 to-[#1B56FD]/10 blur-3xl"></div>
            <div className="relative text-center space-y-4 py-8">
              <p className="text-2xl sm:text-3xl font-bold text-white">
                No fluff, no gatekeeping, just good games and better competition.
              </p>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1B56FD] animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-[#1B56FD] animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-[#1B56FD] animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Team Section */}
      <div className="w-full max-w-6xl px-6 md:px-8 py-16 mt-8">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-12">
          Meet Our Team
        </h2>

        {/* Grid layout for all team members including Swastik and Faculty Mentor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-center">
          {teamPins.map((pin, index) => (
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
