import { useEffect, useRef, useState } from 'react';
import { DressVector } from '../assets/dresses/DressRegistry.jsx';
import { FigureSilhouette } from '../assets/figure/FigureSilhouette.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useLockBodyScroll, useFocusTrap } from '../lib/hooks.js';
import { cx, formatPrice, nextUid } from '../lib/format.js';
import {
  IconBag,
  IconCamera,
  IconCheck,
  IconClose,
  IconStar,
} from './Icons.jsx';
import './ProductDetail.css';

export default function ProductDetail({ product, onClose, onTryOn }) {
  const uid = useRef(nextUid('pd')).current;
  const ref = useRef(null);
  const { addItem, has } = useCart();
  const [size, setSize] = useState(product.sizes?.[2] || product.sizes?.[0] || 'M');
  const [added, setAdded] = useState(false);

  useLockBodyScroll(true);
  useFocusTrap(true, ref, onClose);

  useEffect(() => {
    setSize(product.sizes?.[2] || product.sizes?.[0] || 'M');
    setAdded(false);
  }, [product]);

  if (!product) return null;

  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const inBag = has(product._id, size);

  const add = () => {
    addItem(product, size, { quantity: 1, source: 'detail' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pd" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="pd__scrim" onClick={onClose} aria-hidden="true" />

      <div className="pd__panel" ref={ref}>
        <button className="icon-btn pd__close" onClick={onClose} aria-label="Close">
          <IconClose />
        </button>

        <div className="pd__media">
          <span className="pd__vignette" aria-hidden="true" />
          <span className="pd__figure" aria-hidden="true">
            <FigureSilhouette uid={`${uid}-f`} tone="stone" />
          </span>
          <span className="pd__gown" aria-hidden="true">
            <DressVector dressKey={product.dressKey} uid={`${uid}-d`} />
          </span>
          <span className="pd__mediatag">
            {product.line} · {product.atelier}
          </span>
        </div>

        <div className="pd__body">
          <p className="eyebrow eyebrow--ruled">{product.category}</p>
          <h2 className="pd__title">{product.name}</h2>
          <p className="pd__tagline">{product.tagline}</p>

          <div className="pd__pricerow">
            <p className="pd__price">
              {formatPrice(product.price, product.currency)}
              {onSale && <s>{formatPrice(product.compareAtPrice)}</s>}
            </p>
            <p className="pd__rating">
              <IconStar filled width={14} height={14} />
              {product.rating}
              <span>({product.reviewCount} reviews)</span>
            </p>
          </div>

          <p className="pd__desc">{product.description}</p>

          <dl className="pd__specs">
            {[
              ['Fabric', product.fabric],
              ['Colour', product.colorName],
              ['Atelier', product.atelier],
              ['Collection', product.line],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="pd__sizes">
            <p className="pd__sizelabel">
              Size <span className="req">*</span>
              <button className="btn btn--bare pd__guide">Size guide</button>
            </p>
            <div className="pd__sizegrid" role="radiogroup" aria-label="Select a size">
              {product.sizes?.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  className={cx('fr__size', 'pd__size', size === s && 'is-on')}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pd__actions">
            <button className={cx('btn btn--primary', added && 'is-added')} onClick={add}>
              {added ? (
                <>
                  <IconCheck width={16} height={16} />
                  In your bag
                </>
              ) : inBag ? (
                <>
                  <IconBag width={16} height={16} />
                  Add another
                </>
              ) : (
                <>
                  <IconBag width={16} height={16} />
                  Add to bag
                </>
              )}
            </button>
            <button className="btn btn--gold" onClick={() => onTryOn(product)}>
              <IconCamera width={16} height={16} />
              Virtual Try-On
            </button>
          </div>

          <ul className="pd__perks">
            <li>Complimentary worldwide delivery over $500</li>
            <li>Fit &amp; alteration service included</li>
            <li>30-day returns, collected from your door</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
