/* AURA BOUTIQUE — hand-drawn-feel line icon set (1.5px stroke, 24px grid) */

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

const Svg = ({ children, ...p }) => (
  <svg {...base} {...p}>
    {children}
  </svg>
);

export const IconBag = (p) => (
  <Svg {...p}>
    <path d="M4.5 7.5h15l-1.1 12.2a1.4 1.4 0 0 1-1.4 1.3H7a1.4 1.4 0 0 1-1.4-1.3L4.5 7.5Z" />
    <path d="M8.75 10V6.75a3.25 3.25 0 0 1 6.5 0V10" />
  </Svg>
);

export const IconClose = (p) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M3.5 7.5h17M3.5 16.5h17" />
  </Svg>
);

export const IconCamera = (p) => (
  <Svg {...p}>
    <path d="M3.5 8.75A1.75 1.75 0 0 1 5.25 7h1.9l1.1-2.1a1 1 0 0 1 .9-.55h5.7a1 1 0 0 1 .9.55L16.85 7h1.9A1.75 1.75 0 0 1 20.5 8.75v8.5A1.75 1.75 0 0 1 18.75 19H5.25a1.75 1.75 0 0 1-1.75-1.75v-8.5Z" />
    <circle cx="12" cy="12.6" r="3.4" />
  </Svg>
);

export const IconShutter = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12.6" r="8.4" />
    <circle cx="12" cy="12.6" r="4.4" />
  </Svg>
);

export const IconFlip = (p) => (
  <Svg {...p}>
    <path d="M4 9.5A8 8 0 0 1 17.5 5.6M20 14.5A8 8 0 0 1 6.5 18.4" />
    <path d="M3.6 4.6v4.9h4.9M20.4 19.4v-4.9h-4.9" />
  </Svg>
);

export const IconSwitchCam = (p) => (
  <Svg {...p}>
    <rect x="3" y="6.5" width="12" height="11" rx="1.6" />
    <path d="m15 10.5 5.2-2.9a.7.7 0 0 1 1.1.6v7.6a.7.7 0 0 1-1.1.6L15 13" />
  </Svg>
);

export const IconSliders = (p) => (
  <Svg {...p}>
    <path d="M4 7.5h11M19 7.5h1M4 16.5h3M11 16.5h9" />
    <circle cx="17" cy="7.5" r="2" />
    <circle cx="9" cy="16.5" r="2" />
  </Svg>
);

export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M12 3.75v10.5M8.25 10.75 12 14.5l3.75-3.75" />
    <path d="M4.75 16.5v1.75a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2V16.5" />
  </Svg>
);

export const IconShare = (p) => (
  <Svg {...p}>
    <circle cx="17.5" cy="5.75" r="2.5" />
    <circle cx="6.5" cy="12" r="2.5" />
    <circle cx="17.5" cy="18.25" r="2.5" />
    <path d="m8.8 10.8 6.4-3.7M8.8 13.2l6.4 3.7" />
  </Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Svg>
);

export const IconMinus = (p) => (
  <Svg {...p}>
    <path d="M5.5 12h13" />
  </Svg>
);

export const IconTrash = (p) => (
  <Svg {...p}>
    <path d="M4.5 6.75h15M9.5 6.75V5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.25" />
    <path d="M6.5 6.75 7.4 19a1.4 1.4 0 0 0 1.4 1.3h6.4a1.4 1.4 0 0 0 1.4-1.3l.9-12.25" />
    <path d="M10.5 10.5v6M13.5 10.5v6" />
  </Svg>
);

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M4.5 12h15M13.5 6.5 20 12l-6.5 5.5" />
  </Svg>
);

export const IconArrowLeft = (p) => (
  <Svg {...p}>
    <path d="M19.5 12h-15M10.5 6.5 4 12l6.5 5.5" />
  </Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m4.75 12.5 4.75 4.75L19.25 7" />
  </Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.75v4.75M12 15.75h.01" />
  </Svg>
);

export const IconLock = (p) => (
  <Svg {...p}>
    <rect x="4.75" y="10.25" width="14.5" height="9.75" rx="1.6" />
    <path d="M8.25 10.25V7.5a3.75 3.75 0 0 1 7.5 0v2.75" />
  </Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m15.75 15.75 4 4" />
  </Svg>
);

export const IconSparkle = (p) => (
  <Svg {...p}>
    <path d="M12 3.5c.9 3.9 2.1 5.1 6 6-3.9.9-5.1 2.1-6 6-.9-3.9-2.1-5.1-6-6 3.9-.9 5.1-2.1 6-6Z" />
    <path d="M18.5 15.5c.35 1.5.8 1.95 2.3 2.3-1.5.35-1.95.8-2.3 2.3-.35-1.5-.8-1.95-2.3-2.3 1.5-.35 1.95-.8 2.3-2.3Z" />
  </Svg>
);

export const IconReset = (p) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20.5 4v4.5H16" />
  </Svg>
);

export const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3.75" y="3.75" width="7" height="7" rx="0.8" />
    <rect x="13.25" y="3.75" width="7" height="7" rx="0.8" />
    <rect x="3.75" y="13.25" width="7" height="7" rx="0.8" />
    <rect x="13.25" y="13.25" width="7" height="7" rx="0.8" />
  </Svg>
);

export const IconStar = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 3.9 2.5 5.15 5.6.78-4.05 4 1 5.62L12 16.8l-5.05 2.65 1-5.62-4.05-4 5.6-.78L12 3.9Z" />
  </Svg>
);
