import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { DressVector } from '../assets/dresses/DressRegistry.jsx';
import { useLockBodyScroll, useFocusTrap } from '../lib/hooks.js';
import { cx, formatPrice, nextUid } from '../lib/format.js';
import {
  IconArrowRight,
  IconBag,
  IconCheck,
  IconClose,
  IconLock,
  IconMinus,
  IconPlus,
  IconTrash,
} from './Icons.jsx';
import './BagDrawer.css';

const FREE_SHIPPING_OVER = 500;

export default function BagDrawer({ open, onClose, onCheckout }) {
  const { lines, count, subtotal, savings, isEmpty, setQty, remove, clear } = useCart();
  const uid = useRef(nextUid('bag')).current;
  const panelRef = useRef(null);
  const [justAdded, setJustAdded] = useState(null);

  useLockBodyScroll(open);
  useFocusTrap(open, panelRef, onClose);

  /* Flash the row that just changed. */
  useEffect(() => {
    if (!lines.length) return;
    const t = setTimeout(() => setJustAdded(null), 900);
    return () => clearTimeout(t);
  }, [lines.length]);

  const progress = useMemo(
    () => Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100),
    [subtotal]
  );
  const toFree = Math.max(0, FREE_SHIPPING_OVER - subtotal);

  if (!open) return null;

  return (
    <div className="bag" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="bag__scrim" onClick={onClose} aria-hidden="true" />

      <aside className="bag__panel" ref={panelRef}>
        <header className="bag__head">
          <h2 className="bag__title">
            Your bag
            <span className="bag__count">{count}</span>
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close the shopping bag">
            <IconClose />
          </button>
        </header>

        {!isEmpty && (
          <div className="bag__ship">
            <p className="bag__ship-text">
              {toFree > 0 ? (
                <>
                  <strong>{formatPrice(toFree)}</strong> away from complimentary delivery
                </>
              ) : (
                <>
                  <IconCheck width={14} height={14} /> Complimentary delivery unlocked
                </>
              )}
            </p>
            <div className="bag__ship-bar">
              <span style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
          </div>
        )}

        {/* ── Lines ──────────────────────────────────────────────────── */}
        <div className="bag__list">
          {isEmpty ? (
            <div className="bag__empty">
              <span className="bag__empty-icon">
                <IconBag width={26} height={26} />
              </span>
              <h3>Your bag is empty</h3>
              <p>
                Begin with the collection — or open the live studio and let a gown
                find you.
              </p>
              <button className="btn btn--primary btn--sm" onClick={onClose}>
                Browse the collection
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <article
                key={line.key}
                className={cx('bagline', justAdded === line.key && 'is-new')}
                onAnimationEnd={() => setJustAdded(null)}
              >
                <div className="bagline__art" style={{ background: `${line.colorHex}1a` }}>
                  <DressVector dressKey={line.dressKey} uid={`${uid}-${line.key}`} />
                </div>

                <div className="bagline__info">
                  <p className="bagline__name">{line.name}</p>
                  <p className="bagline__meta">
                    Size {line.size} · {line.colorName}
                    {line.source === 'fitting-room' && (
                      <span className="bagline__tag">From the studio</span>
                    )}
                  </p>

                  <div className="bagline__controls">
                    <div className="qty" role="group" aria-label={`Quantity for ${line.name}`}>
                      <button
                        className="qty__btn"
                        onClick={() => setQty(line.key, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <IconMinus width={13} height={13} />
                      </button>
                      <span className="qty__val" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        className="qty__btn"
                        onClick={() => setQty(line.key, line.quantity + 1)}
                        disabled={line.quantity >= 10}
                        aria-label="Increase quantity"
                      >
                        <IconPlus width={13} height={13} />
                      </button>
                    </div>

                    <button
                      className="bagline__remove"
                      onClick={() => remove(line.key)}
                      aria-label={`Remove ${line.name} from the bag`}
                    >
                      <IconTrash width={14} height={14} />
                    </button>
                  </div>
                </div>

                <p className="bagline__price">
                  {formatPrice(line.price * line.quantity, line.currency)}
                  {line.quantity > 1 && (
                    <span>{formatPrice(line.price, line.currency)} each</span>
                  )}
                </p>
              </article>
            ))
          )}
        </div>

        {/* ── Summary ────────────────────────────────────────────────── */}
        {!isEmpty && (
          <footer className="bag__foot">
            <dl className="bag__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="bag__savings">
                  <dt>Atelier savings</dt>
                  <dd>−{formatPrice(savings)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery &amp; duties</dt>
                <dd>{subtotal >= FREE_SHIPPING_OVER ? 'Complimentary' : 'Calculated at checkout'}</dd>
              </div>
            </dl>

            <button
              className="btn btn--primary btn--lg btn--block"
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              Proceed to checkout
              <IconArrowRight width={17} height={17} />
            </button>

            <p className="bag__secure">
              <IconLock width={13} height={13} />
              Secure checkout · Alters &amp; returns within 30 days
            </p>

            <button className="btn btn--bare bag__clear" onClick={clear}>
              Empty the bag
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
