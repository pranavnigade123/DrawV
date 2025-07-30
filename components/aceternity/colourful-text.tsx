import React from "react";
import { motion } from "framer-motion";

export function ColourfulText({
  text,
  colorTheme = "blue"
}: {
  text: string,
  colorTheme?: "blue" | "redYellow"
}) {
  // Define your color palettes inside the component
  const blueShades = [
    "#191CFF", "#2749F8", "#2D91FB", "#4BD1FF", "#2969E9",
    "#1050C0", "#3280EC", "#0053A4", "#006BDB", "#81C4FF"
  ];

  const redYellowShades = [
    "#FF4500", "#FF6347", "#FF7F50", "#FFA500", "#FFB84D",
    "#FFD700", "#FFE066", "#FFFF66", "#FFAA33", "#FFCC44"
  ];

  const colors = colorTheme === "redYellow" ? redYellowShades : blueShades;
  const [currentColors, setCurrentColors] = React.useState(colors);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      setCurrentColors(shuffled);
      setCount((prev) => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [colors]);

  return text.split("").map((char, index) => (
    <motion.span
      key={`${char}-${count}-${index}`}
      initial={{ y: 0 }}
      animate={{
        color: currentColors[index % currentColors.length],
        y: [0, -3, 0],
        scale: [1, 1.01, 1],
        filter: ["blur(0px)", `blur(5px)`, "blur(0px)"],
        opacity: [1, 0.8, 1],
      }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="inline-block whitespace-pre font-sans tracking-tight"
    >
      {char}
    </motion.span>
  ));
}
