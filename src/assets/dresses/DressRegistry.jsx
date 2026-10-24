/* ============================================================================
   AURA BOUTIQUE — Dress Vector Registry
   ----------------------------------------------------------------------------
   High-resolution, resolution-independent cut-outs of each gown, drawn as
   inline SVG so they stay razor sharp at any overlay scale and can be
   rasterised to a canvas for "Capture Look" snapshots.

   Every silhouette shares one garment frame so switching dresses never
   makes the overlay jump:

     viewBox        640 × 1000
     centre x       320
     shoulder line  y ≈ 215
     waist          y ≈ 435
     hem (floor)   y ≈ 955
     hem (midi)    y ≈ 735

   All paint is done with presentation attributes (no CSS classes), because
   these nodes get serialised and loaded through an <img> for snapshots.
   ========================================================================== */

export const DRESS_VIEWBOX = { w: 640, h: 1000 };

export const DRESS_FRAME = {
  cx: 320,
  shoulderY: 215,
  waistY: 435,
  hipY: 530,
  midiHemY: 735,
  floorHemY: 955,
  /** Natural on-screen size, in CSS px, of an unscaled (scale = 1) dress. */
  baseWidth: 460,
  baseHeight: (460 * 1000) / 640,
};

/* ── Shared building blocks ─────────────────────────────────────────── */

const Folds = ({ lines, color = '#000', width = 1.1, opacity = 0.16 }) => (
  <g
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    opacity={opacity}
  >
    {lines.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </g>
);

const Sheen = ({ id, x = '38%', y = '28%', r = '58%' }) => (
  <radialGradient id={id} cx={x} cy={y} r={r}>
    <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
    <stop offset="45%" stopColor="#fff" stopOpacity="0.14" />
    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
  </radialGradient>
);

const Fabric = ({ id, light, base, deep }) => (
  <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="18%">
    <stop offset="0%" stopColor={deep} />
    <stop offset="16%" stopColor={base} />
    <stop offset="42%" stopColor={light} />
    <stop offset="68%" stopColor={base} />
    <stop offset="100%" stopColor={deep} />
  </linearGradient>
);

function useClip(id, d) {
  return (
    <clipPath id={id}>
      <path d={d} />
    </clipPath>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   1 — Noir Bias Slip Gown  ·  silk charmeuse, onyx
   ═══════════════════════════════════════════════════════════════════ */
function NoirSlip({ id }) {
  const body =
    'M246 232 C232 272 224 304 226 340 C228 384 240 412 232 448 ' +
    'C220 500 208 546 200 602 C188 700 176 812 166 926 ' +
    'C242 952 398 952 474 926 C464 812 452 700 440 602 ' +
    'C432 546 420 500 408 448 C400 412 412 384 414 340 ' +
    'C416 304 408 272 394 232 C372 258 268 258 246 232 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <Fabric id={`${id}-f`} light="#3a3733" base="#1d1b19" deep="#0a0a09" />
        <Sheen id={`${id}-s`} x="34%" y="24%" />
        <linearGradient id={`${id}-v`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="26%" stopColor="#000" stopOpacity="0" />
          <stop offset="72%" stopColor="#000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}-hl`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.22" />
        </linearGradient>
        {useClip(clip, body)}
      </defs>

      {/* straps */}
      <g fill="none" stroke="#1d1b19" strokeWidth="9" strokeLinecap="round">
        <path d="M250 240 C238 206 240 186 258 176" />
        <path d="M390 240 C402 206 400 186 382 176" />
      </g>
      <g fill="none" stroke="#4a4640" strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <path d="M250 240 C238 206 240 186 258 176" />
        <path d="M390 240 C402 206 400 186 382 176" />
      </g>

      <path d={body} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <rect x="120" y="160" width="400" height="820" fill={`url(#${id}-s)`} />
        <rect x="120" y="160" width="400" height="820" fill={`url(#${id}-v)`} />
        {/* cowl drape at the neckline */}
        <path
          d="M250 236 C282 276 358 276 390 236 C392 262 380 288 320 290 C260 288 248 262 250 236 Z"
          fill="#000"
          opacity="0.3"
        />
        <path
          d="M256 240 C288 272 352 272 384 240"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          opacity="0.22"
        />
        <Folds
          color="#000"
          opacity="0.24"
          lines={[
            'M262 300 C256 400 244 520 232 700 C224 820 220 890 218 940',
            'M300 300 C296 420 288 560 280 740 C276 830 274 900 272 944',
            'M340 302 C344 420 352 560 358 740 C362 830 364 900 366 944',
            'M380 300 C388 400 402 520 412 700 C420 820 424 890 426 940',
          ]}
        />
        <Folds
          color="#fff"
          width="0.9"
          opacity="0.13"
          lines={[
            'M282 296 C278 420 270 560 264 740 C260 830 258 900 256 944',
            'M322 302 C326 420 332 560 336 740 C338 830 340 900 342 944',
            'M362 296 C366 420 374 560 380 740 C384 830 386 900 388 944',
          ]}
        />
        {/* hem fall */}
        <rect x="120" y="880" width="400" height="90" fill={`url(#${id}-hl)`} />
      </g>
      <path d={body} fill="none" stroke="#000" strokeWidth="1.4" opacity="0.55" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   2 — Ivory Satin A-Line  ·  silk duchesse, alabaster
   ═══════════════════════════════════════════════════════════════════ */
function IvoryAFrame({ id }) {
  const body =
    'M232 262 C246 234 278 228 320 248 C362 228 394 234 408 262 ' +
    'C414 304 414 352 410 394 C408 420 404 436 406 456 ' +
    'C424 476 442 512 456 560 C474 626 488 736 500 872 ' +
    'C400 906 240 906 140 872 C152 736 166 626 184 560 ' +
    'C198 512 216 476 234 456 C236 436 232 420 230 394 ' +
    'C226 352 226 304 232 262 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <Fabric id={`${id}-f`} light="#fdfaf4" base="#eee4d2" deep="#c9b795" />
        <Sheen id={`${id}-s`} x="36%" y="20%" r="62%" />
        <linearGradient id={`${id}-v`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8d7a52" stopOpacity="0.5" />
          <stop offset="30%" stopColor="#8d7a52" stopOpacity="0" />
          <stop offset="74%" stopColor="#8d7a52" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8d7a52" stopOpacity="0.55" />
        </linearGradient>
        {useClip(clip, body)}
      </defs>

      <path d={body} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <rect x="100" y="200" width="440" height="740" fill={`url(#${id}-s)`} />
        <rect x="100" y="200" width="440" height="740" fill={`url(#${id}-v)`} />
        {/* bodice seam lines */}
        <Folds
          color="#a08d61"
          opacity="0.35"
          width="1.2"
          lines={[
            'M286 250 C288 320 292 400 296 452',
            'M354 250 C352 320 348 400 344 452',
            'M320 248 C320 320 320 400 320 454',
          ]}
        />
        {/* wide pleated waistband */}
        <g>
          <path d="M232 424 L408 424 L410 472 L230 472 Z" fill="#e6d9c0" opacity="0.95" />
          <path d="M230 424 L410 424" stroke="#b8a077" strokeWidth="1.4" opacity="0.7" />
          <path d="M230 472 L410 472" stroke="#b8a077" strokeWidth="1.4" opacity="0.7" />
          <Folds
            color="#a08d61"
            opacity="0.3"
            width="1"
            lines={Array.from({ length: 11 }, (_, i) => {
              const x = 238 + i * 16.6;
              return `M${x} 426 L${x + (i % 2 ? 2 : -2)} 470`;
            })}
          />
        </g>
        {/* pleated skirt fall */}
        <Folds
          color="#a08d61"
          opacity="0.26"
          width="1.3"
          lines={[
            'M240 476 C226 580 206 720 190 872',
            'M268 476 C258 580 244 726 232 886',
            'M296 476 C290 580 282 730 274 890',
            'M320 476 L320 896',
            'M344 476 C350 580 358 730 366 890',
            'M372 476 C382 580 396 726 408 886',
            'M400 476 C414 580 434 720 450 872',
          ]}
        />
        <Folds
          color="#fff"
          opacity="0.5"
          width="1"
          lines={['M254 478 C240 580 220 720 204 878', 'M308 478 C302 580 294 730 286 892']}
        />
      </g>
      <path d={body} fill="none" stroke="#b09871" strokeWidth="1.5" opacity="0.6" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3 — Emerald Velvet Column  ·  silk velvet, malachite
   ═══════════════════════════════════════════════════════════════════ */
function EmeraldColumn({ id }) {
  const body =
    'M252 228 C246 272 242 306 244 342 C246 388 252 418 248 452 ' +
    'C240 508 238 578 240 660 C242 750 244 844 246 936 ' +
    'C300 952 340 952 394 936 C396 844 398 750 400 660 ' +
    'C402 578 400 508 392 452 C388 418 394 388 396 342 ' +
    'C398 306 394 272 388 228 C366 266 352 292 320 310 ' +
    'C288 292 274 266 252 228 Z';
  const sleeveL =
    'M252 230 C226 254 212 296 210 344 C208 396 216 448 224 494 ' +
    'C230 528 240 552 250 566 C258 546 262 512 258 476 ' +
    'C252 420 250 372 254 330 C256 288 258 254 262 232 Z';
  const sleeveR =
    'M388 230 C414 254 428 296 430 344 C432 396 424 448 416 494 ' +
    'C410 528 400 552 390 566 C382 546 378 512 382 476 ' +
    'C388 420 390 372 386 330 C384 288 382 254 378 232 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="10%">
          <stop offset="0%" stopColor="#05271e" />
          <stop offset="18%" stopColor="#0d4433" />
          <stop offset="40%" stopColor="#1a6b50" />
          <stop offset="52%" stopColor="#123f30" />
          <stop offset="80%" stopColor="#083326" />
          <stop offset="100%" stopColor="#041a14" />
        </linearGradient>
        <Sheen id={`${id}-s`} x="34%" y="22%" r="48%" />
        <linearGradient id={`${id}-v`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
          <stop offset="30%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
        </linearGradient>
        {useClip(clip, body)}
      </defs>

      <path d={sleeveL} fill={`url(#${id}-f)`} />
      <path d={sleeveR} fill={`url(#${id}-f)`} />
      <g opacity="0.5">
        <path d={sleeveL} fill={`url(#${id}-v)`} />
        <path d={sleeveR} fill={`url(#${id}-v)`} />
      </g>
      <Folds
        color="#000"
        opacity="0.3"
        lines={['M226 300 C222 380 230 460 246 546', 'M414 300 C418 380 410 460 394 546']}
      />
      <Folds
        color="#7fd0ae"
        width="1"
        opacity="0.2"
        lines={['M240 296 C238 380 244 462 258 542', 'M400 296 C402 380 396 462 382 542']}
      />

      <path d={body} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <rect x="200" y="180" width="240" height="800" fill={`url(#${id}-s)`} opacity="0.7" />
        <rect x="200" y="180" width="240" height="800" fill={`url(#${id}-v)`} />
        {/* plunging V inner facing */}
        <path
          d="M252 228 C274 268 292 296 320 314 C348 296 366 268 388 228 L388 244 C366 284 348 312 320 330 C292 312 274 284 252 244 Z"
          fill="#02150f"
          opacity="0.55"
        />
        <Folds
          color="#000"
          opacity="0.22"
          lines={[
            'M266 330 C262 450 258 600 258 760 C258 840 260 900 262 944',
            'M300 336 C298 460 296 610 296 770 C296 850 296 906 296 948',
            'M344 336 C346 460 348 610 348 770 C348 850 348 906 348 948',
            'M378 330 C382 450 386 600 386 760 C386 840 384 900 382 944',
          ]}
        />
        <Folds
          color="#8fe0bd"
          width="0.9"
          opacity="0.16"
          lines={['M284 330 C280 460 278 610 278 770 C278 850 278 906 278 946']}
        />
      </g>
      <path d={body} fill="none" stroke="#021710" strokeWidth="1.4" opacity="0.6" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4 — Blush Layered Tulle Midi  ·  silk tulle, petal
   ═══════════════════════════════════════════════════════════════════ */
function BlushTulle({ id }) {
  const slip =
    'M258 246 C250 288 246 322 248 358 C250 400 258 424 254 452 ' +
    'C246 496 242 540 244 580 C246 640 250 690 254 728 ' +
    'C300 742 340 742 386 728 C390 690 394 640 396 580 ' +
    'C398 540 394 496 386 452 C382 424 390 400 392 358 ' +
    'C394 322 390 288 382 246 C364 268 340 280 320 280 ' +
    'C300 280 276 268 258 246 Z';
  const clip = `${id}-c`;

  const tier = (yTop, yBot, spread, opacity) => (
    <path
      d={`M226 ${yTop} C214 ${yTop + 60} 206 ${yTop + 120} ${yBot - spread} ${yBot} C280 ${yBot + 20} 360 ${yBot + 20} ${yBot + spread} ${yBot} C434 ${yTop + 120} 426 ${yTop + 60} 414 ${yTop} C372 ${yTop + 16} 268 ${yTop + 16} 226 ${yTop} Z`}
      fill={`url(#${id}-t)`}
      opacity={opacity}
    />
  );

  return (
    <>
      <defs>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="8%">
          <stop offset="0%" stopColor="#b98f8d" />
          <stop offset="24%" stopColor="#e7c3c0" />
          <stop offset="48%" stopColor="#f6e2df" />
          <stop offset="76%" stopColor="#dfb0ad" />
          <stop offset="100%" stopColor="#a87f7d" />
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e7c3c0" stopOpacity="0.25" />
          <stop offset="40%" stopColor="#fff3f1" stopOpacity="0.62" />
          <stop offset="70%" stopColor="#e7c3c0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#b98f8d" stopOpacity="0.42" />
        </linearGradient>
        {useClip(clip, slip)}
      </defs>

      {/* gathered puff sleeves */}
      <g fill={`url(#${id}-f)`}>
        <ellipse cx="228" cy="300" rx="46" ry="54" />
        <ellipse cx="412" cy="300" rx="46" ry="54" />
      </g>
      <g fill="#000" opacity="0.14">
        <ellipse cx="240" cy="316" rx="34" ry="42" />
        <ellipse cx="400" cy="316" rx="34" ry="42" />
      </g>
      <Folds
        color="#a87f7d"
        opacity="0.45"
        width="1.1"
        lines={['M196 272 C208 292 214 322 214 350', 'M258 268 C250 292 246 322 246 350']}
      />

      <path d={slip} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <Folds
          color="#a87f7d"
          opacity="0.3"
          lines={['M280 300 C276 400 274 520 276 640', 'M360 300 C364 400 366 520 364 640']}
        />
      </g>

      {/* three tiers of hand-pleated tulle */}
      <g>
        {tier(430, 540, 46, 0.95)}
        {tier(516, 626, 76, 0.9)}
        {tier(602, 730, 108, 0.85)}
        <Folds
          color="#b98f8d"
          opacity="0.32"
          width="1.1"
          lines={[
            'M234 448 C222 500 210 570 200 660',
            'M268 440 C258 500 246 578 236 700',
            'M300 436 C294 500 286 580 278 736',
            'M320 436 L320 742',
            'M340 436 C346 500 354 580 362 736',
            'M372 440 C382 500 394 578 404 700',
            'M406 448 C418 500 430 570 440 660',
          ]}
        />
      </g>

      {/* ribbon waist */}
      <path
        d="M252 428 C280 440 360 440 388 428 L390 448 C360 460 280 460 250 448 Z"
        fill="#c98f8c"
        opacity="0.9"
      />
      <path
        d="M252 438 C280 450 360 450 388 438"
        fill="none"
        stroke="#fff"
        strokeWidth="1"
        opacity="0.4"
      />
      {/* bow */}
      <g fill="#c98f8c">
        <path d="M320 448 C304 434 288 436 292 450 C296 462 310 462 320 452 Z" />
        <path d="M320 448 C336 434 352 436 348 450 C344 462 330 462 320 452 Z" />
        <circle cx="320" cy="450" r="5" />
      </g>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5 — Gilded Sequin Sheath  ·  glass sequin on crepe, antique gold
   ═══════════════════════════════════════════════════════════════════ */
function GildedSheath({ id }) {
  const body =
    'M236 254 C230 292 230 330 234 366 C238 404 246 430 240 462 ' +
    'C232 510 230 578 232 664 C234 754 238 846 242 930 ' +
    'C298 946 342 946 398 930 C400 846 404 754 406 664 ' +
    'C408 578 406 510 398 462 C392 430 400 404 404 366 ' +
    'C408 330 406 292 396 250 C376 262 358 258 342 246 ' +
    'C326 236 306 236 290 246 C274 258 254 264 236 254 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="6%">
          <stop offset="0%" stopColor="#6b4f1f" />
          <stop offset="16%" stopColor="#a8812f" />
          <stop offset="38%" stopColor="#e2c47c" />
          <stop offset="52%" stopColor="#c09a4d" />
          <stop offset="78%" stopColor="#8a6825" />
          <stop offset="100%" stopColor="#513a14" />
        </linearGradient>
        <pattern
          id={`${id}-seq`}
          width="17"
          height="17"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="4.5" cy="4.5" r="3.1" fill="#fdf0cf" opacity="0.72" />
          <circle cx="4.5" cy="4.5" r="1.3" fill="#fff" opacity="0.5" />
          <circle cx="13" cy="12.5" r="3.1" fill="#e6c684" opacity="0.6" />
          <circle cx="13" cy="12.5" r="1.2" fill="#fff8e6" opacity="0.4" />
        </pattern>
        <linearGradient id={`${id}-gl`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.6" />
          <stop offset="34%" stopColor="#fff" stopOpacity="0.24" />
          <stop offset="52%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.66" />
        </linearGradient>
        {useClip(clip, body)}
      </defs>

      <path d={body} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <rect x="200" y="220" width="240" height="740" fill={`url(#${id}-seq)`} />
        <rect x="200" y="220" width="240" height="740" fill={`url(#${id}-gl)`} />
        <Folds
          color="#3a2a0c"
          opacity="0.3"
          lines={['M288 320 C284 440 282 580 284 740 C284 830 286 890 288 938']}
        />
      </g>
      <path d={body} fill="none" stroke="#4a3512" strokeWidth="1.4" opacity="0.7" />

      {/* one-shoulder drape */}
      <path
        d="M236 254 C252 232 276 220 300 224 C320 228 340 238 356 250 C338 264 306 274 284 274 C262 274 244 266 236 254 Z"
        fill={`url(#${id}-f)`}
      />
      <path
        d="M236 254 C252 232 276 220 300 224 C320 228 340 238 356 250 C338 264 306 274 284 274 C262 274 244 266 236 254 Z"
        fill={`url(#${id}-seq)`}
        opacity="0.95"
      />
      <path
        d="M240 252 C258 234 280 226 302 230"
        fill="none"
        stroke="#fdf0cf"
        strokeWidth="1.6"
        opacity="0.6"
      />
      {/* raw-edge hem highlight */}
      <path
        d="M242 930 C298 946 342 946 398 930"
        fill="none"
        stroke="#f5e2b2"
        strokeWidth="2"
        opacity="0.5"
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6 — Charcoal Draped Cape Gown  ·  wool-silk crepe
   ═══════════════════════════════════════════════════════════════════ */
function CharcoalCape({ id }) {
  const gown =
    'M258 244 C252 288 250 322 254 358 C258 398 264 420 258 450 ' +
    'C248 500 244 560 246 660 C248 762 250 856 252 940 ' +
    'C300 954 340 954 388 940 C390 856 392 762 394 660 ' +
    'C396 560 392 500 382 450 C376 420 382 398 386 358 ' +
    'C390 322 388 288 382 244 C364 262 344 270 320 270 ' +
    'C296 270 276 262 258 244 Z';
  const cape =
    'M258 232 C230 246 200 286 186 342 C170 408 158 512 150 640 ' +
    'C142 768 138 872 140 930 C168 950 196 958 218 952 ' +
    'C206 856 196 742 194 640 C192 520 200 424 216 356 ' +
    'C228 306 244 268 262 244 Z';
  const capeR =
    'M382 232 C410 246 440 286 454 342 C470 408 482 512 490 640 ' +
    'C498 768 502 872 500 930 C472 950 444 958 422 952 ' +
    'C434 856 444 742 446 640 C448 520 440 424 424 356 ' +
    'C412 306 396 268 378 244 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="8%">
          <stop offset="0%" stopColor="#131316" />
          <stop offset="20%" stopColor="#33313a" />
          <stop offset="44%" stopColor="#4d4a55" />
          <stop offset="72%" stopColor="#2a2830" />
          <stop offset="100%" stopColor="#101013" />
        </linearGradient>
        <linearGradient id={`${id}-c2`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8d8a94" stopOpacity="0.5" />
          <stop offset="30%" stopColor="#8d8a94" stopOpacity="0" />
          <stop offset="72%" stopColor="#000" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.62" />
        </linearGradient>
        {useClip(clip, gown)}
      </defs>

      <path d={gown} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <Folds
          color="#000"
          opacity="0.3"
          lines={[
            'M278 320 C272 440 270 580 272 760 C272 850 274 906 276 948',
            'M362 320 C368 440 370 580 368 760 C368 850 366 906 364 948',
          ]}
        />
        <Folds
          color="#a5a2ad"
          width="0.9"
          opacity="0.2"
          lines={['M298 320 C294 440 292 580 294 760 C294 850 296 906 298 948']}
        />
      </g>
      <path d={gown} fill="none" stroke="#0b0b0d" strokeWidth="1.3" opacity="0.6" />

      {/* cape panels */}
      <path d={cape} fill={`url(#${id}-f)`} />
      <path d={capeR} fill={`url(#${id}-f)`} />
      <path d={cape} fill={`url(#${id}-c2)`} />
      <path d={capeR} fill={`url(#${id}-c2)`} />
      <Folds
        color="#000"
        opacity="0.34"
        lines={[
          'M226 274 C204 340 190 440 184 580 C178 720 180 850 190 946',
          'M414 274 C436 340 450 440 456 580 C462 720 460 850 450 946',
        ]}
      />
      <Folds
        color="#b4b1bc"
        width="1"
        opacity="0.2"
        lines={['M244 262 C222 336 210 444 204 590', 'M396 262 C418 336 430 444 436 590']}
      />
      {/* blush lining hint at the shoulder */}
      <path
        d="M258 232 C276 250 300 258 320 258 C340 258 364 250 382 232 C368 264 344 274 320 274 C296 274 272 264 258 232 Z"
        fill="#d8b3ae"
        opacity="0.35"
      />
      {/* collar */}
      <path
        d="M256 230 C278 214 302 208 320 208 C338 208 362 214 384 230 C362 246 340 252 320 252 C300 252 278 246 256 230 Z"
        fill="#3b3941"
      />
      <path
        d="M256 230 C278 214 302 208 320 208 C338 208 362 214 384 230"
        fill="none"
        stroke="#7c7985"
        strokeWidth="1.2"
        opacity="0.6"
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7 — Plum Halter Mermaid  ·  hammered silk, aubergine
   ═══════════════════════════════════════════════════════════════════ */
function PlumHalter({ id }) {
  const body =
    'M300 214 C288 244 280 276 278 306 C276 340 284 372 288 400 ' +
    'C292 428 292 444 288 466 C276 500 262 540 252 590 ' +
    'C236 664 216 760 200 902 C240 934 280 950 320 952 ' +
    'C360 950 400 934 440 902 C424 760 404 664 388 590 ' +
    'C378 540 364 500 352 466 C348 444 348 428 352 400 ' +
    'C356 372 364 340 362 306 C360 276 352 244 340 214 ' +
    'C330 232 310 232 300 214 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="6%">
          <stop offset="0%" stopColor="#1e0d1c" />
          <stop offset="18%" stopColor="#3d1a38" />
          <stop offset="40%" stopColor="#68365c" />
          <stop offset="54%" stopColor="#4a2344" />
          <stop offset="80%" stopColor="#2a1127" />
          <stop offset="100%" stopColor="#170a16" />
        </linearGradient>
        <Sheen id={`${id}-s`} x="33%" y="18%" r="52%" />
        <linearGradient id={`${id}-v`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.58" />
          <stop offset="30%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        {useClip(clip, body)}
      </defs>

      {/* halter neckline band */}
      <path
        d="M300 214 C288 238 276 268 268 300 L286 308 C292 280 300 250 306 224 Z"
        fill={`url(#${id}-f)`}
      />
      <path
        d="M340 214 C352 238 364 268 372 300 L354 308 C348 280 340 250 334 224 Z"
        fill={`url(#${id}-f)`}
      />
      <path d="M282 216 C290 206 350 206 358 216 C348 232 292 232 282 216 Z" fill="#5b2c51" />

      <path d={body} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <rect x="180" y="200" width="280" height="780" fill={`url(#${id}-s)`} opacity="0.55" />
        <rect x="180" y="200" width="280" height="780" fill={`url(#${id}-v)`} />
        {/* asymmetric drape across the bodice */}
        <path
          d="M356 300 C322 340 296 392 282 456 C270 512 264 570 262 620 C286 610 306 590 316 560 C328 524 340 460 352 402 C360 362 362 330 356 300 Z"
          fill="#000"
          opacity="0.24"
        />
        <path
          d="M352 306 C322 344 300 392 288 450"
          fill="none"
          stroke="#c98fb8"
          strokeWidth="1.6"
          opacity="0.3"
        />
        <Folds
          color="#000"
          opacity="0.26"
          lines={[
            'M268 470 C252 530 234 640 214 810 C210 860 206 900 204 930',
            'M300 476 C288 560 274 690 264 860 C262 900 260 930 258 946',
            'M340 470 C350 560 360 690 366 860 C368 900 370 930 372 946',
            'M376 462 C388 540 404 660 420 820 C424 868 428 904 430 930',
          ]}
        />
        <Folds
          color="#c98fb8"
          width="0.9"
          opacity="0.18"
          lines={['M284 474 C272 560 258 690 248 860', 'M356 470 C366 560 376 690 382 860']}
        />
      </g>
      <path d={body} fill="none" stroke="#150815" strokeWidth="1.4" opacity="0.6" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   8 — Champagne Asymmetric Ruffle  ·  silk georgette & organza
   ═══════════════════════════════════════════════════════════════════ */
function ChampagneRuffle({ id }) {
  const body =
    'M258 246 C250 288 246 322 250 358 C254 398 262 422 256 452 ' +
    'C246 500 242 558 246 660 C250 762 254 856 258 936 ' +
    'C300 950 340 950 382 936 C384 856 386 762 388 660 ' +
    'C390 558 386 500 376 452 C370 422 378 398 382 358 ' +
    'C386 322 382 288 374 246 C354 260 336 252 320 240 ' +
    'C304 252 278 262 258 246 Z';
  const ruffle =
    'M382 250 C416 268 442 320 452 386 C464 462 466 560 456 656 ' +
    'C446 752 424 850 396 942 C410 918 424 866 434 792 ' +
    'C444 714 444 606 434 512 C424 420 400 336 372 288 Z';
  const clip = `${id}-c`;

  return (
    <>
      <defs>
        <linearGradient id={`${id}-f`} x1="0%" y1="0%" x2="100%" y2="6%">
          <stop offset="0%" stopColor="#9c8250" />
          <stop offset="18%" stopColor="#cdb078" />
          <stop offset="42%" stopColor="#f2e2bd" />
          <stop offset="66%" stopColor="#d3b981" />
          <stop offset="100%" stopColor="#8d7444" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9ab6f" stopOpacity="0.15" />
          <stop offset="45%" stopColor="#fff6e2" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#b8995c" stopOpacity="0.3" />
        </linearGradient>
        {useClip(clip, body)}
      </defs>

      <path d={body} fill={`url(#${id}-f)`} />
      <g clipPath={`url(#${clip})`}>
        <Folds
          color="#7d6636"
          opacity="0.24"
          lines={[
            'M280 320 C274 440 272 580 276 760 C278 850 280 906 282 944',
            'M340 320 C346 440 350 580 352 760 C354 850 354 906 354 944',
          ]}
        />
        <Folds
          color="#fff8e8"
          width="1"
          opacity="0.34"
          lines={['M302 320 C298 440 296 580 300 760 C302 850 304 906 306 944']}
        />
      </g>
      <path d={body} fill="none" stroke="#7d6636" strokeWidth="1.3" opacity="0.55" />

      {/* hand-rolled organza ruffle sweeping shoulder to floor */}
      <path d={ruffle} fill={`url(#${id}-r)`} />
      <path
        d="M382 250 C416 268 442 320 452 386 C464 462 466 560 456 656 C446 752 424 850 396 942"
        fill="none"
        stroke="#fff6e2"
        strokeWidth="2.2"
        opacity="0.7"
      />
      <path
        d="M372 288 C400 336 424 420 434 512 C444 606 444 714 434 792 C424 866 410 918 396 942"
        fill="none"
        stroke="#a98d55"
        strokeWidth="1.1"
        opacity="0.5"
      />
      <Folds
        color="#fff6e2"
        opacity="0.42"
        width="1.2"
        lines={[
          'M392 262 C424 300 442 380 448 470 C456 590 442 730 416 900',
          'M382 276 C410 320 426 400 432 490 C440 600 428 740 404 920',
        ]}
      />
    </>
  );
}

/* ── Public registry ────────────────────────────────────────────────── */

const RENDERERS = {
  'noir-slip': NoirSlip,
  'ivory-aframe': IvoryAFrame,
  'emerald-column': EmeraldColumn,
  'blush-tulle': BlushTulle,
  'gowned-sequin': GildedSheath,
  'charcoal-cape': CharcoalCape,
  'plum-halter': PlumHalter,
  'champagne-ruffle': ChampagneRuffle,
};

export const DRESS_KEYS = Object.keys(RENDERERS);

/**
 * Renders a dress cut-out. `uid` must be stable & unique per mounted
 * instance — gradient ids are global in the document.
 */
export function DressVector({ dressKey, uid = 'd' }) {
  const Render = RENDERERS[dressKey] || NoirSlip;
  return (
    <svg
      viewBox={`0 0 ${DRESS_VIEWBOX.w} ${DRESS_VIEWBOX.h}`}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Gown cut-out"
    >
      <Render id={uid} />
    </svg>
  );
}
