import { IconArrowRight } from './Icons.jsx';
import './Footer.css';

const COLUMNS = [
  {
    title: 'Collections',
    links: ['Evening', 'Bridal', 'Couture', 'Occasion', 'Ready-to-wear'],
  },
  {
    title: 'Maison',
    links: ['Our ateliers', 'Sustainability', 'The journal', 'Careers', 'Press'],
  },
  {
    title: 'Client services',
    links: [
      'Book a fitting',
      'Alterations',
      'Shipping & duties',
      'Returns',
      'Contact us',
    ],
  },
];

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="shell ftr__top">
        <div className="ftr__brand">
          <p className="ftr__logo">AURA</p>
          <p className="ftr__tag">
            A maison of eight dresses
            <br />
            and one stubborn idea.
          </p>
          <div className="ftr__contact">
            <a href="mailto:atelier@auraboutique.com">atelier@auraboutique.com</a>
            <a href="tel:+12125550198">+1 212 555 0198</a>
          </div>
        </div>

        <div className="ftr__cols">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="ftr__coltitle">{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#collection" className="ftr__link">
                      {l}
                      <IconArrowRight width={13} height={13} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="shell ftr__bar">
        <p>© {new Date().getFullYear()} AURA Boutique. Demonstration experience.</p>
        <ul className="ftr__legal">
          <li>
            <a href="#top">Privacy</a>
          </li>
          <li>
            <a href="#top">Terms</a>
          </li>
          <li>
            <a href="#top">Accessibility</a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
