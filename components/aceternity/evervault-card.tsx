import React from "react";
import clsx from "clsx";

type TeamCardProps = {
  img: string;
  name: string;
  designation: string;
  className?: string;
};

export function EvervaultCard({ img, name, designation, className }: TeamCardProps) {
  return (
    <div
      className={clsx(
        "relative bg-black rounded-2xl flex flex-col items-center justify-end min-h-[340px] w-full overflow-hidden shadow-xl",
        className
      )}
      style={{
        border: "2px solid transparent",
        boxShadow: "0 0 0 1.5px #fff inset",
      }}
    >
      {/* White border corners (SVG or pseudo-element) */}
      <div className="pointer-events-none absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" fill="none">
          <rect
            x={8}
            y={8}
            width="calc(100% - 16px)"
            height="calc(100% - 16px)"
            stroke="#fff"
            strokeWidth={2}
            rx={20}
            style={{ vectorEffect: "non-scaling-stroke" }}
          />
        </svg>
        {/* corner plus-like marks */}
        <div className="absolute left-0 top-0 w-5 h-5 border-t-2 border-l-2 border-white" />
        <div className="absolute right-0 top-0 w-5 h-5 border-t-2 border-r-2 border-white" />
        <div className="absolute left-0 bottom-0 w-5 h-5 border-b-2 border-l-2 border-white" />
        <div className="absolute right-0 bottom-0 w-5 h-5 border-b-2 border-r-2 border-white" />
      </div>

      <div className="flex flex-col items-center justify-end flex-1 p-6 z-10 w-full">
        {/* Image */}
        <img
          src={img}
          alt={name}
          className="w-24 h-24 object-cover rounded-xl border border-white mb-6 shadow-lg bg-neutral-800"
        />
        {/* Name */}
        <h3 className="text-2xl font-bold text-white text-center mb-2">{name}</h3>
        {/* Designation */}
        <p className="text-base text-neutral-200 text-center">{designation}</p>
      </div>
    </div>
  );
}
