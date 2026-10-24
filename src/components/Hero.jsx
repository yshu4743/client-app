import { useEffect, useRef } from 'react';
import { DressVector } from '../assets/dresses/DressRegistry.jsx';
import { nextUid } from '../lib/format.js';
import { IconCamera, IconArrowRight } from './Icons.jsx';
import './Hero.css';

const MANNEQUINS = ['noir-slip', 'emerald-column', 'ivory-aframe', 'plum-halter'];

export default function Hero({ onOpenTryOn, onBrowse }) {
  const uid = useRef(nextUid('hero')).current;
  const parallaxRef = useRef(null);

  /* Subtle parallax drift on the figure rail. */
  useEffect(() => {
    const node = parallaxRef.current;
    if (!node) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return undefined;

    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        node.style.setProperty('--drift', `${dx * 26}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__grain" aria-hidden="true" />

      {/* ── Rail of drifting gowns ──────────────────────────────────── */}
      <div className="hero__rail" ref={parallaxRef} aria-hidden="true">
        {MANNEQUINS.map((key, i) => (
          <div
            key={key}
            className="hero__figure"
            style={{ '--i': i, animationDelay: `${i * 2.6}s` }}
          >
            <DressVector dressKey={key} uid={`${uid}-${i}`} />
          </div>
        ))}
      </div>

      <div className="hero__scrim" aria-hidden="true" />

      {/* ── Copy ───────────────────────────────────────────────────── */}
      <div className="hero__content">
        <p className="eyebrow eyebrow--ruled">Autumn / Winter — Atelier No. 07</p>

        <h1 className="hero__title">
          <span className="hero__line">Worn</span>
          <span className="hero__line hero__line--italic">before</span>
          <span className="hero__line">it is</span>
          <span className="hero__line hero__line--gold">yours.</span>
        </h1>

        <p className="hero__lede">
          Seven ateliers. One private room. Step into the AURA live dressing
          studio and watch couture settle onto your own silhouette in real time.
        </p>

        <div className="hero__cta">
          <button className="btn btn--gold btn--lg" onClick={onOpenTryOn}>
            <IconCamera width={18} height={18} />
            Try On Live
          </button>
          <button className="btn btn--ghost-light btn--lg" onClick={onBrowse}>
            Explore the collection
            <IconArrowRight width={17} height={17} />
          </button>
        </div>

        <dl className="hero__stats">
          {[
            ['07', 'Atelier partners'],
            ['4.2K', 'Hand-set crystals'],
            ['48h', 'Atelier dispatch'],
          ].map(([n, l]) => (
            <div key={l}>
              <dt>{l}</dt>
              <dd>{n}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
