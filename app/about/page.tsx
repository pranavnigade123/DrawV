"use client";

import { ColourfulText } from "@/components/aceternity/colourful-text";
import { PinContainer } from "@/components/aceternity/3d-pin";
import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo";

const pins = [
  { title: "Pin One", img: "/om.png", name: "Om Raja", designation: "President" },
  { title: "Pin Two", img: "/vedant.png", name: "Vedant Mankar", designation: "Vice President" },
  { title: "Pin Three", img: "/aditya.png", name: "Aditya Mathur", designation: "General Secretary" },
  { title: "Pin Four", img: "/saket.png", name: "Saket Raja", designation: "Design Head" },
  { title: "Pin Five", img: "/pranav1.jpg", name: "Pranav Nigade", designation: "Technical Head" },
  { title: "Pin Six", img: "/sashwat.jpg", name: "Shaswat Nande", designation: "Innovation Hub President" },
  { title: "Pin Seven", img: "/swastik.jpg", name: "Swastik Singh", designation: "Innovation Hub Vice President" },
  { title: "Pin Eight", img: "/valo1.png", name: "Viraj Pawar", designation: "Design Mentor", href: "/somewhere8" },
];

export default function AboutPage() {
  return (
    <main className="w-full flex flex-col items-center py-12 bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      {/* Main grid for "What is DRAW V" and "What is Innovation Hub" */}
   {/* About Us Section */}
<div className="w-full max-w-6xl px-4 pt-44">
  {/* Top Row: DRAW V */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-44">
    {/* Text - Draw V */}
    <section className="flex flex-col justify-center p-6">
      <h2 className="text-left font-extrabold text-3xl sm:text-4xl tracking-tight mb-6 text-white">
        What is <ColourfulText text="DRAW V" colorTheme="blue" />?
      </h2>
      <p className="text-gray-300 text-base leading-relaxed">
        Draw V was born from the spark of a simple dream — a few passionate gamers and creators who dared to believe in building something unique, together. What started as casual conversations turned into bold plans. From hosting friendly tournaments and late-night strategies to slowly finding our place in the collegiate eSports community, every step taught us something.

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



      {/* Pins Grid */}
      <section className="flex justify-center my-8 px-3 sm:px-6 w-full">
        <div className="grid max-w-6xl mx-auto grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full">
          {pins.map((pin, idx) => (
            <PinContainer key={idx} title={pin.title} href={pin.href}>
              <div className="flex flex-col items-center rounded-xl p-3 w-full sm:w-44 md:w-48 shadow-md backdrop-blur-md transition-transform duration-300 hover:scale-[1.05]">
                <img
                  src={pin.img}
                  alt={pin.title}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                  style={{ border: "1px solid #e5e7eb" }}
                />
                <h3 className="text-base sm:text-sm md:text-base font-semibold text-white mb-1 text-center">
                  {pin.name}
                </h3>
                <p className="text-sm sm:text-xs md:text-sm font-semibold text-blue-300 text-center">
                  {pin.designation}
                </p>
              </div>
            </PinContainer>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <div className="px-3 sm:px-6 md:px-8 py-10 w-full max-w-7xl">
        <FeaturesSectionDemo />
      </div>
    </main>
  );
}
