import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DressVector, DRESS_FRAME } from '../assets/dresses/DressRegistry.jsx';
import { FigureSilhouette } from '../assets/figure/FigureSilhouette.jsx';
import { useCamera } from '../lib/useCamera.js';
import { useElementSize, useLockBodyScroll, useFocusTrap } from '../lib/hooks.js';
import { useCart } from '../context/CartContext.jsx';
import { cx, formatPrice, nextUid } from '../lib/format.js';
import {
  IconAlert,
  IconArrowLeft,
  IconBag,
  IconCamera,
  IconCheck,
  IconClose,
  IconDownload,
  IconFlip,
  IconReset,
  IconShare,
  IconShutter,
  IconSliders,
  IconSparkle,
  IconSwitchCam,
} from './Icons.jsx';
import './FittingRoom.css';

/* ── Fit model ──────────────────────────────────────────────────────── */

const DEFAULTS = { scale: 1, x: 0, y: 0, anchor: 0.3, opacity: 1 };

/** Where the gown's shoulder line should sit, as a fraction of stage height. */
const ANCHOR_PCT = 0.3;

const PRESETS = [
  { key: 'auto', label: 'Balanced', fit: { scale: 1, x: 0, y: 0 } },
  { key: 'petite', label: 'Petite', fit: { scale: 0.82, x: 0, y: 4 } },
  { key: 'tall', label: 'Tall', fit: { scale: 1.12, x: 0, y: -6 } },
  { key: 'curve', label: 'Curvy', fit: { scale: 1.1, x: 0, y: -2 } },
  { key: 'closeup', label: 'Bust shot', fit: { scale: 1.45, x: 0, y: -12 } },
];

const SLIDERS = [
  { key: 'scale', label: 'Size on body', min: 0.55, max: 1.7, step: 0.01, unit: '×' },
  { key: 'x', label: 'Horizontal', min: -180, max: 180, step: 1, unit: 'px' },
  { key: 'y', label: 'Vertical', min: -240, max: 240, step: 1, unit: 'px' },
];

/**
 * Converts the fit model + stage size into absolute pixel geometry.
 * The exact same numbers drive both the on-screen overlay and the
 * canvas snapshot, so what you see is precisely what you export.
 */
function layerBox(stage, fit, { baseW, baseH, baseAnchor }) {
  const w = baseW * fit.scale;
  const h = baseH * fit.scale;
  return {
    left: stage.width / 2 - w / 2 + fit.x,
    top: stage.height * baseAnchor + fit.y,
    width: w,
    height: h,
  };
}

const asStyle = (b) => ({
  left: `${b.left}px`,
  top: `${b.top}px`,
  width: `${b.width}px`,
  height: `${b.height}px`,
});

/* ── Component ──────────────────────────────────────────────────────── */

export default function FittingRoom({ products, initial, onClose, onOpenBag }) {
  const uid = useRef(nextUid('fr')).current;

  const [activeId, setActiveId] = useState(initial?._id ?? products[0]?._id);
  const [fit, setFit] = useState(DEFAULTS);
  const [activePreset, setActivePreset] = useState('auto');
  const [size, setSize] = useState(
    initial?.sizes?.[2] || initial?.sizes?.[0] || 'M'
  );
  const [mode, setMode] = useState('prompt'); // prompt | studio
  const [showFit, setShowFit] = useState(false);
  const [shot, setShot] = useState(null); // { dataUrl, product }
  const [toast, setToast] = useState(null);
  const [flash, setFlash] = useState(false);
  const [added, setAdded] = useState(false);

  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const figureRef = useRef(null);
  const dialogRef = useRef(null);

  const [stage] = useElementSize(stageRef, [mode]);
  const camera = useCamera({ facingMode: 'user' });
  const { addItem } = useCart();

  const product = useMemo(
    () => products.find((p) => p._id === activeId) || products[0],
    [products, activeId]
  );

  const isLive = camera.status === 'live' && mode !== 'studio';
  const usingStudio = mode === 'studio';

  useLockBodyScroll(true);
  useFocusTrap(true, dialogRef, onClose);

  /* ── Camera lifecycle ─────────────────────────────────────────────── */

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isLive && camera.stream) {
      v.srcObject = camera.stream;
      v.play?.().catch(() => {
        /* autoplay policies — muted + playsinline should prevent this */
      });
    } else {
      v.srcObject = null;
    }
  }, [isLive, camera.stream]);

  /* Ask the moment the studio opens, unless the visitor chose Studio Mode. */
  useEffect(() => {
    if (mode === 'prompt' && camera.status === 'idle') camera.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode === 'studio') camera.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => () => camera.stop(), [camera.stop]);

  /* Selecting a different gown while the room is open. */
  const selectProduct = useCallback((p) => {
    setActiveId(p._id);
    if (p.sizes?.length && !p.sizes.includes(size)) {
      setSize(p.sizes[Math.floor(p.sizes.length / 2)]);
    }
  }, [size]);

  /* ── Fit controls ─────────────────────────────────────────────────── */

  const setSlider = (key, value) => {
    setActivePreset('custom');
    setFit((f) => ({ ...f, [key]: value }));
  };

  const applyPreset = (p) => {
    setActivePreset(p.key);
    setFit({ ...DEFAULTS, ...p.fit });
  };

  const reset = () => applyPreset(PRESETS[0]);

  /* ── Geometry ─────────────────────────────────────────────────────── */

  const overlayBox = useMemo(
    () =>
      layerBox(stage, fit, {
        baseW: DRESS_FRAME.baseWidth,
        baseH: DRESS_FRAME.baseHeight,
        baseAnchor: ANCHOR_PCT,
      }),
    [stage, fit]
  );

  const figureBox = useMemo(
    () =>
      layerBox(
        stage,
        { scale: fit.scale * 0.94, x: fit.x, y: fit.y - 8 },
        {
          baseW: DRESS_FRAME.baseWidth,
          baseH: DRESS_FRAME.baseHeight,
          baseAnchor: 0.02,
        }
      ),
    [stage, fit]
  );

  /* ── Snapshot ─────────────────────────────────────────────────────── */

  const flashScreen = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 420);
  };

  const svgToImage = (svgEl, w, h) =>
    new Promise((resolve, reject) => {
      if (!svgEl) {
        reject(new Error('Overlay is not mounted'));
        return;
      }
      const clone = svgEl.cloneNode(true);
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', String(Math.max(1, Math.round(w))));
      clone.setAttribute('height', String(Math.max(1, Math.round(h))));
      clone.removeAttribute('class');
      const markup = new XMLSerializer().serializeToString(clone);
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
      const img = new Image();
      img.decoding = 'sync';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not rasterise the gown'));
      img.src = url;
    });

  const drawStudioBackdrop = (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1b1814');
    g.addColorStop(0.52, '#0f0d0b');
    g.addColorStop(1, '#080706');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w * 0.5, h * 0.34, 0, w * 0.5, h * 0.34, w * 0.72);
    glow.addColorStop(0, 'rgba(192,160,98,0.30)');
    glow.addColorStop(0.55, 'rgba(192,160,98,0.07)');
    glow.addColorStop(1, 'rgba(192,160,98,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // floor pool
    const floor = ctx.createRadialGradient(w * 0.5, h * 0.94, 0, w * 0.5, h * 0.94, w * 0.6);
    floor.addColorStop(0, 'rgba(247,243,236,0.14)');
    floor.addColorStop(1, 'rgba(247,243,236,0)');
    ctx.save();
    ctx.translate(w * 0.5, h * 0.94);
    ctx.scale(1, 0.24);
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const capture = useCallback(async () => {
    if (!product || !stage.width || !stage.height) return;
    flashScreen();

    const OUT_W = 1200;
    const k = OUT_W / stage.width;
    const OUT_H = Math.round(stage.height * k);
    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext('2d');

    try {
      /* ── 1. Back plate ───────────────────────────────────────────── */
      const video = videoRef.current;
      const liveReady = isLive && video && video.videoWidth > 0;

      if (liveReady) {
        ctx.save();
        // Mirror, matching the CSS preview.
        ctx.translate(OUT_W, 0);
        ctx.scale(-1, 1);
        const vr = video.videoWidth / video.videoHeight;
        const cr = OUT_W / OUT_H;
        let dw;
        let dh;
        if (vr > cr) {
          dh = OUT_H;
          dw = Math.round(OUT_H * vr);
        } else {
          dw = OUT_W;
          dh = Math.round(OUT_W / vr);
        }
        ctx.drawImage(video, (OUT_W - dw) / 2, (OUT_H - dh) / 2, dw, dh);
        ctx.restore();
      } else {
        drawStudioBackdrop(ctx, OUT_W, OUT_H);
      }

      /* ── 2. Figure (Studio Mode only) ────────────────────────────── */
      if (!liveReady && figureRef.current) {
        const fb = layerBox(
          stage,
          { scale: fit.scale * 0.94, x: fit.x, y: fit.y - 8 },
          {
            baseW: DRESS_FRAME.baseWidth,
            baseH: DRESS_FRAME.baseHeight,
            baseAnchor: 0.02,
          }
        );
        const img = await svgToImage(
          figureRef.current.querySelector('svg'),
          fb.width * k,
          fb.height * k
        );
        ctx.drawImage(img, fb.left * k, fb.top * k, fb.width * k, fb.height * k);
      }

      /* ── 3. The gown, in the exact on-screen geometry ────────────── */
      const ob = overlayBox;
      const gown = await svgToImage(
        overlayRef.current?.querySelector('svg'),
        ob.width * k,
        ob.height * k
      );
      ctx.save();
      ctx.globalAlpha = fit.opacity;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 16;
      ctx.drawImage(gown, ob.left * k, ob.top * k, ob.width * k, ob.height * k);
      ctx.restore();

      /* ── 4. Frame, wordmark and caption ──────────────────────────── */
      const pad = Math.round(OUT_W * 0.026);
      ctx.strokeStyle = 'rgba(192,160,98,0.75)';
      ctx.lineWidth = Math.max(1, Math.round(OUT_W / 900));
      ctx.strokeRect(pad, pad, OUT_W - pad * 2, OUT_H - pad * 2);

      const fontStack =
        "'Cormorant Garamond', 'Didot', Georgia, 'Times New Roman', serif";
      const sansStack = "'Jost', 'Futura', 'Avenir Next', Helvetica, Arial, sans-serif";

      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(247,243,236,0.94)';
      ctx.font = `500 ${Math.round(OUT_W * 0.026)}px ${sansStack}`;
      ctx.letterSpacing = '6px';
      ctx.fillText('A U R A', pad + OUT_W * 0.028, OUT_H - pad - OUT_W * 0.026);

      ctx.fillStyle = 'rgba(247,243,236,0.6)';
      ctx.font = `300 ${Math.round(OUT_W * 0.019)}px ${sansStack}`;
      ctx.letterSpacing = '2px';
      ctx.fillText('VIRTUAL ATELIER', pad + OUT_W * 0.028 + OUT_W * 0.1, OUT_H - pad - OUT_W * 0.0275);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(192,160,98,0.98)';
      ctx.font = `italic 400 ${Math.round(OUT_W * 0.032)}px ${fontStack}`;
      ctx.letterSpacing = '0px';
      ctx.fillText(product.name, OUT_W - pad - OUT_W * 0.028, OUT_H - pad - OUT_W * 0.024);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(247,243,236,0.62)';
      ctx.font = `300 ${Math.round(OUT_W * 0.018)}px ${sansStack}`;
      ctx.fillText(
        `${product.fabric} · ${product.colorName} · ${formatPrice(product.price)}`,
        OUT_W - pad - OUT_W * 0.028,
        OUT_H - pad - OUT_W * 0.052
      );

      ctx.textAlign = 'left';
      ctx.letterSpacing = '3px';
      ctx.fillStyle = 'rgba(247,243,236,0.55)';
      ctx.font = `300 ${Math.round(OUT_W * 0.016)}px ${sansStack}`;
      ctx.fillText(
        new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase(),
        pad + OUT_W * 0.028,
        pad + OUT_W * 0.052
      );

      setShot({ dataUrl: canvas.toDataURL('image/png'), product, at: Date.now() });
    } catch (err) {
      setToast({
        tone: 'error',
        message:
          err.name === 'SecurityError' || /taint|blob/i.test(err.message || '')
            ? 'This browser blocked canvas export. The preview above is still accurate.'
            : 'The look could not be captured. Please try once more.',
      });
    }
  }, [product, stage, fit, isLive, overlayBox]);

  /* ── Export actions ───────────────────────────────────────────────── */

  const downloadShot = () => {
    if (!shot) return;
    const a = document.createElement('a');
    a.href = shot.dataUrl;
    a.download = `aura-${shot.product.slug}-${new Date(shot.at)
      .toISOString()
      .slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setToast({ tone: 'ok', message: 'Look saved to your downloads.' });
  };

  const shareShot = async () => {
    if (!shot) return;
    try {
      const blob = await (await fetch(shot.dataUrl)).blob();
      const file = new File([blob], `aura-look-${shot.product.slug}.png`, {
        type: 'image/png',
      });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${shot.product.name} — AURA`,
          text: `I tried on the ${shot.product.name} in the AURA virtual atelier.`,
        });
        return;
      }
      if (navigator.share) {
        await navigator.share({
          title: `${shot.product.name} — AURA`,
          text: `I tried on the ${shot.product.name} in the AURA virtual atelier.`,
        });
        return;
      }
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write(
          `I tried on the ${shot.product.name} in the AURA virtual atelier.`
        );
        setToast({
          tone: 'ok',
          message: 'Sharing is not available here — the caption was copied instead.',
        });
        return;
      }
      throw new Error('unsupported');
    } catch (err) {
      if (err.name === 'AbortError') return;
      downloadShot();
    }
  };

  /* ── Bag ──────────────────────────────────────────────────────────── */

  const addToBag = () => {
    addItem(product, size, { quantity: 1, source: 'fitting-room' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  /* ── Status screens ───────────────────────────────────────────────── */

  const statusMeta = useMemo(() => {
    switch (camera.status) {
      case 'requesting':
        return { icon: <span className="spinner" />, title: 'Opening the studio…', body: 'Waiting for your browser permission prompt.' };
      case 'denied':
        return { icon: <IconAlert />, title: 'Camera permission declined', body: camera.error?.message };
      case 'nodevice':
        return { icon: <IconAlert />, title: 'No camera found', body: camera.error?.message };
      case 'inuse':
        return { icon: <IconAlert />, title: 'Camera unavailable', body: camera.error?.message };
      case 'insecure':
        return { icon: <IconAlert />, title: 'Camera needs a secure connection', body: camera.error?.message };
      case 'error':
        return { icon: <IconAlert />, title: camera.error?.title || 'Camera unavailable', body: camera.error?.message };
      case 'stopped':
        return { icon: <IconAlert />, title: 'Camera disconnected', body: 'The stream ended. Reconnect to continue in live mode.' };
      default:
        return null;
    }
  }, [camera.status, camera.error]);

  const showGate = !usingStudio && camera.status !== 'live' && statusMeta;

  return (
    <div className="fr" role="dialog" aria-modal="true" aria-label="Virtual dressing room" ref={dialogRef}>
      <div className="fr__scrim" onClick={onClose} aria-hidden="true" />

      <div className="fr__panel">
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="fr__bar">
          <div className="fr__brand">
            <span className="fr__brand-mark">AURA</span>
            <span className="fr__brand-sep" aria-hidden="true" />
            <span className="fr__brand-label">Virtual Atelier</span>
          </div>

          <div className="fr__status">
            <span className={cx('fr__pill', isLive ? 'is-live' : 'is-studio')}>
              <i aria-hidden="true" />
              {isLive ? 'Live camera' : 'Studio mode'}
            </span>
            {isLive && camera.trackSettings?.width > 0 && (
              <span className="fr__meta">
                {camera.trackSettings.width}×{camera.trackSettings.height}
              </span>
            )}
          </div>

          <button className="icon-btn icon-btn--light fr__close" onClick={onClose} aria-label="Close the dressing room">
            <IconClose />
          </button>
        </header>

        {/* ── Stage + controls ───────────────────────────────────────── */}
        <div className="fr__body">
          <div className="fr__stage-col">
            <div className={cx('fr__stage', flash && 'is-flash')} ref={stageRef}>
              {/* Live video */}
              <video
                ref={videoRef}
                className="fr__video"
                autoPlay
                playsInline
                muted
                aria-label="Live camera preview"
              />

              {/* Studio Mode backdrop + figure */}
              {usingStudio && (
                <>
                  <div className="fr__studio" aria-hidden="true" />
                  <div
                    className="fr__figure"
                    ref={figureRef}
                    style={asStyle(figureBox)}
                    aria-hidden="true"
                  >
                    <FigureSilhouette uid={`${uid}-fig`} tone="stone" />
                  </div>
                </>
              )}

              {/* The gown overlay */}
              <div
                className="fr__overlay"
                ref={overlayRef}
                style={{ ...asStyle(overlayBox), opacity: fit.opacity }}
              >
                <DressVector dressKey={product.dressKey} uid={`${uid}-gown`} />
              </div>

              {/* Viewfinder decoration */}
              <div className="fr__guides" aria-hidden="true">
                <span className="fr__corner fr__corner--tl" />
                <span className="fr__corner fr__corner--tr" />
                <span className="fr__corner fr__corner--bl" />
                <span className="fr__corner fr__corner--br" />
                <span className="fr__anchor-line" />
              </div>

              {isLive && <span className="fr__rec" aria-hidden="true"><i />REC</span>}

              {/* Permission / error gate */}
              {showGate && (
                <div className="fr__gate">
                  <span className="fr__gate-icon">{statusMeta.icon}</span>
                  <h2 className="fr__gate-title">{statusMeta.title}</h2>
                  <p className="fr__gate-body">{statusMeta.body}</p>
                  <div className="fr__gate-actions">
                    <button className="btn btn--gold btn--sm" onClick={() => camera.start()}>
                      <IconCamera width={15} height={15} />
                      Try the camera again
                    </button>
                    <button
                      className="btn btn--sm fr__gate-alt"
                      onClick={() => setMode('studio')}
                    >
                      <IconSparkle width={15} height={15} />
                      Continue in Studio Mode
                    </button>
                  </div>
                  <p className="fr__gate-note">
                    Studio Mode renders the same fitting tools on our house
                    mannequin — no camera, no permission, nothing leaves your device.
                  </p>
                </div>
              )}
            </div>

            {/* Caption strip */}
            <div className="fr__caption">
              <div>
                <p className="fr__caption-name">{product.name}</p>
                <p className="fr__caption-meta">
                  {product.fabric} · {product.colorName} · {product.atelier}
                </p>
              </div>
              <p className="fr__caption-price">{formatPrice(product.price)}</p>
            </div>
          </div>

          {/* ── Control panel ────────────────────────────────────────── */}
          <aside className="fr__panel-side" aria-label="Fitting controls">
            <button
              className="fr__tabs-toggle"
              onClick={() => setShowFit((v) => !v)}
              aria-expanded={showFit}
            >
              <IconSliders width={16} height={16} />
              Fitting tools
            </button>

            <div className={cx('fr__panel-scroll', showFit && 'is-open')}>
              {/* Dress switcher */}
              <section className="fr__group">
                <h3 className="fr__group-title">
                  <span className="eyebrow">Step 01</span> Choose a gown
                </h3>
                <div className="fr__gowns" role="radiogroup" aria-label="Choose a gown">
                  {products.map((p) => {
                    const on = p._id === activeId;
                    return (
                      <button
                        key={p._id}
                        role="radio"
                        aria-checked={on}
                        className={cx('fr__gown', on && 'is-on')}
                        onClick={() => selectProduct(p)}
                        title={p.name}
                      >
                        <span className="fr__gown-art">
                          <DressVector dressKey={p.dressKey} uid={`${uid}-s${p._id}`} />
                        </span>
                        <span className="fr__gown-name">{p.name}</span>
                        <span className="fr__gown-price">{formatPrice(p.price)}</span>
                        {on && (
                          <span className="fr__gown-check" aria-hidden="true">
                            <IconCheck width={12} height={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Fit controls */}
              <section className="fr__group">
                <h3 className="fr__group-title">
                  <span className="eyebrow">Step 02</span> Fit to you
                </h3>

                <div className="fr__presets" role="group" aria-label="Fit presets">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      className={cx('chip', activePreset === p.key && 'is-active')}
                      aria-pressed={activePreset === p.key}
                      onClick={() => applyPreset(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="fr__sliders">
                  {SLIDERS.map((s) => (
                    <label key={s.key} className="fr__slider">
                      <span className="fr__slider-head">
                        <span>{s.label}</span>
                        <output>
                          {s.key === 'scale'
                            ? `${fit.scale.toFixed(2)}${s.unit}`
                            : `${fit[s.key] > 0 ? '+' : ''}${fit[s.key]}`}
                        </output>
                      </span>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={fit[s.key]}
                        onChange={(e) => setSlider(s.key, Number(e.target.value))}
                        aria-label={s.label}
                      />
                    </label>
                  ))}

                  <label className="fr__slider">
                    <span className="fr__slider-head">
                      <span>Opacity</span>
                      <output>{Math.round(fit.opacity * 100)}%</output>
                    </span>
                    <input
                      type="range"
                      min="0.25"
                      max="1"
                      step="0.01"
                      value={fit.opacity}
                      onChange={(e) => setSlider('opacity', Number(e.target.value))}
                      aria-label="Gown opacity"
                    />
                  </label>
                </div>

                <button className="btn btn--sm btn--block fr__reset" onClick={reset}>
                  <IconReset width={15} height={15} />
                  Reset fit
                </button>
              </section>

              {/* Capture */}
              <section className="fr__group">
                <h3 className="fr__group-title">
                  <span className="eyebrow">Step 03</span> Keep the look
                </h3>
                <button
                  className="btn btn--gold btn--block btn--lg fr__capture"
                  onClick={capture}
                  disabled={!product}
                >
                  <IconShutter width={18} height={18} />
                  Capture Look
                </button>
                <p className="fr__hint">
                  A framed still is rendered locally and never uploaded. Download
                  it or share it straight from your device.
                </p>
              </section>

              {/* Size + add to bag */}
              <section className="fr__group">
                <h3 className="fr__group-title">
                  <span className="eyebrow">Step 04</span> Reserve your size
                </h3>
                <div className="fr__sizes" role="radiogroup" aria-label="Select a size">
                  {product.sizes?.map((s) => (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={size === s}
                      className={cx('fr__size', size === s && 'is-on')}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  className={cx('btn btn--primary btn--block fr__add', added && 'is-added')}
                  onClick={addToBag}
                >
                  {added ? (
                    <>
                      <IconCheck width={16} height={16} />
                      Reserved in your bag
                    </>
                  ) : (
                    <>
                      <IconBag width={16} height={16} />
                      Add to bag — {formatPrice(product.price)}
                    </>
                  )}
                </button>
                <button
                  className="btn btn--bare btn--block fr__viewbag"
                  onClick={() => {
                    onClose();
                    onOpenBag?.();
                  }}
                >
                  View shopping bag
                </button>
              </section>

              {/* Hardware controls */}
              <section className="fr__group fr__group--hardware">
                <h3 className="fr__group-title">
                  <span className="eyebrow">Studio</span> Camera
                </h3>
                <div className="fr__hw">
                  {isLive && (
                    <>
                      <button
                        className="btn btn--sm"
                        onClick={() => camera.switchFacing('environment')}
                      >
                        <IconFlip width={15} height={15} />
                        Flip
                      </button>
                      {camera.devices.length > 1 && (
                        <label className="fr__device">
                          <span className="sr-only">Choose a camera</span>
                          <select
                            className="select"
                            value={camera.activeDeviceId || ''}
                            onChange={(e) => camera.switchDevice(e.target.value)}
                          >
                            {camera.devices.map((d, i) => (
                              <option key={d.deviceId || i} value={d.deviceId}>
                                {d.label || `Camera ${i + 1}`}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}
                  <button
                    className={cx('btn btn--sm', !isLive && 'is-on')}
                    onClick={() => {
                      if (isLive) {
                        setMode('studio');
                      } else {
                        setMode('prompt');
                        camera.start();
                      }
                    }}
                  >
                    <IconSwitchCam width={15} height={15} />
                    {isLive ? 'Switch to Studio' : 'Switch to Live'}
                  </button>
                </div>
                <p className="fr__hint fr__hint--privacy">
                  Video is processed entirely in your browser. Nothing is
                  recorded, uploaded or stored.
                </p>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Snapshot review ──────────────────────────────────────────── */}
      {shot && (
        <div className="fr__review" role="dialog" aria-modal="true" aria-label="Captured look">
          <div className="fr__review-scrim" onClick={() => setShot(null)} aria-hidden="true" />
          <div className="fr__review-card">
            <img src={shot.dataUrl} alt={`Your virtual try-on of the ${shot.product.name}`} />
            <div className="fr__review-actions">
              <button className="btn btn--primary" onClick={downloadShot}>
                <IconDownload width={16} height={16} />
                Download PNG
              </button>
              <button className="btn" onClick={shareShot}>
                <IconShare width={16} height={16} />
                Share
              </button>
              <button className="btn btn--bare" onClick={() => setShot(null)}>
                <IconArrowLeft width={16} height={16} />
                Back to the studio
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={cx('fr__toast', `is-${toast.tone}`)} role="status">
          {toast.tone === 'ok' ? <IconCheck width={16} height={16} /> : <IconAlert width={16} height={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
