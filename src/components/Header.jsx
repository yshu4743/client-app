import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { cx } from '../lib/format.js';
import { IconBag, IconMenu, IconClose, IconSearch } from './Icons.jsx';
import './Header.css';

const LINKS = [
  { label: 'Collection', href: '#collection' },
  { label: 'Couture', href: '#collection', filter: 'couture' },
  { label: 'Bridal', href: '#collection', filter: 'bridal' },
  { label: 'The Maison', href: '#maison' },
  { label: 'Try On Live', href: '#tryon', accent: true },
];

export default function Header({ onOpenBag, onOpenTryOn, onJump }) {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Pulse the bag icon whenever an item lands in it. */
  useEffect(() => {
    if (!count) return undefined;
    setBump(true);
    const t = setTimeout(() => setBump(false), 700);
    return () => clearTimeout(t);
  }, [count]);

  const go = (e, link) => {
    if (link.accent) {
      e.preventDefault();
      onOpenTryOn();
      return;
    }
    if (link.filter) {
      e.preventDefault();
      onJump?.(link.filter);
      return;
    }
    setMenuOpen(false);
  };

  return (
    <header className={cx('hdr', scrolled && 'is-scrolled', menuOpen && 'is-menu')}>
      <div className="hdr__inner">
        <button
          className="icon-btn hdr__burger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        <a className="hdr__logo" href="#top" aria-label="AURA — home">
          <span className="hdr__mark">AURA</span>
          <span className="hdr__sub">Boutique</span>
        </a>

        <nav className="hdr__nav" aria-label="Primary">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={cx('hdr__link', l.accent && 'hdr__link--accent')}
              onClick={(e) => go(e, l)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hdr__actions">
          <a className="icon-btn hdr__search" href="#collection" aria-label="Search the collection">
            <IconSearch />
          </a>
          <button
            className={cx('icon-btn hdr__bag', bump && 'is-bump')}
            onClick={onOpenBag}
            aria-label={`Open shopping bag${count ? `, ${count} item${count === 1 ? '' : 's'}` : ', empty'}`}
          >
            <IconBag />
            {count > 0 && (
              <span className="hdr__count" aria-hidden="true">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer navigation */}
      <div
        id="mobile-nav"
        className={cx('hdr__panel', menuOpen && 'is-open')}
        hidden={!menuOpen}
      >
        <nav aria-label="Mobile">
          {LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              className="hdr__panel-link"
              style={{ transitionDelay: `${60 + i * 45}ms` }}
              onClick={(e) => go(e, l)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <p className="hdr__panel-note">
          Complimentary worldwide delivery on orders over $500.
        </p>
      </div>
    </header>
  );
}
