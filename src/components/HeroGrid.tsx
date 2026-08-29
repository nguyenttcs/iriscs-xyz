/**
 * Faint grid behind the hero. Purely decorative and purely CSS -- see the
 * .hero-grid rules in index.css for the layering.
 */
export default function HeroGrid() {
  return (
    <div className="hero-grid" aria-hidden="true">
      <div className="hero-grid__base" />
      <div className="hero-grid__patch" />
    </div>
  );
}
