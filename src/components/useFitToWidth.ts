import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/** Font size used only to take a measurement; the result is scaled from it. */
const MEASURE_PX = 100;

/**
 * Sizes a single line of text so it exactly spans its container's content box.
 * Measures the text at a known font size, then scales proportionally — letter
 * shapes are never stretched.
 */
export function useFitToWidth<C extends HTMLElement, T extends HTMLElement>() {
  const containerRef = useRef<C>(null);
  const textRef = useRef<T>(null);
  const [fontSize, setFontSize] = useState<number>();

  const fit = useCallback(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const available = container.clientWidth;
    if (!available) return;

    // Measure intrinsic width: max-content frees the line from the container,
    // otherwise a line narrower than the box just reports the box's width.
    const prevWidth = text.style.width;
    const prevSize = text.style.fontSize;
    text.style.width = 'max-content';
    text.style.fontSize = `${MEASURE_PX}px`;
    const measured = text.getBoundingClientRect().width;
    text.style.width = prevWidth;
    text.style.fontSize = prevSize;

    if (!measured) return;
    setFontSize((MEASURE_PX * available) / measured);
  }, []);

  useLayoutEffect(() => {
    fit();

    const observer = new ResizeObserver(fit);
    if (containerRef.current) observer.observe(containerRef.current);

    // Kanit swapping in changes the metrics, so re-fit once it has loaded.
    document.fonts?.ready.then(fit).catch(() => {});

    return () => observer.disconnect();
  }, [fit]);

  return { containerRef, textRef, fontSize };
}
