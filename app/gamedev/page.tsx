"use client";

import React from "react";
import BorderMagicButton from "@/components/aceternity/BorderMagicButton";
import { Zap, Brush, Lightbulb, Code, Gamepad, Users } from "lucide-react";

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const IconCard: React.FC<IconCardProps> = ({ icon, title, children }) => (
  <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 hover:border-indigo-600/50 transition-colors duration-300">
    <div className="flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full mb-4 border border-zinc-800">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
    <p className="text-zinc-400 leading-relaxed text-sm">{children}</p>
  </div>
);

export default function GameDevPage() {
  return (
    <div className="bg-black text-zinc-200 font-sans">
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-tight text-white">
            Start Your Game Dev Journey
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-400 text-base">
            From player to creator. Learn the fundamentals, discover powerful tools,
            and join a community that builds together.
          </p>
          <div className="mt-8 flex justify-center">
            <BorderMagicButton
              onClick={() => {
                const targetElement = document.querySelector("#start-roadmap");
                if (targetElement)
                  targetElement.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Beginner&apos;s Roadmap
            </BorderMagicButton>
          </div>
        </section>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-lg mb-20">
          <img
            src="/gd-bg.jpg"
            alt="Game Dev"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Industry Section */}
        <section className="mb-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            A Booming Global Industry
          </h2>
          <p className="text-zinc-400 max-w-3xl mx-auto mb-10">
            The video game industry is a titan of entertainment, bigger than
            movies and music combined. It’s a space where creativity meets
            technology.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <IconCard icon={<Gamepad size={22} className="text-indigo-500" />} title="Massive Market">
              Valued at over $250B with billions of players worldwide — from PC
              to console to mobile.
            </IconCard>
            <IconCard icon={<Users size={22} className="text-indigo-500" />} title="Diverse Roles">
              The industry needs coders, artists, designers, sound engineers, and more.
            </IconCard>
            <IconCard icon={<Zap size={22} className="text-indigo-500" />} title="Indie Revolution">
              Free, powerful tools now let small teams make world-class games.
            </IconCard>
          </div>
        </section>

        {/* Roadmap Section */}
        <section id="start-roadmap" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Your Beginner&apos;s Roadmap
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mt-3">
              Here’s a simple, guided plan to kickstart your development journey.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-indigo-400 text-center mb-8">
            Step 1 · Choose Your Role
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <IconCard icon={<Code size={22} className="text-indigo-500" />} title="The Programmer">
              Love logic? You’ll code gameplay, systems, and interactions that bring worlds to life.
            </IconCard>
            <IconCard icon={<Brush size={22} className="text-indigo-500" />} title="The Artist">
              Love visuals? You’ll design characters, assets, and environments that define the style.
            </IconCard>
            <IconCard icon={<Lightbulb size={22} className="text-indigo-500" />} title="The Designer">
              Love ideas? You’ll create mechanics, balance gameplay, and shape player experiences.
            </IconCard>
          </div>

          <h3 className="text-xl font-semibold text-indigo-400 text-center mb-8">
            Step 2 · Pick a Game Engine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 hover:border-indigo-600/50 transition-colors">
              <img src="/unity.png" alt="Unity" className="rounded-lg mb-4" />
              <h4 className="text-lg font-bold text-white">Unity</h4>
              <p className="text-zinc-400 text-sm mt-2">
                Great for 2D and 3D, with C# scripting. Widely used by indie and mobile developers.
              </p>
            </div>
            <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 hover:border-indigo-600/50 transition-colors">
              <img src="/ue5.png" alt="Unreal" className="rounded-lg mb-4" />
              <h4 className="text-lg font-bold text-white">Unreal Engine</h4>
              <p className="text-zinc-400 text-sm mt-2">
                Known for stunning visuals and AAA production. Uses C++ and visual scripting.
              </p>
            </div>
            <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 hover:border-indigo-600/50 transition-colors">
              <img src="/gadot1.png" alt="Godot" className="rounded-lg mb-4" />
              <h4 className="text-lg font-bold text-white">Godot Engine</h4>
              <p className="text-zinc-400 text-sm mt-2">
                Open-source and lightweight — perfect for 2D games and indie creators.
              </p>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="bg-[#0f0f0f] border border-zinc-800 rounded-2xl p-8 sm:p-12 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Don&apos;t Go It Alone — Join Draw V
              </h2>
              <p className="text-zinc-400 mb-6">
                Connect with fellow creators, participate in events, and grow together.
                Collaboration makes everything better.
              </p>
              <ul className="space-y-3 text-zinc-300">
                <li className="flex items-center gap-3">
                  <Users size={18} className="text-indigo-500" /> Find teammates for projects.
                </li>
                <li className="flex items-center gap-3">
                  <Lightbulb size={18} className="text-indigo-500" /> Get feedback from peers.
                </li>
                <li className="flex items-center gap-3">
                  <Zap size={18} className="text-indigo-500" /> Learn from experts and mentors.
                </li>
              </ul>
              <div className="mt-8">
                <a
                  href="https://chat.whatsapp.com/F2qNzLZpdHUEWqcev1Suwh?mode=ac_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
                >
                  Join Our Community
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/Bento.png"
                alt="Community Collaboration"
                className="rounded-xl border border-zinc-800 shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Kickstart Your Skills
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-10">
            Explore free, high-quality resources curated for new developers.
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              "Unity Learn: Create with Code — The official beginner's path.",
              "Unreal Engine: Your First Game — A guided video tutorial.",
              "freeCodeCamp: Full-length courses on YouTube.",
              "Brackeys Archive: Classic Unity tutorials for beginners.",
            ].map((text, i) => (
              <a
                key={i}
                className="block p-4 bg-[#0f0f0f] rounded-xl border border-zinc-800 text-left hover:border-indigo-600/50 transition-all text-zinc-300"
              >
                {text}
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
