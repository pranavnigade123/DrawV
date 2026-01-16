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

      {/* About DrawV Section */}
      <div className="w-full max-w-5xl px-4 sm:px-6 md:px-8 pt-16 pb-12 mx-auto">
        <section className="space-y-8">
          {/* Title Section */}
          <div className="space-y-4 text-center">
            <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight">
              <span className="text-white">DRAW FI</span>
              <span className="text-blue-500">V</span>
              <span className="text-white">E</span>
            </h2>
            <div className="flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 text-gray-300 text-base sm:text-lg leading-relaxed max-w-4xl mx-auto">
            <p className="text-center">
              <span className="font-bold text-white">DrawV (Draw Five)</span> is the premier Game Tech Community at MIT-WPU, dedicated to revolutionizing the gaming and esports ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-300">
                <p className="text-sm sm:text-base">
                  We are a <span className="text-blue-400 font-semibold">dynamic collective</span> of passionate developers, designers, and gaming enthusiasts committed to empowering the next generation of gaming professionals.
                </p>
              </div>
              
              <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 hover:border-blue-500/50 transition-all duration-300">
                <p className="text-sm sm:text-base">
                  Our mission encompasses <span className="text-blue-400 font-semibold">game development</span>, <span className="text-blue-400 font-semibold">esports tournament management</span>, <span className="text-blue-400 font-semibold">streaming infrastructure</span>, and <span className="text-blue-400 font-semibold">creative design</span>.
                </p>
              </div>
            </div>
            
            <p className="text-center text-lg sm:text-xl font-medium pt-3">
              At DrawV, we don't just learn about gaming technology — <span className="text-blue-500 font-bold">we build it</span>.
            </p>
            
            <p className="text-center text-sm sm:text-base text-gray-400">
              Our flagship <span className="text-blue-400 font-semibold">DrawV Tournament Management Platform</span> exemplifies our commitment to solving real-world problems in the esports community.
            </p>
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
