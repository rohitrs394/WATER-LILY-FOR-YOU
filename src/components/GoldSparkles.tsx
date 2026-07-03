import React, { useEffect, useRef } from "react";

export const GoldSparkles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      hue: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = -(Math.random() * 0.4 + 0.1); // float upwards
        this.speedX = Math.random() * 0.3 - 0.15; // horizontal drift
        this.opacity = Math.random() * 0.7 + 0.1;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
        this.hue = Math.random() * 15 + 35; // golden gold hues (35 to 50 deg)
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Reset if floats off-screen
        if (this.y < 0) {
          this.y = height;
          this.x = Math.random() * width;
        }
        if (this.x < 0 || this.x > width) {
          this.x = Math.random() * width;
        }

        // Pulse opacity
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0) {
          this.opacity = Math.random() * 0.7 + 0.1;
          this.y = height + Math.random() * 50;
          this.x = Math.random() * width;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
        
        // Add subtle bloom glow to larger ones
        if (this.size > 1.8) {
          context.shadowBlur = 8;
          context.shadowColor = `rgba(201, 168, 76, ${this.opacity})`;
        } else {
          context.shadowBlur = 0;
        }
        
        context.fill();
      }
    }

    const particles: Particle[] = [];
    const maxParticles = Math.min(Math.floor(width / 15), 100);

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none"
    />
  );
};
