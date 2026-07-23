import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ensureGsap, motionDefaults, prefersReducedMotion } from "../lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
};

export function Reveal({ children, className = "", delay = 0, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      ensureGsap();
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        el.classList.add("reveal--visible");
        gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      gsap.set(el, { opacity: 0, y: motionDefaults.y });

      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: motionDefaults.duration,
        delay: delay / 1000,
        ease: motionDefaults.ease,
        scrollTrigger: {
          trigger: el,
          start: motionDefaults.scrollStart,
          once: true,
        },
        onComplete: () => {
          el.classList.add("reveal--visible");
        },
      });
    },
    { scope: ref },
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("reveal--visible");
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
