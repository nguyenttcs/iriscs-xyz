import { useCallback, useEffect, useRef, type RefObject } from 'react';

type CursorCrosshairProps = {
  /** Area the crosshair tracks and is measured against. */
  containerRef: RefObject<HTMLElement>;
  /** Show the live x/y readout beside the intersection. */
  showReadout?: boolean;
  /** Thickness of the guide lines, in px. */
  lineWidth?: number;
  /** Square marker sitting on the intersection. */
  markerSize?: number;
  markerColor?: string;
  className?: string;
};

export default function CursorCrosshair({
  containerRef,
  showReadout = true,
  lineWidth = 2,
  markerSize = 12,
  markerColor = '#FF5A00',
  className = '',
}: CursorCrosshairProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const point = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  const paint = useCallback(() => {
    frame.current = 0;
    const root = rootRef.current;
    const v = vRef.current;
    const h = hRef.current;
    if (!root || !v || !h) return;

    const p = point.current;
    root.style.opacity = p ? '1' : '0';
    if (!p) return;

    v.style.transform = `translateX(${p.x}px)`;
    h.style.transform = `translateY(${p.y}px)`;

    const marker = markerRef.current;
    if (marker) marker.style.transform = `translate(${p.x}px, ${p.y}px)`;

    const label = labelRef.current;
    if (label) {
      label.style.transform = `translate(${p.x}px, ${p.y}px)`;
      label.textContent = `x: ${Math.round(p.x)}  y: ${Math.round(p.y)}`;
    }
  }, []);

  const schedule = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(paint);
  }, [paint]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // A crosshair needs a cursor to follow.
    if (!window.matchMedia('(hover: hover)').matches) return;

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      point.current = x < 0 || y < 0 || x > r.width || y > r.height ? null : { x, y };
      schedule();
    };
    const onLeave = () => {
      point.current = null;
      schedule();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [containerRef, schedule]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-30 overflow-hidden opacity-0 transition-opacity duration-150 ${className}`}
    >
      <div
        ref={vRef}
        className="absolute left-0 top-0 h-full will-change-transform"
        style={{ width: lineWidth, marginLeft: -lineWidth / 2, background: 'rgba(215, 226, 234, 0.25)' }}
      />
      <div
        ref={hRef}
        className="absolute left-0 top-0 w-full will-change-transform"
        style={{ height: lineWidth, marginTop: -lineWidth / 2, background: 'rgba(215, 226, 234, 0.25)' }}
      />
      {/* Square marker centred on the intersection via negative margins. */}
      <div
        ref={markerRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: markerSize,
          height: markerSize,
          marginLeft: -markerSize / 2,
          marginTop: -markerSize / 2,
          background: markerColor,
        }}
      />
      {showReadout ? (
        <div
          ref={labelRef}
          className="absolute left-0 top-0 whitespace-nowrap pl-3 pt-2 text-[0.65rem] uppercase tracking-widest will-change-transform sm:text-xs"
          style={{ color: 'rgba(215, 226, 234, 0.55)' }}
        />
      ) : null}
    </div>
  );
}
