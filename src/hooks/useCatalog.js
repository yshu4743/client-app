import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const FALLBACK = [
  {
    _id: 'local-noir-bias-slip-gown',
    name: 'Noir Bias Slip Gown',
    slug: 'noir-bias-slip-gown',
    tagline: 'Liquid silk, cut on the bias',
    description: 'A floor-skimming bias gown in 19-momme silk charmeuse.',
    price: 1280,
    compareAtPrice: null,
    category: 'evening',
    line: 'Midnight Atelier',
    dressKey: 'noir-slip',
    fabric: 'Silk charmeuse',
    atelier: 'Milan',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colorName: 'Onyx',
    colorHex: '#141414',
    featured: true,
    inStock: true,
    rating: 4.9,
    reviewCount: 214,
    badges: ['Bestseller'],
  },
];

/**
 * Loads the catalogue from the API, with a graceful offline fallback so the
 * storefront never renders blank.
 */
export function useCatalog() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        const [list, m] = await Promise.all([
          api.listProducts({ limit: 100 }, ac.signal),
          api.productMeta(ac.signal).catch(() => null),
        ]);
        if (!alive) return;
        setProducts(list.items);
        setMeta(m);
        setOffline(false);
        setState('ready');
      } catch (err) {
        if (!alive || err.name === 'AbortError') return;
        setError(err);
        setProducts(FALLBACK);
        setOffline(true);
        setState('ready');
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, []);

  return { products, meta, state, error, offline };
}

/** Client-side search / filter / sort over the loaded catalogue. */
export function useCatalogFilter(products) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return [p.name, p.tagline, p.fabric, p.line, p.colorName, p.atelier]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });

    const sorters = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    list = [...list].sort(sorters[sort] || sorters.featured);
    return list;
  }, [products, query, category, sort]);

  return { query, setQuery, category, setCategory, sort, setSort, filtered };
}
