/**
 * AnimatedCounter Atom
 *
 * A counter that animates from 0 to the target value when in view.
 * Uses intersection observer to trigger animation.
 */

import { useState, useEffect, useRef } from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface AnimatedCounterProps extends Omit<TypographyProps, 'children'> {
  /** Target value to count to */
  value: number;
  /** Duration of animation in ms */
  duration?: number;
  /** Prefix (e.g., "$", "+") */
  prefix?: string;
  /** Suffix (e.g., "%", "+", "k") */
  suffix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Start animation when in view */
  startOnView?: boolean;
}

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

const AnimatedCounter = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  startOnView = true,
  ...typographyProps
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startOnView) {
      // Start immediately if not waiting for view
      animateValue();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animateValue();
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, hasAnimated, startOnView]);

  const animateValue = () => {
    const startTime = performance.now();
    const startValue = 0;

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = startValue + (value - startValue) * easedProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  };

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <Typography ref={ref} component="span" {...typographyProps}>
      {prefix}
      {formattedValue}
      {suffix}
    </Typography>
  );
};

export default AnimatedCounter;
