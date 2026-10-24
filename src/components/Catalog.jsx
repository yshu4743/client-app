import { useMemo } from 'react';
import ProductCard from './ProductCard.jsx';
import { cx, plural } from '../lib/format.js';
import { IconSearch, IconGrid, IconCamera, IconSparkle } from './Icons.jsx';
import './Catalog.css';

const CATEGORIES = [
  ['all', 'Everything'],
  ['evening', 'Evening'],
  ['occasion', 'Occasion'],
  ['bridal', 'Bridal'],
  ['daywear', 'Daywear'],
  ['couture', 'Couture'],
];

const SORTS = [
  ['featured', 'Featured'],
  ['price-asc', 'Price · low to high'],
  ['price-desc', 'Price · high to low'],
  ['rating', 'Best rated'],
  ['name', 'Alphabetical'],
];

export default function Catalog({ products, filter, onOpenTryOn, onOpenDetail, onShopCouture }) {
  const { query, setQuery, category, setCategory, sort, setSort, filtered } = filter;

  const counts = useMemo(() => {
    const map = { all: products.length };
    products.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [products]);

  return (
    <section className="section catalog" id="collection">
      <div className="shell">
        <header className="section__head">
          <div>
            <p className="eyebrow eyebrow--ruled">The Collection</p>
            <h2 className="section__title">Curated for the evening</h2>
            <p className="section__sub">
              Eight pieces, each cut in a single atelier. Open the dressing room
              on any gown to see it on your own silhouette before you commit.
            </p>
          </div>
          <button className="btn btn--primary" onClick={onShopCouture}>
            <IconSparkle width={16} height={16} />
            Open live studio
          </button>
        </header>

        {/* ── Filter rail ──────────────────────────────────────────── */}
        <div className="catalog__rail">
          <div className="catalog__search">
            <IconSearch width={16} height={16} />
            <input
              className="catalog__search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search silk, velvet, atelier…"
              aria-label="Search the collection"
            />
          </div>

          <div className="catalog__chips" role="group" aria-label="Filter by category">
            {CATEGORIES.map(([key, label]) => (
              <button
                key={key}
                className={cx('chip', category === key && 'is-active')}
                aria-pressed={category === key}
                onClick={() => setCategory(key)}
              >
                {label}
                {counts[key] ? <span className="chip--count">{counts[key]}</span> : null}
              </button>
            ))}
          </div>

          <label className="catalog__sort">
            <span className="sr-only">Sort the collection</span>
            <select
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORTS.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="catalog__count" aria-live="polite">
          <IconGrid width={14} height={14} />
          {plural(filtered.length, 'piece')} shown
        </p>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="catalog__grid">
            {filtered.map((p, i) => (
              <ProductCard
                key={p._id}
                product={p}
                index={i}
                onTryOn={onOpenTryOn}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        ) : (
          <div className="catalog__empty">
            <IconCamera width={26} height={26} />
            <h3>Nothing in this edit</h3>
            <p>Try a different category, or clear the search to see all eight gowns.</p>
            <button
              className="btn btn--sm"
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
