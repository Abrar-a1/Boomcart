import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';
import PageContainer from '../../components/common/PageContainer';

export default function BridalCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts({ category: 'bridal' })
      .then((res) => {
        setProducts(res.data.data || res.data.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const SkeletonCard = () => (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0e8da', backgroundColor: '#fff' }}>
      <div className="skeleton" style={{ aspectRatio: '4/5' }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '999px' }} />
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[var(--color-background)] min-h-[60vh]">
      <Helmet><title>Bridal & Couture — Boomcart</title></Helmet>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden min-h-[400px] bg-[var(--color-background)] flex items-center">
        <img
          src="/images/bridal-hero.png"
          alt="Bridal Couture"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        {/* Dark scrim for legibility matching Home */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:from-black/70 lg:via-black/20 lg:to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-[var(--color-accent)] opacity-60" />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-r-2 border-b-2 border-[var(--color-accent)] opacity-60" />
        <div className="animate-float absolute top-10 right-20 text-2xl text-[var(--color-accent)] opacity-50">✦</div>
        <div className="animate-float absolute bottom-12 left-16 text-lg text-[var(--color-accent)] opacity-40" style={{ animationDelay: '1.5s' }}>❖</div>

        <PageContainer className="relative z-10 py-16 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm mb-8">
            <Link to="/" className="text-white hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1">
              <FiArrowLeft size={14} /> Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white/90 font-semibold">Bridal</span>
          </nav>

          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-white mb-6 bg-black/30 px-4 py-2 backdrop-blur-sm rounded-sm border border-white/20">
            Couture Collection
          </span>

          <div className="animate-float text-5xl mb-4">💍</div>

          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-[0.1em] uppercase text-white mb-6 drop-shadow-lg">
            Bridal & Couture
          </h1>

          <p className="text-base text-white/90 max-w-[480px] mx-auto leading-[1.7] mb-8 font-medium drop-shadow-sm">
            Handcrafted luxury for your most memorable day. Each piece is designed with love and precision.
          </p>
        </PageContainer>
      </div>

      {/* ── Products Grid ── */}
      <PageContainer className="py-12 lg:py-16">
        {/* Product count header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #E5D9C5' }}>
          <h2 className="font-heading" style={{ fontSize: '24px', color: '#1E3A3A', fontWeight: 700, margin: 0 }}>
            All Bridal Products
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7c6e', fontWeight: 500, margin: 0 }}>
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 2xl:gap-8">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[var(--color-border-light)] rounded-sm">
            <div className="w-20 h-20 bg-[var(--color-background)] rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              👰
            </div>
            <h3 className="font-heading text-2xl text-[var(--color-primary)] font-bold mb-2">Bridal collection coming soon</h3>
            <p className="text-[var(--color-text-muted)] max-w-[320px] mx-auto mb-6 leading-[1.6]">
              Our designers are crafting something special for you.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white font-bold text-sm rounded-sm hover:opacity-90 transition-opacity">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 2xl:gap-8">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
