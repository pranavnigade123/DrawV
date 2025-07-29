export default function AboutPage() {
  return (
    <main>
<div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <video
          src="/bg-video1.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-screen h-screen object-cover block"
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            display: "block",
            background: "#000"
          }}
        />
        // Vignette gradient overlay at bottom
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100vw",
            height: "70vh",
            background: "linear-gradient(to top, black 0%, transparent 100%)",
            zIndex: 2,
            transition: "opacity 0.3s",
          }}
        />
      </div>
    </main>
  );
}
