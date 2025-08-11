'use client'

import React from 'react';
// Corrected import for Next.js Link
import { Zap, Brush, Lightbulb, Code, Gamepad, Users } from 'lucide-react';

// Define the type for the props of the IconCard component
interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

// A reusable card component for features/steps, now fully typed
const IconCard: React.FC<IconCardProps> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4 border border-indigo-200 dark:border-indigo-800">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-zinc-800 dark:text-zinc-100">{title}</h3>
    <p className="text-zinc-600 dark:text-zinc-400">{children}</p>
  </div>
);

// The main page component
export default function GameDevPage() {
  return (
    // The "dark" class is added here to force the dark theme
    <div className="dark bg-zinc-50 dark:bg-neutral-900 text-zinc-800 dark:text-zinc-200 font-sans">
      {/* Add top padding to account for a fixed navbar */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16">
        
        {/* Hero Section */}
        <section className="text-center mb-20 sm:mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400">
            Start Your Game Dev Journey
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-300">
            From player to creator. Learn the fundamentals, discover powerful tools, and join a community that builds together. Your adventure starts now.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="#start-roadmap" className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-300">
              Beginner's Roadmap
            </a>
          </div>
        </section>

        {/* Placeholder for a large, inspiring image */}
        <div className="mb-20 sm:mb-24">
            <img 
                src="https://placehold.co/1024x576/1e1b4b/93c5fd?text=Game+Engine+Editor" 
                alt="Game Development Environment" 
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
            />
        </div>

        {/* Why Learn Game Dev Section */}
        <section className="mb-20 sm:mb-24 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">A Booming Global Industry</h2>
            <p className="max-w-3xl mx-auto text-zinc-600 dark:text-zinc-400 mb-10">
                The video game industry is a titan of entertainment, bigger than movies and music combined. It's a dynamic field with endless opportunities for creative and technical minds.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <IconCard icon={<Gamepad size={24} className="text-indigo-500" />} title="Massive Market">Valued at over $250 billion with billions of players across PC, console, and mobile.</IconCard>
                <IconCard icon={<Users size={24} className="text-indigo-500" />} title="Diverse Roles">It's not just coding. The industry needs artists, designers, audio engineers, testers, and more.</IconCard>
                <IconCard icon={<Zap size={24} className="text-indigo-500" />} title="Indie Revolution">Powerful, free tools have empowered indie developers to create smash hits from their own homes.</IconCard>
            </div>
        </section>

        {/* Beginner's Roadmap Section */}
        <section id="start-roadmap" className="mb-20 sm:mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Your Beginner's Roadmap</h2>
            <p className="mt-3 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400">
              Feeling hyped? Let's channel that energy. Here’s a simple, step-by-step plan to get you started.
            </p>
          </div>

          {/* Step 1: Pick Your Path */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Step 1: Pick Your Path</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <IconCard icon={<Code size={24} className="text-indigo-500" />} title="The Programmer">Love problem-solving and logic? You'll be the architect who writes the code that makes the game work.</IconCard>
              <IconCard icon={<Brush size={24} className="text-indigo-500" />} title="The Artist">Love drawing and creating beautiful worlds? You'll be the visionary who designs characters and environments.</IconCard>
              <IconCard icon={<Lightbulb size={24} className="text-indigo-500" />} title="The Designer">Love thinking about rules and fun? You'll be the mastermind behind game mechanics and player experience.</IconCard>
            </div>
          </div>
          
          {/* Step 2: Choose Your Engine */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-center mb-8">Step 2: Choose Your Game Engine</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Unity */}
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <img src="https://placehold.co/400x200/e0e7ff/3730a3?text=Unity" alt="Unity Engine" className="w-full h-auto rounded-lg mb-4"/>
                    <h4 className="text-xl font-bold">Unity</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2">The world's most popular engine, especially for mobile and indie games. Versatile for both 2D and 3D. Uses C#.</p>
                </div>
                {/* Unreal */}
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <img src="https://placehold.co/400x200/d1d5db/1f2937?text=Unreal+Engine" alt="Unreal Engine" className="w-full h-auto rounded-lg mb-4"/>
                    <h4 className="text-xl font-bold">Unreal Engine</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2">A powerhouse known for stunning graphics. Great for AAA-style games. Uses C++ and visual Blueprints.</p>
                </div>
                {/* Godot */}
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <img src="https://placehold.co/400x200/ccfbf1/115e59?text=Godot" alt="Godot Engine" className="w-full h-auto rounded-lg mb-4"/>
                    <h4 className="text-xl font-bold">Godot Engine</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2">A rising open-source star. It's lightweight, easy to use, and fantastic for 2D game development.</p>
                </div>
            </div>
          </div>
        </section>

        {/* How Draw V Helps Section */}
        <section className="mb-20 sm:mb-24 bg-indigo-600 dark:bg-indigo-900/50 rounded-2xl p-8 sm:p-12 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Don't Go It Alone: How Draw V Helps</h2>
                    <p className="text-indigo-200 mb-6">
                        Learning game development is challenging, but you don't have to do it in isolation. Our community is a hub for aspiring and veteran developers to connect, collaborate, and grow.
                    </p>
                    <ul className="space-y-3 text-indigo-100">
                        <li className="flex items-center gap-3"><Users size={20} /> Find Teammates & Join Game Jams</li>
                        <li className="flex items-center gap-3"><Lightbulb size={20} /> Get Feedback & Learn Together</li>
                        <li className="flex items-center gap-3"><Zap size={20} /> Network with Industry Professionals</li>
                    </ul>
                     <div className="mt-8">
                        {/* Replace with your actual community link */}
                        <a href="/community" className="px-6 py-3 rounded-full bg-white text-indigo-600 font-semibold shadow-md hover:bg-zinc-100 transition-colors duration-300">
                            Join Our Community
                        </a>
                    </div>
                </div>
                <div className="hidden md:block">
                    <img src="https://placehold.co/500x500/4f46e5/ffffff?text=Community" alt="Community Collaboration" className="rounded-xl shadow-lg"/>
                </div>
            </div>
        </section>
        
        {/* Free Courses Section */}
        <section className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Kickstart Your Skills</h2>
          <p className="max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 mb-10">
            Ready to dive in? Here are some of the best free courses and resources to get you started today.
          </p>
          <div className="space-y-4 max-w-2xl mx-auto">
            <a href="#" className="block p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 text-left hover:border-indigo-400 transition-colors"><strong>Unity Learn:</strong> Create with Code - The official beginner's path.</a>
            <a href="#" className="block p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 text-left hover:border-indigo-400 transition-colors"><strong>Unreal Engine:</strong> Your First Game - A step-by-step video tutorial.</a>
            <a href="#" className="block p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 text-left hover:border-indigo-400 transition-colors"><strong>freeCodeCamp:</strong> Full-length courses on YouTube.</a>
            <a href="#" className="block p-4 bg-white dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 text-left hover:border-indigo-400 transition-colors"><strong>Brackeys Archive:</strong> High-quality, easy-to-follow Unity tutorials.</a>
          </div>
        </section>

      </main>
    </div>
  );
}
