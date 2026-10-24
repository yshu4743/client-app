import { DressVector } from '../assets/dresses/DressRegistry.jsx';
import { nextUid, formatPrice } from '../lib/format.js';
import { IconArrowRight, IconCamera, IconSparkle, IconLock, IconCheck } from './Icons.jsx';
import { useRef } from 'react';
import './Sections.css';

/* ═══ Live-studio promo band ═══════════════════════════════════════════ */

export function StudioSection({ onOpenTryOn }) {
  const uid = useRef(nextUid('studio')).current;
  const SHOWCASE = ['gowned-sequin', 'charcoal-cape', 'champagne-ruffle'];

  return (
    <section className="section studio" id="tryon">
      <div className="shell studio__grid">
        <div className="studio__copy">
          <p className="eyebrow eyebrow--ruled">The live studio</p>
          <h2 className="section__title">
            See it on you
            <br />
            <span className="italic">before</span> it arrives
          </h2>
          <p className="lead studio__lede">
            Our dressing room uses your device camera and nothing else. Gowns are
            composited live, at whatever scale and position you set, so you can judge
            the drape the way you would in an atelier. Capture the result and keep it.
          </p>

          <ul className="studio__list">
            {[
              ['Live camera overlay', 'MediaDevices · no app, no upload'],
              ['Precision fitting', 'Scale, position and opacity controls'],
              ['Capture & share', 'Framed PNG, downloaded in a tap'],
            ].map(([t, s]) => (
              <li key={t}>
                <IconCheck width={15} height={15} />
                <span>
                  <strong>{t}</strong>
                  <em>{s}</em>
                </span>
              </li>
            ))}
          </ul>

          <div className="studio__cta">
            <button className="btn btn--gold btn--lg" onClick={onOpenTryOn}>
              <IconCamera width={18} height={18} />
              Enter the studio
            </button>
            <p className="studio__privacy">
              <IconLock width={13} height={13} />
              Video never leaves your device. Studio Mode works without a camera too.
            </p>
          </div>
        </div>

        <div className="studio__frames" aria-hidden="true">
          {SHOWCASE.map((key, i) => (
            <div
              key={key}
              className="studio__frame"
              style={{ '--i': i, animationDelay: `${i * 1.4}s` }}
            >
              <DressVector dressKey={key} uid={`${uid}-${i}`} />
              <span className="studio__frame-tag">
                {['Gilded Sequin Sheath', 'Charcoal Draped Cape', 'Champagne Ruffle'][
                  i
                ]}
              </span>
            </div>
          ))}
          <div className="studio__reticle" />
        </div>
      </div>
    </section>
  );
}

/* ═══ Maison / craft ═══════════════════════════════════════════════════ */

const PILLARS = [
  {
    n: '01',
    t: 'Cut by a single hand',
    d: 'No two AURA gowns come off the same cutter. Patterns are drafted, draped and closed by one artisan from first muslin to final stitch.',
  },
  {
    n: '02',
    t: 'Sourced within 200 km',
    d: 'Silk from Como, wool from Biella, crystal from the Swarovski Alps. Every atelier we work with sits within two hundred kilometres of its loom.',
  },
  {
    n: '03',
    t: 'Yours to keep, forever',
    d: 'Complimentary lifetime re-daping and re-sizing. A gown should outlive the season that made it famous.',
  },
];

export function MaisonSection() {
  return (
    <section className="section maison" id="maison">
      <div className="shell">
        <header className="maison__head">
          <p className="eyebrow eyebrow--ruled">The Maison</p>
          <h2 className="section__title maison__title">
            An atelier of <span className="italic">eight</span> dresses
            <br />
            and one stubborn idea
          </h2>
        </header>

        <div className="maison__pillars">
          {PILLARS.map((p) => (
            <article key={p.n} className="pillar">
              <span className="pillar__n">{p.n}</span>
              <h3 className="pillar__t">{p.t}</h3>
              <p className="pillar__d">{p.d}</p>
            </article>
          ))}
        </div>

        <div className="maison__foot">
          <p className="maison__quote">
            <IconSparkle width={16} height={16} />
            “Clothes should make an entrance before you do.”
          </p>
          <a className="btn" href="#collection">
            See the collection
            <IconArrowRight width={16} height={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══ Marquee / ethos ticker ═══════════════════════════════════════════ */

const TICKER = [
  'Hand-finished in Milan',
  'Complimentary alterations',
  'Sizes XS — XL',
  'Insured worldwide delivery',
  '30-day returns',
  'Made in limited runs',
  'Since 1998',
];

export function Ticker() {
  const row = [...TICKER, ...TICKER];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row.map((t, i) => (
          <span key={`${t}-${i}`}>
            {t}
            <i>◆</i>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══ Newsletter ══════════════════════════════════════════════════════ */

export function Newsletter() {
  return (
    <section className="section news">
      <div className="shell--narrow news__inner">
        <p className="eyebrow eyebrow--center">Private list</p>
        <h2 className="news__title">
          First sight of <span className="italic">every</span> collection
        </h2>
        <p className="news__sub">
          Seven letters a year, sent only when something is ready. No noise.
        </p>
        <form
          className="news__form"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.email;
            input.value = '';
            input.placeholder = 'Thank you — you are on the list.';
          }}
        >
          <label className="sr-only" htmlFor="news-email">
            Email address
          </label>
          <input
            id="news-email"
            className="input"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
          <button className="btn btn--primary" type="submit">
            Join
            <IconArrowRight width={16} height={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

export function PriceTag({ product }) {
  return <span>{formatPrice(product.price)}</span>;
}
