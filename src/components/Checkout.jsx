import { useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { DressVector } from '../assets/dresses/DressRegistry.jsx';
import { api, ApiRequestError } from '../api/client.js';
import { useLockBodyScroll } from '../lib/hooks.js';
import { cx, formatPrice, nextUid } from '../lib/format.js';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBag,
  IconCheck,
  IconLock,
  IconSparkle,
} from './Icons.jsx';
import './Checkout.css';

const STEPS = [
  { id: 1, label: 'Shipping' },
  { id: 2, label: 'Delivery & payment' },
  { id: 3, label: 'Review' },
];

const SHIPPING_METHODS = [
  { id: 'standard', label: 'Standard', note: '5–7 working days · Insured', cost: 0, freeOver: 500 },
  { id: 'express', label: 'Express', note: '2–3 working days · Insured', cost: 28 },
  { id: 'courier', label: 'Same-day courier', note: 'Within Manhattan, before 8pm', cost: 95 },
];

const PAYMENTS = [
  { id: 'card', label: 'Card', note: 'Visa · Mastercard · Amex' },
  { id: 'applepay', label: 'Apple Pay', note: 'One-tap checkout' },
  { id: 'paypal', label: 'PayPal', note: 'Buyer protection' },
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'France',
  'Italy',
  'Japan',
  'United Arab Emirates',
  'Canada',
  'Australia',
];

const TAX_RATE = 0.08;

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'United States',
  notes: '',
};

const REQUIRED = {
  1: ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'postalCode', 'country'],
};

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function validate(step, form) {
  const errors = {};
  (REQUIRED[step] || []).forEach((f) => {
    if (!String(form[f] || '').trim()) errors[f] = 'This field is required.';
  });
  if (form.email && !EMAIL_RX.test(form.email)) errors.email = 'Enter a valid email address.';
  if (form.postalCode && String(form.postalCode).trim().length < 3)
    errors.postalCode = 'Enter a valid postal code.';
  if (form.phone && !/^[\d\s()+-]{6,20}$/.test(form.phone))
    errors.phone = 'Enter a valid phone number.';
  return errors;
}

function luhn(num) {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 12) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export default function Checkout({ onExit, onBrowse }) {
  const uid = useRef(nextUid('co')).current;
  const { lines, subtotal, savings, isEmpty, clear } = useCart();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [order, setOrder] = useState(null);
  const summaryRef = useRef(null);

  useLockBodyScroll(true);

  const method = SHIPPING_METHODS.find((m) => m.id === shippingMethod) || SHIPPING_METHODS[0];

  const totals = useMemo(() => {
    const shippingCost =
      method.freeOver && subtotal >= method.freeOver ? 0 : method.cost;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
    return { subtotal, shippingCost, tax, total, savings };
  }, [subtotal, method, savings]);

  const set = (field) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const blur = (field) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    const next = validate(1, form);
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  };

  const goNext = () => {
    if (step === 1) {
      const next = validate(1, form);
      setErrors(next);
      if (Object.keys(next).length) {
        setTouched(Object.fromEntries(Object.keys(next).map((k) => [k, true])));
        const first = document.querySelector('.checkout [aria-invalid="true"]');
        first?.focus();
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }
    }
    if (step === 2 && payment === 'card') {
      const cardErrors = {};
      if (!luhn(card.number)) cardErrors.number = 'Enter a valid card number.';
      if (card.name.trim().length < 2) cardErrors.name = 'Name as it appears on the card.';
      if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(card.expiry.trim()))
        cardErrors.expiry = 'Use MM/YY.';
      if (!/^\d{3,4}$/.test(card.cvc.trim())) cardErrors.cvc = '3 or 4 digits.';
      if (Object.keys(cardErrors).length) {
        setCardErrors(cardErrors);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await api.createOrder({
        items: lines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity })),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        shipping: shippingMethod,
        payment,
        cardNumber: payment === 'card' ? card.number : '',
        notes: form.notes,
      });
      setOrder(res.order);
      clear();
    } catch (err) {
      setApiError(
        err instanceof ApiRequestError
          ? err.message
          : 'We could not complete the order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Confirmation ─────────────────────────────────────────────────── */
  if (order) {
    return (
      <div className="checkout checkout--done">
        <div className="shell--narrow">
          <div className="done">
            <span className="done__seal" aria-hidden="true">
              <IconCheck width={30} height={30} />
            </span>
            <p className="eyebrow eyebrow--center">Order confirmed</p>
            <h1 className="done__title">Thank you, {order.customer.firstName}.</h1>
            <p className="done__lede">
              Your order has been received by the atelier. A confirmation has been
              sent to <strong>{order.customer.email}</strong>.
            </p>

            <dl className="done__grid">
              <div>
                <dt>Order number</dt>
                <dd className="done__order">{order.orderNumber}</dd>
              </div>
              <div>
                <dt>Total paid</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd className="done__cap">{order.shipping}</dd>
              </div>
              <div>
                <dt>Ships to</dt>
                <dd className="done__cap">
                  {order.customer.city}, {order.customer.country}
                </dd>
              </div>
            </dl>

            <ul className="done__lines">
              {order.items.map((item) => (
                <li key={`${item.product}-${item.size}`}>
                  <span className="done__art">
                    <DressVector dressKey={item.dressKey} uid={`${uid}-${item.product}`} />
                  </span>
                  <span className="done__info">
                    <span className="done__name">{item.name}</span>
                    <span className="done__meta">
                      Size {item.size} · Qty {item.quantity}
                    </span>
                  </span>
                  <span className="done__price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="done__actions">
              <button className="btn btn--primary" onClick={onBrowse}>
                Return to the collection
                <IconArrowRight width={16} height={16} />
              </button>
              <button className="btn" onClick={onExit}>
                <IconBag width={16} height={16} />
                Visit the live studio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Guard: nothing to check out ──────────────────────────────────── */
  if (isEmpty) {
    return (
      <div className="checkout">
        <div className="shell--narrow">
          <div className="done">
            <span className="done__seal" aria-hidden="true">
              <IconBag width={28} height={28} />
            </span>
            <h1 className="done__title">Your bag is empty.</h1>
            <p className="done__lede">
              Choose a gown from the collection, or open the live studio to try one on
              before deciding.
            </p>
            <div className="done__actions">
              <button className="btn btn--primary" onClick={onBrowse}>
                Browse the collection
                <IconArrowRight width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Field = ({ name, label, type = 'text', placeholder, autoComplete, span }) => {
    const invalid = Boolean(touched[name] && errors[name]);
    return (
      <div className={cx('field', span && 'field--full')}>
        <label className="field__label" htmlFor={`co-${name}`}>
          {label}
        </label>
        <input
          id={`co-${name}`}
          className="input"
          type={type}
          value={form[name]}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `co-${name}-err` : undefined}
          onChange={set(name)}
          onBlur={blur(name)}
        />
        {invalid && (
          <p className="field__error" id={`co-${name}-err`}>
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="checkout">
      <div className="checkout__head">
        <button className="btn btn--bare" onClick={onExit}>
          <IconArrowLeft width={16} height={16} />
          Back to the boutique
        </button>
        <p className="checkout__secure">
          <IconLock width={13} height={13} /> Secure checkout
        </p>
      </div>

      <div className="shell--narrow">
        {/* ── Progress ─────────────────────────────────────────────── */}
        <ol className="steps" aria-label="Checkout progress">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={cx(
                'steps__item',
                step === s.id && 'is-current',
                step > s.id && 'is-done'
              )}
              aria-current={step === s.id ? 'step' : undefined}
            >
              <span className="steps__dot">
                {step > s.id ? <IconCheck width={12} height={12} /> : s.id}
              </span>
              <span className="steps__label">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="checkout__grid">
          {/* ── Form column ─────────────────────────────────────────── */}
          <div className="checkout__main">
            {/* Step 1 — Shipping */}
            {step === 1 && (
              <section className="checkout__section" aria-labelledby="co-s1">
                <h1 className="checkout__title" id="co-s1">
                  Where shall we send it?
                </h1>
                <p className="checkout__sub">
                  Every order is finished by hand and dispatched within 48 hours.
                </p>

                <div className="checkout__fields">
                  <Field name="firstName" label="First name" autoComplete="given-name" />
                  <Field name="lastName" label="Last name" autoComplete="family-name" />
                  <Field
                    name="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    span
                  />
                  <Field
                    name="phone"
                    label="Phone (optional)"
                    type="tel"
                    autoComplete="tel"
                    span
                  />
                  <Field
                    name="address1"
                    label="Address"
                    autoComplete="address-line1"
                    span
                  />
                  <Field
                    name="address2"
                    label="Apartment, suite (optional)"
                    autoComplete="address-line2"
                    span
                  />
                  <Field name="city" label="City" autoComplete="address-level2" />
                  <Field name="state" label="State / Region" autoComplete="address-level1" />
                  <Field
                    name="postalCode"
                    label="Postal code"
                    autoComplete="postal-code"
                  />
                  <div className="field">
                    <label className="field__label" htmlFor="co-country">
                      Country
                    </label>
                    <select
                      id="co-country"
                      className="select"
                      value={form.country}
                      onChange={set('country')}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field field--full">
                    <label className="field__label" htmlFor="co-notes">
                      Delivery notes (optional)
                    </label>
                    <textarea
                      id="co-notes"
                      className="textarea"
                      value={form.notes}
                      maxLength={500}
                      placeholder="Gift wrapping, concierge instructions…"
                      onChange={set('notes')}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Step 2 — Delivery & payment */}
            {step === 2 && (
              <section className="checkout__section" aria-labelledby="co-s2">
                <h1 className="checkout__title" id="co-s2">
                  Delivery &amp; payment
                </h1>
                <p className="checkout__sub">
                  All shipments are insured, signature-required and trackable.
                </p>

                <fieldset className="options">
                  <legend className="options__legend">Delivery method</legend>
                  {SHIPPING_METHODS.map((m) => {
                    const free = m.freeOver && subtotal >= m.freeOver;
                    return (
                      <label
                        key={m.id}
                        className={cx('option', shippingMethod === m.id && 'is-on')}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={m.id}
                          checked={shippingMethod === m.id}
                          onChange={() => setShippingMethod(m.id)}
                        />
                        <span className="option__dot" aria-hidden="true" />
                        <span className="option__body">
                          <span className="option__label">{m.label}</span>
                          <span className="option__note">{m.note}</span>
                        </span>
                        <span className="option__price">
                          {free || m.cost === 0 ? 'Complimentary' : formatPrice(m.cost)}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>

                <fieldset className="options">
                  <legend className="options__legend">Payment</legend>
                  {PAYMENTS.map((p) => (
                    <label
                      key={p.id}
                      className={cx('option', payment === p.id && 'is-on')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={p.id}
                        checked={payment === p.id}
                        onChange={() => setPayment(p.id)}
                      />
                      <span className="option__dot" aria-hidden="true" />
                      <span className="option__body">
                        <span className="option__label">{p.label}</span>
                        <span className="option__note">{p.note}</span>
                      </span>
                    </label>
                  ))}
                </fieldset>

                {payment === 'card' && (
                  <div className="cardbox">
                    <div className="field field--full">
                      <label className="field__label" htmlFor="co-card">
                        Card number
                      </label>
                      <input
                        id="co-card"
                        className="input"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                        aria-invalid={cardErrors.number ? true : undefined}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            number: e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 19)
                              .replace(/(.{4})/g, '$1 ')
                              .trim(),
                          }))
                        }
                        onBlur={() =>
                          setCardErrors((p) => ({ ...p, number: luhn(card.number) ? '' : p.number }))
                        }
                      />
                      {cardErrors.number && (
                        <p className="field__error">{cardErrors.number}</p>
                      )}
                    </div>
                    <div className="field field--full">
                      <label className="field__label" htmlFor="co-cardname">
                        Name on card
                      </label>
                      <input
                        id="co-cardname"
                        className="input"
                        autoComplete="cc-name"
                        value={card.name}
                        aria-invalid={cardErrors.name ? true : undefined}
                        onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                      />
                      {cardErrors.name && <p className="field__error">{cardErrors.name}</p>}
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="co-exp">
                        Expiry
                      </label>
                      <input
                        id="co-exp"
                        className="input"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={card.expiry}
                        aria-invalid={cardErrors.expiry ? true : undefined}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCard((c) => ({
                            ...c,
                            expiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v,
                          }));
                        }}
                      />
                      {cardErrors.expiry && <p className="field__error">{cardErrors.expiry}</p>}
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="co-cvc">
                        CVC
                      </label>
                      <input
                        id="co-cvc"
                        className="input"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        value={card.cvc}
                        aria-invalid={cardErrors.cvc ? true : undefined}
                        onChange={(e) =>
                          setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                        }
                      />
                      {cardErrors.cvc && <p className="field__error">{cardErrors.cvc}</p>}
                    </div>
                    <p className="cardbox__note">
                      <IconSparkle width={13} height={13} />
                      Demonstration only — use <strong>4242 4242 4242 4242</strong>. No
                      card is ever charged and no data leaves your browser.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <section className="checkout__section" aria-labelledby="co-s3">
                <h1 className="checkout__title" id="co-s3">
                  Review your order
                </h1>
                <p className="checkout__sub">
                  One last look before the atelier begins work.
                </p>

                {apiError && (
                  <p className="checkout__alert" role="alert">
                    {apiError}
                  </p>
                )}

                <div className="review">
                  <div className="review__block">
                    <div className="review__head">
                      <h3>Shipping to</h3>
                      <button className="btn btn--bare" onClick={() => setStep(1)}>
                        Edit
                      </button>
                    </div>
                    <address className="review__addr">
                      {form.firstName} {form.lastName}
                      <br />
                      {form.address1}
                      {form.address2 && (
                        <>
                          <br />
                          {form.address2}
                        </>
                      )}
                      <br />
                      {form.city}, {form.state} {form.postalCode}
                      <br />
                      {form.country}
                      <br />
                      {form.email}
                    </address>
                  </div>

                  <div className="review__block">
                    <div className="review__head">
                      <h3>Delivery &amp; payment</h3>
                      <button className="btn btn--bare" onClick={() => setStep(2)}>
                        Edit
                      </button>
                    </div>
                    <p className="review__text">
                      {method.label} — {method.note}
                      <br />
                      {PAYMENTS.find((p) => p.id === payment)?.label}
                      {payment === 'card' && card.number && ` ending ${card.number.slice(-4)}`}
                    </p>
                  </div>

                  <div className="review__block">
                    <div className="review__head">
                      <h3>Items ({lines.length})</h3>
                    </div>
                    <ul className="review__lines">
                      {lines.map((l) => (
                        <li key={l.key}>
                          <span className="review__art">
                            <DressVector dressKey={l.dressKey} uid={`${uid}-${l.key}`} />
                          </span>
                          <span className="review__info">
                            <span className="review__name">{l.name}</span>
                            <span className="review__meta">
                              Size {l.size} · Qty {l.quantity} · {l.colorName}
                            </span>
                          </span>
                          <span className="review__price">
                            {formatPrice(l.price * l.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* ── Nav ────────────────────────────────────────────────── */}
            <div className="checkout__nav">
              {step > 1 ? (
                <button className="btn" onClick={goBack} disabled={submitting}>
                  <IconArrowLeft width={16} height={16} />
                  Back
                </button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <button className="btn btn--primary" onClick={goNext}>
                  Continue
                  <IconArrowRight width={16} height={16} />
                </button>
              ) : (
                <button
                  className="btn btn--primary btn--lg"
                  onClick={placeOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" />
                      Placing your order…
                    </>
                  ) : (
                    <>
                      <IconLock width={16} height={16} />
                      Pay {formatPrice(totals.total)}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── Order summary ─────────────────────────────────────────── */}
          <aside className="summary" ref={summaryRef} aria-label="Order summary">
            <h2 className="summary__title">Order summary</h2>

            <ul className="summary__lines">
              {lines.map((l) => (
                <li key={l.key}>
                  <span className="summary__art">
                    <DressVector dressKey={l.dressKey} uid={`${uid}-s${l.key}`} />
                    <span className="summary__qty">{l.quantity}</span>
                  </span>
                  <span className="summary__info">
                    <span className="summary__name">{l.name}</span>
                    <span className="summary__meta">Size {l.size}</span>
                  </span>
                  <span className="summary__price">
                    {formatPrice(l.price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="summary__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              {totals.savings > 0 && (
                <div className="summary__savings">
                  <dt>Atelier savings</dt>
                  <dd>−{formatPrice(totals.savings)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery</dt>
                <dd>
                  {totals.shippingCost === 0
                    ? 'Complimentary'
                    : formatPrice(totals.shippingCost)}
                </dd>
              </div>
              <div>
                <dt>Estimated duties &amp; tax</dt>
                <dd>{formatPrice(totals.tax)}</dd>
              </div>
              <div className="summary__grand">
                <dt>Total</dt>
                <dd>{formatPrice(totals.total)}</dd>
              </div>
            </dl>

            <p className="summary__note">
              Complimentary alterations are included. Returns are accepted within
              30 days of delivery.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
