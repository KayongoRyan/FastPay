import { type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLocation } from "react-router-dom";
import { ensureGsap, motionDefaults, prefersReducedMotion } from "../lib/motion";

type StaggerBlock = {
  trigger: string;
  targets: string;
  stagger?: number;
  y?: number;
};

const staggerBlocks: StaggerBlock[] = [
  { trigger: ".category-grid", targets: ".category-grid .category-card", stagger: 0.08 },
  { trigger: ".capabilities-grid", targets: ".capabilities-grid .capability-card", stagger: 0.1 },
  { trigger: ".services-page__grid", targets: ".services-page__grid .service-detail-card", stagger: 0.09 },
  { trigger: ".steps-grid", targets: ".steps-grid .step-card", stagger: 0.12 },
  { trigger: ".services__grid", targets: ".services__grid .service-item", stagger: 0.08 },
  { trigger: ".testimonials__stack", targets: ".testimonials__stack .testimonial-card", stagger: 0.12 },
  {
    trigger: ".pricing__grid",
    targets: ".pricing__grid .pricing-card",
    stagger: 0.1,
  },
  { trigger: ".logo-strip__logos", targets: ".logo-strip__logo", stagger: 0.06 },
  { trigger: ".contact-places__list", targets: ".contact-places__item", stagger: 0.1 },
  { trigger: ".faq__list", targets: ".faq__list .faq__item", stagger: 0.08 },
];

const fadeUpSelectors = [
  ".page-section__header",
  ".page-hero__inner > *",
  ".sec-hero__inner > *",
  ".contact-hero__inner > *",
  ".services__header",
  ".testimonials__intro > *",
  ".pricing__header",
  ".logo-strip__label",
  ".split-panel__content",
  ".split-panel__visual",
  ".comparison-table-wrap",
  ".contact-rail",
  ".contact-compose",
  ".contact-places__intro",
  ".cta-strip__inner",
  ".faq__layout > div:first-child",
  ".pricing-page__faq > div:first-child",
];

function animateHero(main: HTMLElement) {
  const hero = main.querySelector(".hero");
  if (!hero) return;

  const orbs = hero.querySelectorAll(".hero__orb");
  gsap.to(orbs, {
    x: "random(-18, 18)",
    y: "random(-14, 14)",
    duration: "random(10, 16)",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: { each: 2.5, from: "random" },
  });

  const floatCards = hero.querySelectorAll(".hero-float");
  if (floatCards.length) {
    gsap.to(floatCards, {
      y: -12,
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.35,
    });
  }
}

function animateSecHeroGlow(main: HTMLElement) {
  const glows = main.querySelectorAll(".sec-hero__glow");
  if (!glows.length) return;

  gsap.to(glows, {
    opacity: 0.85,
    scale: 1.06,
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: 0.8,
  });
}

function animateCategoryBars(main: HTMLElement) {
  const fills = main.querySelectorAll<HTMLElement>(".category-card__bar-fill");
  fills.forEach((fill) => {
    const targetWidth = fill.style.width;
    gsap.set(fill, { width: 0 });
    gsap.to(fill, {
      width: targetWidth,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: fill.closest(".category-card") ?? fill,
        start: "top 85%",
        once: true,
      },
    });
  });
}

export function useGuestPageMotion(mainRef: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();

  useGSAP(
    () => {
      ensureGsap();
      const main = mainRef.current;
      if (!main) return;

      if (prefersReducedMotion()) {
        main.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal--visible"));
        return;
      }

      const ctx = gsap.context(() => {
        animateHero(main);
        animateSecHeroGlow(main);
        animateCategoryBars(main);

        fadeUpSelectors.forEach((selector) => {
          const elements = gsap.utils.toArray<HTMLElement>(main.querySelectorAll(selector));
          elements.forEach((el) => {
            if (el.closest(".reveal") && !el.classList.contains("reveal")) return;

            gsap.from(el, {
              opacity: 0,
              y: motionDefaults.y,
              duration: motionDefaults.duration,
              ease: motionDefaults.ease,
              scrollTrigger: {
                trigger: el,
                start: motionDefaults.scrollStart,
                once: true,
              },
            });
          });
        });

        staggerBlocks.forEach(({ trigger, targets, stagger, y }) => {
          const triggerEl = main.querySelector(trigger);
          const items = main.querySelectorAll(targets);
          if (!triggerEl || !items.length) return;

          gsap.from(items, {
            opacity: 0,
            y: y ?? 24,
            duration: motionDefaults.duration,
            ease: motionDefaults.ease,
            stagger: stagger ?? 0.08,
            scrollTrigger: {
              trigger: triggerEl,
              start: "top 85%",
              once: true,
            },
          });
        });

        const analyticsOrbs = main.querySelectorAll(".analytics__orb");
        if (analyticsOrbs.length) {
          gsap.to(analyticsOrbs, {
            x: "random(-10, 10)",
            y: "random(-8, 8)",
            duration: "random(8, 12)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.4,
          });
        }

        const mockupBars = main.querySelectorAll<HTMLElement>(".split-panel__mockup-bar");
        mockupBars.forEach((bar) => {
          const height = bar.style.height;
          gsap.set(bar, { height: 0 });
          gsap.to(bar, {
            height,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bar.closest(".split-panel__mockup") ?? bar,
              start: "top 85%",
              once: true,
            },
          });
        });
      }, main);

      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      window.addEventListener("load", refresh);

      return () => {
        window.removeEventListener("load", refresh);
        ctx.revert();
      };
    },
    { dependencies: [pathname], scope: mainRef },
  );
}
