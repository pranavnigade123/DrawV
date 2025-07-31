"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
  vignetteText = "Check out our Liquipedia Tournament Page!",
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  vignetteText?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale} vignetteText={vignetteText}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  translate,
  children,
  vignetteText,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate?: MotionValue<number>;
  children: React.ReactNode;
  vignetteText?: string;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl relative"
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
        {children}

      {/* Vignette overlay */}
<div
  aria-hidden="true"
  className="pointer-events-none absolute bottom-0 left-0 w-full h-[60%]"
  style={{
    background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
  }}
>
  {vignetteText && (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4 text-center mb-7">
      <a
        href="https://liquipedia.net/valorant/MIT_Aarohan_Valorant_Cup_2025"  
        target="_blank"
        rel="noopener noreferrer"
        className="text-white font-semibold text-lg md:text-xl drop-shadow-lg  hover:text-gray-300 transition-colors duration-300"
      >
        {vignetteText}
      </a>
    </div>
  )}
</div>

        </div>
    </motion.div>
  );
};
