import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  color: string;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Deep space realistic star distribution (1,400+ micro stars across layers)
    const starCount = Math.floor((width * height) / 1200);
    const starPalette = [
      "rgba(255, 255, 255,",
      "rgba(220, 230, 255,",
      "rgba(200, 220, 255,",
      "rgba(255, 240, 220,",
    ];

    const stars: Star[] = Array.from({ length: starCount }, () => {
      const z = Math.random(); // 0 is far/dim, 1 is close
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        size: z > 0.85 ? Math.random() * 1.2 + 0.8 : Math.random() * 0.7 + 0.2,
        baseAlpha: z * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        color: starPalette[Math.floor(Math.random() * starPalette.length)],
      };
    });

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space base color
      ctx.fillStyle = "#020305";
      ctx.fillRect(0, 0, width, height);

      // Deep nebula ambient dust
      const nebula = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.7
      );
      nebula.addColorStop(0, "rgba(10, 16, 32, 0.65)");
      nebula.addColorStop(0.5, "rgba(5, 8, 18, 0.45)");
      nebula.addColorStop(1, "rgba(2, 3, 5, 1)");
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, width, height);

      frame++;

      for (const s of stars) {
        const twinkle = Math.sin(frame * s.twinkleSpeed) * 0.25 + 0.75;
        const alpha = Math.min(1, s.baseAlpha * twinkle);

        ctx.fillStyle = `${s.color} ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}