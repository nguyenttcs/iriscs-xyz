import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ElementType,
} from 'react';

type CursorTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Distance in px at which a character starts reacting. */
  radius?: number;
  /** Kanit ships as static weights, so these snap to 100s. */
  minWeight?: number;
  maxWeight?: number;
  /** Continuous, so it smooths over the weight steps. */
  maxScale?: number;
  /**
   * 'char' reacts per letter but boxes each glyph separately, which drops
   * kerning and widens running text. Use 'word' for prose.
   */
  granularity?: 'char' | 'word';
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/** Ease the falloff so the reaction blooms instead of forming a hard disc. */
const smooth = (n: number) => n * n * (3 - 2 * n);

export default function CursorText({
  text,
  as: Tag = 'span',
  className = '',
  style,
  radius = 130,
  minWeight = 500,
  maxWeight = 900,
  maxScale = 1.06,
  granularity = 'char',
}: CursorTextProps) {
  const rootRef = useRef<HTMLElement>(null);
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const centres = useRef<Array<{ x: number; y: number }>>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const count = useRef(0);

  const measure = useCallback(() => {
    charRefs.current.length = count.current;
    centres.current = charRefs.current.map((el) => {
      if (!el) return { x: -1e6, y: -1e6 };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }, []);

  const paint = useCallback(() => {
    frame.current = 0;
    const p = pointer.current;
    for (let i = 0; i < count.current; i += 1) {
      const el = charRefs.current[i];
      const c = centres.current[i];
      if (!el || !c) continue;

      let f = 0;
      if (p) f = smooth(clamp01(1 - Math.hypot(p.x - c.x, p.y - c.y) / radius));

      // Snap to the weights actually loaded; a static family cannot interpolate.
      const weight = Math.round((minWeight + (maxWeight - minWeight) * f) / 100) * 100;
      el.style.fontWeight = String(weight);
      // Keep the centring translate — a bare scale() would clobber it.
      el.style.transform = `translateX(-50%) scale(${1 + (maxScale - 1) * f})`;
    }
  }, [radius, minWeight, maxWeight, maxScale]);

  const schedule = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(paint);
  }, [paint]);

  useLayoutEffect(() => {
    // No cursor to follow, or the reader asked for less motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    measure();
    const onMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer.current = null;
      schedule();
    };
    const onLayout = () => {
      measure();
      schedule();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, { passive: true });
    // Character boxes move once the webfont swaps in.
    document.fonts?.ready.then(onLayout).catch(() => {});

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [measure, schedule]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const words = text.split(' ');
  let index = -1;

  const unit = (content: string, key: string) => {
    index += 1;
    const at = index;
    return (
      <span key={key} aria-hidden="true" className="relative inline-block">
        {/*
          Sized at the resting weight, and never changed, so the line cannot
          reflow. A swelling glyph simply overflows its own box.
        */}
        <span className="invisible" style={{ fontWeight: minWeight }}>
          {content}
        </span>
        <span
          ref={(el) => {
            if (el) charRefs.current[at] = el;
          }}
          className="absolute left-1/2 top-0 block whitespace-pre"
          style={{ transform: 'translateX(-50%)', willChange: 'font-weight, transform' }}
        >
          {content}
        </span>
      </span>
    );
  };

  const body = words.map((word, w) => (
    <Fragment key={`${word}-${w}`}>
      {granularity === 'word' ? (
        unit(word, `w-${w}`)
      ) : (
        <span aria-hidden="true" className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, i) => unit(char, `${char}-${i}`))}
        </span>
      )}
      {/* Outside the inline-block so lines still wrap between words. */}
      {w < words.length - 1 ? ' ' : null}
    </Fragment>
  ));

  count.current = index + 1;

  return (
    <Tag ref={rootRef} className={className} style={style}>
      {/* The split copy reads as loose letters, so carry the real text here. */}
      <span className="sr-only">{text}</span>
      {body}
    </Tag>
  );
}
