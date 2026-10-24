import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { readJSON, writeJSON } from '../lib/format.js';

const STORAGE_KEY = 'aura.bag.v1';
const MAX_QTY = 10;

const CartContext = createContext(null);

const defaultState = { lines: [], lastAdded: null };

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload };

    case 'add': {
      const { product, size, quantity = 1, source = 'catalog' } = action;
      if (!product) return state;
      const chosen = size || product.sizes?.[Math.floor((product.sizes?.length || 1) / 2)] || 'M';
      const key = `${product._id}::${chosen}`;
      const existing = state.lines.find((l) => l.key === key);

      const lines = existing
        ? state.lines.map((l) =>
            l.key === key
              ? { ...l, quantity: Math.min(l.quantity + quantity, MAX_QTY) }
              : l
          )
        : [
            ...state.lines,
            {
              key,
              productId: product._id,
              name: product.name,
              slug: product.slug,
              dressKey: product.dressKey,
              colorName: product.colorName,
              colorHex: product.colorHex,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              currency: product.currency || 'USD',
              size: chosen,
              quantity: Math.min(quantity, MAX_QTY),
              source,
            },
          ];

      return { ...state, lines, lastAdded: { key, at: Date.now() } };
    }

    case 'setQty': {
      const qty = Math.max(0, Math.min(action.quantity, MAX_QTY));
      if (qty === 0)
        return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
      return {
        ...state,
        lines: state.lines.map((l) => (l.key === action.key ? { ...l, quantity: qty } : l)),
      };
    }

    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };

    case 'clear':
      return { ...defaultState, lines: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState, (init) => ({
    ...init,
    lines: readJSON(STORAGE_KEY, []),
  }));

  const persist = useCallback((lines) => writeJSON(STORAGE_KEY, lines), []);

  useEffect(() => {
    persist(state.lines);
  }, [state.lines, persist]);

  const value = useMemo(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = state.lines.reduce((n, l) => n + l.price * l.quantity, 0);
    const savings = state.lines.reduce(
      (n, l) => n + (l.compareAtPrice ? (l.compareAtPrice - l.price) * l.quantity : 0),
      0
    );
    const currency = state.lines[0]?.currency || 'USD';

    return {
      lines: state.lines,
      lastAdded: state.lastAdded,
      count,
      subtotal,
      savings,
      currency,
      isEmpty: state.lines.length === 0,
      maxQty: MAX_QTY,
      addItem: (product, size, opts) => dispatch({ type: 'add', product, size, ...opts }),
      setQty: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
      has: (productId, size) =>
        state.lines.some((l) => l.productId === productId && l.size === size),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
