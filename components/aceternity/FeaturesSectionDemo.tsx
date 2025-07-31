"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "Triumph at Aarohan: Draw V’s Debut",
      description:
        "From zero to champion organizers: our story began at Aarohan.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Behind the Scenes: Aarohan Moments",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
    
      skeleton: <SkeletonThree />,
      className: "col-span-1 lg:col-span-6 border-b lg:border-none", 
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
  <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
    Where Champions and Communities Are Built
  </h4>
  <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
    Power your events, connect your community, and level up your tournaments—all from one streamlined platform.
  </p>
</div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title ? feature.title : `feature-${i}`} className={feature.className}>
              {/* Only render title/desc if they exist (not for 3rd card, which handles its own) */}
              {feature.title && <FeatureTitle>{feature.title}</FeatureTitle>}
              {feature.description && (
                <FeatureDescription>{feature.description}</FeatureDescription>
              )}
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};


const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-center tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug px-8">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-center mx-auto my-2 px-8",
        "text-neutral-500 font-normal dark:text-neutral-300"
      )}
    >
      {children}
    </p>
  );
};


export const SkeletonOne = () => {
  return (
    <div className="relative flex flex-col items-center py-8 px-4 gap-6 h-full">
      {/* Large and centered image */}
      <div className="w-full flex justify-center mb-4">
        <img
          src="aarohan1.jpg"
          alt="Aarohan Valorant Tournament"
          width={1200}
          height={700}
          className="w-[100%] max-w-2xl rounded-xl shadow-lg object-contain bg-gray-100 dark:bg-neutral-800 mx-auto"
        />
      </div>
      {/* Centered event description below the image */}
      <div className="w-full flex flex-col items-center text-center mt-2">
        <p className="text-pretty text-base md:text-lg text-neutral-700 dark:text-neutral-200 leading-relaxed px-4 mt-12 text-justify">
          During Aarohan, the cultural fest of MIT-WPU, Draw V, a passionate and emerging gaming community, had the opportunity to collaborate with the fest team to organize an exciting Valorant tournament. Despite not being officially established at the time, Draw V stepped up to the challenge — and delivered beyond expectations.
          <br /><br />
          With just a week of planning, the tournament was executed with remarkable precision. Every member of the team worked tirelessly to ensure that each aspect of the event ran smoothly. From match scheduling to player coordination, everything was handled with professionalism and energy.
          <br /><br />
          The tournament was fully equipped with all the essentials for a top-tier experience — including a dedicated map veto website, a well-maintained Discord server, and clear communication channels that kept players and organizers perfectly in sync.
          <br /><br />
          This collaboration was a huge success and a proud moment for the Draw V community. It proved that with the right drive and teamwork, even a freshly formed group can pull off something extraordinary. The experience laid a strong foundation for future events and marked the beginning of Draw V’s journey in the collegiate esports scene.
        </p>
        {/* Logo below paragraph */}
        <img
  src="logo-dark.png"
  alt="Draw V Logo"
  width={160}
  height={160}
  className="mt-10 mb-10 mx-auto block"
  style={{
    background: "none",
    border: "none",
    boxShadow: "none",
  }}
/>

      </div>
      {/* Bottom gradients remain for bento styling */}
      <div className="absolute bottom-0 z-40 inset-x-0 h-40 bg-gradient-to-t from-black/40 via-black/10 to-transparent dark:from-black/60 dark:via-black/20 dark:to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-24 bg-gradient-to-b from-white/30 via-transparent to-transparent dark:from-black/30 dark:via-transparent dark:to-transparent w-full pointer-events-none" />
    </div>
  );
};


// --- 2nd Card: Team Management BTS photo stack (images occupy most width) ---
export const SkeletonTwo = () => {
  const images = [
    "aarohan2.jpg",
    "aarohan3.jpg", 
    "aarohan6.jpg",
  ];
  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2 w-full h-full">
      {images.map((src, idx) => (
        <img
          key={src || idx}
          src={src}
          alt={`Aarohan behind the scenes ${idx + 1}`}
          className="w-[96%] max-w-3xl rounded-xl object-cover shadow-md bg-gray-200 dark:bg-neutral-800"
        />
      ))}
    </div>
  );
};


// --- 3rd Card: Tournament Highlights ("YouTube light" embed) ---
export const SkeletonThree = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="w-full flex flex-col items-center text-center mb-6">
      <h3 className="text-2xl md:text-3xl font-semibold text-black dark:text-white mb-2">
        Tournament Highlights
      </h3>
      <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-300 mb-4">
        Catch all the DRAW V action: see match highlights, feature explainers, and event broadcasts—live!
      </p>
      <div className="w-full aspect-video relative rounded-lg overflow-hidden shadow-lg bg-black">
        {!playing ? (
          <button
            className="absolute inset-0 w-full h-full flex items-center justify-center group"
            onClick={() => setPlaying(true)}
            aria-label="Play tournament video"
            style={{ cursor: "pointer" }}
          >
            <img
              src="Thumbnail-1.png" // Your thumbnail
              alt="DRAW V YouTube"
              className="w-full h-full object-contain object-center"
              width={800}
              height={450}
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <IconBrandYoutubeFilled className="h-24 w-24 text-red-600 transition-opacity group-hover:opacity-80 opacity-90 drop-shadow-xl" />
            </span>
          </button>
        ) : (
          <iframe
            src="https://www.youtube.com/embed/i3F9-oyMslU?autoplay=1"
            title="DRAW V YouTube Live"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full absolute inset-0"
          />
        )}
      </div>
    </div>
  );
};
