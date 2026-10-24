/* ============================================================================
   AURA BOUTIQUE — Figure Silhouette
   ----------------------------------------------------------------------------
   A stylised couture form, drawn in the same 640 × 1000 garment frame as the
   dress vectors so a figure and a gown can be layered without any registration
   drift. Used for catalogue imagery and for the Virtual Dressing Room's
   camera-free "Studio Mode".
   ========================================================================== */

const HEAD = (
  <>
    <ellipse cx="320" cy="112" rx="33" ry="41" />
    <path d="M287 108 C288 74 304 58 320 58 C336 58 352 74 353 108 C346 88 336 78 320 78 C304 78 294 88 287 108 Z" />
  </>
);

/* Torso + legs, hips at y ≈ 470, feet at y ≈ 1000. */
const BODY =
  'M288 152 C288 172 282 186 268 196 C246 210 234 236 232 268 ' +
  'C230 300 238 340 250 372 C260 400 266 424 264 452 ' +
  'C262 486 254 512 248 548 C238 606 230 690 226 782 ' +
  'C222 866 220 940 222 996 L286 996 C288 940 292 872 296 800 ' +
  'C300 728 306 660 312 606 C316 570 320 540 320 508 ' +
  'C320 540 324 570 328 606 C334 660 340 728 344 800 ' +
  'C348 872 352 940 354 996 L418 996 C420 940 418 866 414 782 ' +
  'C410 690 402 606 392 548 C386 512 378 486 376 452 ' +
  'C374 424 380 400 390 372 C402 340 410 300 408 268 ' +
  'C406 236 394 210 372 196 C358 186 352 172 352 152 Z';

const ARM_L =
  'M262 202 C238 224 224 268 220 318 C216 366 222 414 232 456 ' +
  'C238 484 248 506 258 518 C266 500 268 472 264 442 ' +
  'C256 396 254 350 258 306 C262 266 270 234 280 210 Z';
const ARM_R =
  'M378 202 C402 224 416 268 420 318 C424 366 418 414 408 456 ' +
  'C402 484 392 506 382 518 C374 500 372 472 376 442 ' +
  'C384 396 386 350 382 306 C378 266 370 234 360 210 Z';

export function FigureSilhouette({
  uid = 'fig',
  tone = 'stone',
  opacity = 1,
  className,
}) {
  const fills = {
    stone: { base: '#ded3c1', light: '#f0e8db', deep: '#c2b49d', edge: '#b0a189' },
    ink: { base: '#2b2825', light: '#4a443d', deep: '#141210', edge: '#0c0b0a' },
    porcelain: { base: '#f6f1e8', light: '#fffdf9', deep: '#d9d0c0', edge: '#c4b9a5' },
  }[tone] || {};

  return (
    <svg
      viewBox="0 0 640 1000"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      opacity={opacity}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fills.deep} />
          <stop offset="22%" stopColor={fills.base} />
          <stop offset="44%" stopColor={fills.light} />
          <stop offset="72%" stopColor={fills.base} />
          <stop offset="100%" stopColor={fills.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-h`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fills.light} />
          <stop offset="100%" stopColor={fills.base} />
        </linearGradient>
      </defs>

      <g fill={`url(#${uid}-g)`}>
        <path d={ARM_L} />
        <path d={ARM_R} />
        <path d={BODY} />
      </g>
      <g fill={`url(#${uid}-h)`} stroke={fills.edge} strokeWidth="1">
        {HEAD}
      </g>
      <path
        d="M310 148 C314 156 326 156 330 148"
        fill="none"
        stroke={fills.edge}
        strokeWidth="1.4"
        opacity="0.7"
      />
      {/* soft key light down the left of the form */}
      <g fill="#fff" opacity="0.16">
        <ellipse cx="272" cy="330" rx="26" ry="130" />
        <ellipse cx="248" cy="700" rx="18" ry="180" />
      </g>
    </svg>
  );
}
