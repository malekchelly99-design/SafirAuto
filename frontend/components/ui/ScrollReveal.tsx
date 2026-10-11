'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

const directionMap = {
  up: 'translateY',
  down: 'translateY',
  left: 'translateX',
  right: 'translateX',
  none: '',
};

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 24,
  duration = 500,
  once = true,
  threshold = 0.1,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  const getTransform = () => {
    if (visible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up': return `translate3d(0, ${distance}px, 0)`;
      case 'down': return `translate3d(0, -${distance}px, 0)`;
      case 'left': return `translate3d(${distance}px, 0, 0)`;
      case 'right': return `translate3d(-${distance}px, 0, 0)`;
      default: return 'translate3d(0, 0, 0)';
    }
  };

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: getTransform(),
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

export function StaggeredReveal({
  children,
  staggerMs = 100,
  baseDelay = 0,
  ...props
}: ScrollRevealProps & { staggerMs?: number; baseDelay?: number }) {
  const childArray = Array.isArray(children)
    ? children.filter(c => c !== null && c !== undefined)
    : [children];

  return (
    <>
      {childArray.map((child, i) => (
        <ScrollReveal
          key={i}
          delay={baseDelay + i * staggerMs}
          {...props}
        >
          {child}
        </ScrollReveal>
      ))}
    </>
  );
}

