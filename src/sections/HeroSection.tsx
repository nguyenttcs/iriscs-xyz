import { useRef } from 'react';
import SocialLinks from '../components/SocialLinks';
import CursorCrosshair from '../components/CursorCrosshair';
import CursorText from '../components/CursorText';
import FadeIn from '../components/FadeIn';
import LetterSwap from '../components/LetterSwap';
import Magnet from '../components/Magnet';
import { useFitToWidth } from '../components/useFitToWidth';

/** Decorative descriptors, not navigation — rendered as plain text. */
const DESCRIPTORS = ['Design', 'Code', 'Sleep', 'Repeat'];

const HEADING = "Hi, i'm iris";

const TAGLINE =
  'A UI/UX Designer who loves design, creating creative things, solving problems and turning ideas into reality';

const PORTRAIT_SRC = '/iris-3d.webp';

export default function HeroSection() {
  const { containerRef, textRef, fontSize } = useFitToWidth<HTMLDivElement, HTMLHeadingElement>();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="cursor-none-area relative flex h-screen flex-col"
      // Clip both axes: the magnet can push the bottom-anchored portrait past
      // the section edge, which would otherwise extend the page and raise a
      // scrollbar. `clip` rather than `hidden` avoids making this a scroll container.
      style={{ background: '#0C0C0C', overflow: 'clip' }}
    >
      <FadeIn
        delay={0}
        y={-20}
        className="relative z-20 flex items-center justify-between gap-2 px-6 pt-6 sm:gap-4 md:px-10 md:pt-8"
      >
        {DESCRIPTORS.map((word) => (
          <CursorText
            key={word}
            text={word}
            radius={110}
            minWeight={500}
            maxWeight={900}
            className="whitespace-nowrap text-[0.7rem] uppercase tracking-wider text-[#D7E2EA] sm:text-sm md:text-lg lg:text-[1.4rem]"
          />
        ))}
      </FadeIn>

      <div className="relative z-20 overflow-hidden px-6 md:px-10">
        <div ref={containerRef}>
          <FadeIn delay={0.15} y={40}>
            {/* The vw sizes are the pre-measurement fallback; the fitted size wins. */}
            <h1
              ref={textRef}
              className="hero-heading mt-6 block w-full whitespace-nowrap text-[14vw] font-black uppercase leading-none tracking-tight sm:mt-4 sm:text-[15vw] md:-mt-5 md:text-[16vw] lg:text-[17.5vw]"
              style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
            >
              <LetterSwap
                label={HEADING}
                letterClassName="hero-heading"
                staggerFrom="first"
                staggerDuration={0.03}
              />
            </h1>
          </FadeIn>
        </div>
      </div>

      <div className="relative z-20 mt-auto flex flex-col items-start gap-5 px-6 pb-7 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between min-[420px]:gap-6 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <CursorText
            as="p"
            text={TAGLINE}
            granularity="word"
            radius={90}
            minWeight={300}
            maxWeight={700}
            maxScale={1.08}
            className="max-w-[300px] uppercase leading-snug tracking-wide text-[#D7E2EA] min-[420px]:max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          />
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <SocialLinks />
        </FadeIn>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
        <FadeIn delay={0.6} y={30}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
            wrapperClassName="block w-full"
          >
            <img
              src={PORTRAIT_SRC}
              alt="Iris, UI/UX designer"
              width={828}
              height={816}
              fetchPriority="high"
              decoding="async"
              className="block h-auto w-full select-none"
              draggable={false}
            />
          </Magnet>
        </FadeIn>
      </div>

      <CursorCrosshair containerRef={sectionRef} />
    </section>
  );
}
