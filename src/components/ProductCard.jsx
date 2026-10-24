import { useRef, useState } from 'react';
import { DressVector } from '../assets/dresses/DressRegistry.jsx';
import { FigureSilhouette } from '../assets/figure/FigureSilhouette.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cx, formatPrice, nextUid } from '../lib/format.js';
import { IconCamera, IconBag, IconCheck, IconPlus, IconStar } from './Icons.jsx';
import './ProductCard.css';

export default function ProductCard({ product, index = 0, onTryOn, onOpenDetail }) {
  const uid = useRef(nextUid('card')).current;
  const { addItem, has } = useCart();
  const [size, setSize] = useState(product.sizes?.[2] || product.sizes?.[0] || 'M');
  const [added, setAdded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const inBag = has(product._id, size);

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product, size, { quantity: 1, source: 'catalog' });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article
      className={cx('pcard', revealed && 'is-revealed')}
      style={{ '--delay': `${Math.min(index, 8) * 70}ms` }}
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
    >
      {/* ── Editorial image: figure + gown, generated in-browser ────── */}
      <div className="pcard__media">
        <span className="pcard__frame">
          <span className="pcard__vignette" aria-hidden="true" />
          <span className="pcard__figure" aria-hidden="true">
            <FigureSilhouette uid={`${uid}-f`} tone="stone" />
          </span>
          <span className="pcard__gown" aria-hidden="true">
            <DressVector dressKey={product.dressKey} uid={`${uid}-d`} />
          </span>
          <span className="pcard__sheen" aria-hidden="true" />
        </span>

        <span className="pcard__badges">
          {product.badges?.slice(0, 2).map((b) => (
            <span
              key={b}
              className={cx(
                'badge',
                b === 'Sale' || b === 'Limited' ? 'badge--sale' : 'badge--soft'
              )}
            >
              {b}
            </span>
          ))}
        </span>

        {/* Stretched quick-view trigger, kept beneath the Try-On control. */}
        <button
          type="button"
          className="pcard__quickview"
          onClick={() => onOpenDetail?.(product)}
          aria-label={`View details for ${product.name}`}
          tabIndex={-1}
        />

        {/* The interactive Virtual Try-On control */}
        <div className="pcard__tryon">
          <button
            type="button"
            className="btn btn--gold btn--sm pcard__tryon-btn"
            onClick={() => onTryOn?.(product)}
            aria-label={`Virtual try-on: ${product.name}`}
          >
            <IconCamera width={15} height={15} />
            Virtual Try-On
          </button>
        </div>
      </div>

      {/* ── Details ─────────────────────────────────────────────────── */}
      <div className="pcard__body">
        <p className="pcard__line">
          {product.line} <span aria-hidden="true">·</span> {product.atelier}
        </p>
        <h3 className="pcard__name">
          <button onClick={() => onOpenDetail?.(product)}>{product.name}</button>
        </h3>
        <p className="pcard__tagline">{product.tagline}</p>

        <div className="pcard__meta">
          <p className="pcard__price">
            <span>{formatPrice(product.price, product.currency)}</span>
            {onSale && (
              <s className="pcard__was">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
          <p className="pcard__rating" aria-label={`Rated ${product.rating} out of 5`}>
            <IconStar filled width={13} height={13} />
            {product.rating}
            <span className="pcard__reviews">({product.reviewCount})</span>
          </p>
        </div>

        <div className="pcard__swatches" aria-hidden="true">
          <span className="pcard__swatch" style={{ background: product.colorHex }} />
          <span className="pcard__color">{product.colorName}</span>
          <span className="pcard__fabric">{product.fabric}</span>
        </div>

        <div className="pcard__actions">
          <label className="pcard__sizes">
            <span className="sr-only">Size for {product.name}</span>
            <select
              className="select pcard__size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {product.sizes?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <button
            className={cx('btn btn--sm pcard__add', added && 'is-added')}
            onClick={handleAdd}
          >
            {added ? (
              <>
                <IconCheck width={15} height={15} />
                In bag
              </>
            ) : inBag ? (
              <>
                <IconPlus width={15} height={15} />
                Add another
              </>
            ) : (
              <>
                <IconBag width={15} height={15} />
                Add to bag
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
