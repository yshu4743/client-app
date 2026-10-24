const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiRequestError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiRequestError(
      'Cannot reach the atelier service. Check that the API is running.',
      0
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiRequestError(
      payload?.error || `Request failed (${res.status})`,
      res.status,
      payload?.details
    );
  }
  return payload;
}

const qs = (params) => {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const api = {
  health: () => request('/health'),
  listProducts: (params, signal) => request(`/products${qs(params)}`, { signal }),
  productMeta: (signal) => request('/products/meta', { signal }),
  getProduct: (slug, signal) => request(`/products/${slug}`, { signal }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  getOrder: (num) => request(`/orders/${num}`),
};
