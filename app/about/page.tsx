import { FeaturesSectionDemo } from "@/components/aceternity/FeaturesSectionDemo";
import { PinContainer } from "@/components/aceternity/3d-pin";

const pins = [
  {
    title: "Pin One",
    img: "/valo1.png",
    name: "Pranav Nigade",
    designation: "Tech Head",
    href: "/somewhere1"
  },
  {
    title: "Pin Two",
    img: "/valo1.png",
    name: "Aria Holmes",
    designation: "UI/UX Designer",
    href: "/somewhere2"
  },
  {
    title: "Pin Three",
    img: "/valo1.png",
    name: "Liam Smith",
    designation: "Frontend Developer",
    href: "/somewhere3"
  },
  {
    title: "Pin Four",
    img: "/valo1.png",
    name: "Sophia Lee",
    designation: "Backend Engineer",
    href: "/somewhere4"
  },
  {
    title: "Pin Five",
    img: "/valo1.png",
    name: "Oliver Chen",
    designation: "Product Manager",
    href: "/somewhere5"
  },
  {
    title: "Pin Six",
    img: "/valo1.png",
    name: "Mia Davis",
    designation: "QA Specialist",
    href: "/somewhere6"
  },
  {
    title: "Pin Seven",
    img: "/valo1.png",
    name: "Noah Brown",
    designation: "DevOps Engineer",
    href: "/somewhere7"
  },
  {
    title: "Pin Eight",
    img: "/valo1.png",
    name: "Emma Wilson",
    designation: "Marketing Lead",
    href: "/somewhere8"
  }
];


export default function AboutPage() {
  return (
    <main>
      {/* Video Section */}
      <div
        style={{
          position: "relative",
          width: "80vw",
          height: "70vh",
          margin: "20vh auto",
          overflow: "hidden",
          borderRadius: "1rem"
        }}
      >
        <video
          src="dv-animation.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
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

      {/* Pins Grid */}
     <section className="flex justify-center my-6">
  <div className="grid max-w-5xl mx-auto px-2 py-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {pins.map((pin, idx) => (
      <PinContainer key={idx} title={pin.title} href={pin.href}>
        <div className="flex flex-col items-center rounded-xl p-4 w-56 shadow-lg backdrop-blur-md">
          <img
            src={pin.img}
            alt={pin.title}
            className="w-full h-28 object-cover rounded-lg mb-3"
            style={{ border: "1px solid #e5e7eb" }}
          />
          <h3 className="text-sm font-semibold text-white mb-0.5">{pin.name}</h3>
          <p className="text-xs font-semibold text-blue-300 text-center mt-1">{pin.designation}</p>
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
