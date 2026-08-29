import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useState } from 'react';

type StaggerFrom = 'first' | 'last' | 'center' | number;

type LetterSwapProps = {
  label: string;
  /** true: the incoming letter rises from below. false: it drops from above. */
  reverse?: boolean;
  transition?: Transition;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  className?: string;
  /**
   * Applied to each animated letter. Gradient/clip styles must live here:
   * `background-clip: text` on an ancestor cannot clip to transformed
   * descendants, which paint in their own layer.
   */
  letterClassName?: string;
  onClick?: () => void;
};

const DEFAULT_TRANSITION: Transition = { type: 'spring', duration: 0.7 };

function delayFor(index: number, total: number, from: StaggerFrom, step: number) {
  if (from === 'last') return (total - 1 - index) * step;
  if (from === 'center') return Math.abs(index - (total - 1) / 2) * step;
  if (typeof from === 'number') return Math.abs(index - from) * step;
  return index * step;
}

export default function LetterSwap({
  label,
  reverse = true,
  transition = DEFAULT_TRANSITION,
  staggerDuration = 0.03,
  staggerFrom = 'first',
  className = '',
  letterClassName = '',
  onClick,
}: LetterSwapProps) {
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  const chars = Array.from(label);
  const active = hovered && !reduceMotion;
  // Where the outgoing copy exits, and where the incoming copy waits. These
  // drive `top`, not `transform`: a transform promotes the span to its own
  // compositing layer, which breaks `background-clip: text` in Chrome and makes
  // the gradient paint as a solid block. Percentages resolve against the clip
  // box, so the incoming copy lands exactly on the outgoing one's slot.
  const exitTo = reverse ? '-100%' : '100%';
  const enterFrom = reverse ? '100%' : '-100%';

  return (
    <span
      className={`inline-flex ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* The split copy is decorative; the plain label carries the accessible text. */}
      <span className="sr-only">{label}</span>

      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, i) => {
          const each = { ...transition, delay: delayFor(i, chars.length, staggerFrom, staggerDuration) };
          // Pad the clip box so descenders (the comma) are not sheared off.
          return (
            <span
              key={`${char}-${i}`}
              // leading-none makes the clip box exactly one em, matching each
              // copy's height so a copy travels exactly one box per swap. Kanit
              // keeps its descenders inside that box, so nothing is sheared and
              // no strip of the incoming letter shows below the line.
              className="relative inline-block overflow-hidden leading-none"
            >
              <motion.span
                className={`relative inline-block ${letterClassName}`}
                animate={{ top: active ? exitTo : '0%' }}
                transition={each}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
              <motion.span
                className={`absolute left-0 inline-block ${letterClassName}`}
                animate={{ top: active ? '0%' : enterFrom }}
                transition={each}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
