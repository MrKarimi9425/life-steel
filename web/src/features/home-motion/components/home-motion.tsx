"use client";

import type { ReactNode } from "react";
import {
  domAnimation,
  LazyMotion,
  MotionConfig,
  m,
  useReducedMotion,
  type Variants,
} from "motion/react";

type RevealDirection = "fade" | "up" | "start" | "end";

const easing = [0.22, 1, 0.36, 1] as const;

const revealOffset: Record<RevealDirection, { opacity: number; x?: number; y?: number }> = {
  fade: { opacity: 0 },
  up: { opacity: 0, y: 28 },
  start: { opacity: 0, x: -28 },
  end: { opacity: 0, x: 28 },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: easing },
  },
};

export function HomeMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className={className ?? "w-full"}
      initial={shouldReduceMotion ? false : revealOffset[direction]}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.14, margin: "0px 0px -48px 0px" }}
      transition={{ duration: 0.68, delay, ease: easing }}
    >
      {children}
    </m.div>
  );
}

export function RevealGroup({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.075,
          },
        },
      }}
    >
      {children}
    </m.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={itemVariants}>
      {children}
    </m.div>
  );
}
