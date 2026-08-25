"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { containerClassName } from "@/lib/constants/styles";
import { cn } from "@/lib/utils";

type HeroBackgroundProps = {
  children: ReactNode;
};

const glowLayers = [
  { radius: 900, color: "--color-inverse-primary", mix: 24, fade: 70 },
  { radius: 600, color: "--color-primary", mix: 16, fade: 75 },
  { radius: 320, color: "--color-tertiary", mix: 12, fade: 80 },
];

export function HeroBackground({ children }: HeroBackgroundProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const { width, height } = section.getBoundingClientRect();
    const initial = { x: width * 0.35, y: height * 0.45 };
    targetRef.current = initial;
    setPosition(initial);
  }, []);

  const animate = useCallback(() => {
    setPosition((current) => {
      const dx = targetRef.current.x - current.x;
      const dy = targetRef.current.y - current.y;
      return {
        x: current.x + dx * 0.12,
        y: current.y + dy * 0.12,
      };
    });
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (reducedMotion || !isActive) return;
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [animate, isActive, reducedMotion]);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = sectionRef.current?.getBoundingClientRect();
    if (!bounds) return;
    targetRef.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
    if (reducedMotion) {
      setPosition(targetRef.current);
    }
  };

  const glowX = reducedMotion ? "35%" : `${position.x}px`;
  const glowY = reducedMotion ? "45%" : `${position.y}px`;
  const glowOpacity = isActive ? 1 : 0.45;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsActive(true)}
      onPointerLeave={() => setIsActive(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ opacity: glowOpacity }}
      >
        {glowLayers.map((layer) => (
          <div
            key={layer.color}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(${layer.radius}px circle at ${glowX} ${glowY}, color-mix(in srgb, var(${layer.color}) ${layer.mix}%, transparent), transparent ${layer.fade}%)`,
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--color-outline-variant) 18%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-outline-variant) 18%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: `radial-gradient(ellipse 90% 80% at ${glowX} ${glowY}, black 15%, transparent 75%)`,
          WebkitMaskImage: `radial-gradient(ellipse 90% 80% at ${glowX} ${glowY}, black 15%, transparent 75%)`,
        }}
      />

      <div
        className={cn(
          containerClassName,
          "relative z-10 pb-12 pt-32 md:pt-[120px]"
        )}
      >
        {children}
      </div>
    </section>
  );
}
