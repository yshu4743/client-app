import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Catalog from './components/Catalog.jsx';
import BagDrawer from './components/BagDrawer.jsx';
import FittingRoom from './components/FittingRoom.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import Checkout from './components/Checkout.jsx';
import Footer from './components/Footer.jsx';
import { MaisonSection, StudioSection, Ticker, Newsletter } from './components/Sections.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { useCatalog, useCatalogFilter } from './hooks/useCatalog.js';
import { IconAlert } from './components/Icons.jsx';
import './styles/global.css';
import './App.css';

const scrollToCollection = (filter) => {
  const el = document.getElementById('collection');
  if (!el) return;
  if (filter) {
    window.dispatchEvent(new CustomEvent('aura:filter', { detail: filter }));
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function Storefront() {
  const { products, meta, state, error, offline } = useCatalog();
  const filter = useCatalogFilter(products);

  const [bagOpen, setBagOpen] = useState(false);
  const [tryOn, setTryOn] = useState(null); // product object
  const [detail, setDetail] = useState(null);
  const [view, setView] = useState('home'); // home | checkout

  /* Deep-link the category from the header nav. */
  useEffect(() => {
    const onFilter = (e) => filter.setCategory(e.detail);
    window.addEventListener('aura:filter', onFilter);
    return () => window.removeEventListener('aura:filter', onFilter);
  }, [filter]);

  /* Scroll to top whenever we change view. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [view]);

  const openTryOn = useCallback((product) => {
    setDetail(null);
    setTryOn(product || products[0] || null);
  }, [products]);

  const goCheckout = useCallback(() => {
    setBagOpen(false);
    setView('checkout');
  }, []);

  if (view === 'checkout') {
    return (
      <Checkout
        onExit={() => setView('home')}
        onBrowse={() => {
          setView('home');
          window.setTimeout(scrollToCollection, 60);
        }}
      />
    );
  }

  return (
    <>
      <a className="skip-link" href="#collection">
        Skip to the collection
      </a>

      <Header
        onOpenBag={() => setBagOpen(true)}
        onOpenTryOn={() => openTryOn()}
        onJump={scrollToCollection}
      />

      <main id="main">
        <Hero onOpenTryOn={() => openTryOn()} onBrowse={() => scrollToCollection()} />

        <Ticker />

        {state === 'loading' ? (
          <div className="app-loading" role="status">
            <span className="spinner" />
            <p>Opening the atelier…</p>
          </div>
        ) : (
          <>
            {offline && (
              <div className="app-notice" role="status">
                <IconAlert width={16} height={16} />
                <span>
                  The atelier service is unreachable
                  {error?.message ? ` (${error.message})` : ''}. Showing the
                  fallback catalogue — the bag and checkout still work.
                </span>
              </div>
            )}

            <Catalog
              products={products}
              filter={filter}
              meta={meta}
              onOpenTryOn={openTryOn}
              onOpenDetail={setDetail}
              onShopCouture={() => openTryOn()}
            />

            <StudioSection onOpenTryOn={() => openTryOn()} />

            <MaisonSection />

            <Newsletter />
          </>
        )}
      </main>

      <Footer />

      {/* ── Overlays ─────────────────────────────────────────────────── */}
      <BagDrawer
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        onCheckout={goCheckout}
      />

      {tryOn && (
        <FittingRoom
          products={products}
          initial={tryOn}
          onClose={() => setTryOn(null)}
          onOpenBag={() => {
            setTryOn(null);
            setBagOpen(true);
          }}
        />
      )}

      {detail && (
        <ProductDetail
          product={detail}
          onClose={() => setDetail(null)}
          onTryOn={openTryOn}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Storefront />
    </CartProvider>
  );
}
