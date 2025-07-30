import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo";
import { PinContainer } from "@/components/aceternity/3d-pin";
import { TypewriterEffect } from "@/components/aceternity/typewriter-effect";

const pins = [
  {
    title: "Pin One",
    img: "/om.png",
    name: "Om Raja",
    designation: "President"
  },
  {
    title: "Pin Two",
    img: "/vedant.png",
    name: "Vedant Mankar",
    designation: "Vice President"
  },
  {
    title: "Pin Three",
    img: "/aditya.png",
    name: "Aditya Mathur",
    designation: "General Secretary"
  },
  {
    title: "Pin Four",
    img: "/saket.png",
    name: "Saket Raja",
    designation: "Design Head"
  },
  {
    title: "Pin Five",
    img: "/pranav1.jpg",
    name: "Pranav Nigade",
    designation: "Technical Head"
  },
  {
    title: "Pin Six",
    img: "/sashwat.jpg",
    name: "Sashwat Nande",
    designation: "Innovation Hub President"
  },
  {
    title: "Pin Seven",
    img: "/swastik.jpg",
    name: "Swastik Singh",
    designation: "Innovation Hub Vice President"
  },
  {
    title: "Pin Eight",
    img: "/valo1.png",
    name: "Viraj Pawar",
    designation: "Design Mentor",
    href: "/somewhere8"
  }
];


export default function AboutPage() {
  return (
    <main>
      
       {/* Typewriter effect */}
            {/* Typewriter effect + description */}
<section className="max-w-5xl mx-auto px-1 flex flex-col items-center mt-32 py-8 ">
  <TypewriterEffect
    words={[
      { text: "What is DRAW", className: "text-blue-500" },
      { text: "V ?", className: "text-[#191CFF]" }
    ]}
    className="text-white text-3xl md:text-5xl lg:text-7xl font-extrabold tracking-tight drop-shadow-2xl"
    cursorClassName="bg-purple-500"
  /><br />
  <p className="mt-6 text-sm md:text-base text-zinc-300 max-w-prose leading-relaxed text-justify">
    Draw V was born from the spark of a simple dream — a few passionate gamers and creators who dared to believe in building something unique, together. What started as casual conversations turned into bold plans. From hosting friendly tournaments and late-night strategies to slowly finding our place in the collegiate eSports community, every step taught us something.
We didn’t begin as champions. We began as believers — learning, falling, rising, and most importantly, never stopping. Our strength lies not just in gameplay, but in our unity, creativity, and will to grow. Today, Draw V stands as a team, a family, and a movement — constantly evolving and empowering.
  </p>
</section>

      {/* Pins Grid */}
     <section className="flex justify-center my-6">
  <div className="grid max-w-5xl mx-auto px-1 py-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
    {pins.map((pin, idx) => (
      <PinContainer key={idx} title={pin.title} href={pin.href}>
        <div className="flex flex-col items-center rounded-xl p-2 w-48 shadow-md backdrop-blur-md">
          <img
            src={pin.img}
            alt={pin.title}
            className="w-full aspect-square object-cover rounded-lg mb-2"
            style={{ border: "1px solid #e5e7eb" }}
          />
          <h3 className="text-sm font-semibold text-white mb-1">{pin.name}</h3>
          <p className="text-xs font-semibold text-blue-300 text-center">{pin.designation}</p>
        </div>
      </PinContainer>
    ))}
  </div>
</section>




      {/* Features Section */}
      <FeaturesSectionDemo />
    </main>
  );
}
