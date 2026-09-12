import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';
import PageContainer from '../../components/common/PageContainer';

export default function KidsCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productService.getProducts({ category: 'kids' })
      .then((res) => {
        const data = res.data.data || res.data.products || [];
        setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load products');
      })
      .finally(() => setLoading(false));
  }, []);

  // Also fetch boys & girls to combine into kids
  useEffect(() => {
    Promise.all([
      productService.getProducts({ category: 'boys' }),
      productService.getProducts({ category: 'girls' }),
    ])
      .then(([boysRes, girlsRes]) => {
        const boys = boysRes.data.data || boysRes.data.products || [];
        const girls = girlsRes.data.data || girlsRes.data.products || [];
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const newProducts = [...boys, ...girls].filter(p => !existingIds.has(p._id));
          return [...prev, ...newProducts];
        });
      })
      .catch(() => {});
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
      <Helmet><title>Kids Collection — Boomcart</title></Helmet>

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden min-h-[400px] bg-[var(--color-background)] flex items-center">
        <img
          src="/images/kids-hero.png"
          alt="Kids Collection"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        {/* Dark scrim for legibility matching Home */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:from-black/70 lg:via-black/20 lg:to-transparent" />

        {/* Decorative floating elements */}
        <div className="animate-float absolute top-5 right-16 text-4xl opacity-20">🧸</div>
        <div className="animate-float absolute bottom-8 left-10 text-3xl opacity-15" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="animate-float absolute top-1/2 right-[15%] text-2xl opacity-15" style={{ animationDelay: '2s' }}>🎈</div>

        <PageContainer className="relative z-10 py-16">
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="text-white hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1">
              <FiArrowLeft size={14} /> Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white/90 font-semibold">Kids</span>
          </nav>

          <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-6 bg-black/30 px-4 py-2 backdrop-blur-sm rounded-sm border border-white/20">
            For Little Ones
          </span>
          <h1 className="font-heading text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 drop-shadow-lg">
            Kids Collection
          </h1>
          <p className="text-base text-white/90 max-w-[440px] leading-[1.7] mb-8 drop-shadow-sm font-medium">
            Durable, colorful, and fun fabrics for your little ones. Explore playful styles designed for comfort and adventure.
          </p>
        </PageContainer>
      </section>

      {/* ── Products Grid ── */}
      <PageContainer className="py-12 lg:py-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border-light)]">
          <h2 className="font-heading" style={{ fontSize: '24px', color: '#1E3A3A', fontWeight: 700, margin: 0 }}>
            All Kids Products
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7c6e', fontWeight: 500, margin: 0 }}>
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-6 2xl:gap-8">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div style={{ borderRadius: '12px', padding: '24px', textAlign: 'center', backgroundColor: '#fde8e4', color: '#B85C4B', border: '1px solid #B85C4B' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{error}</p>
            <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>Make sure the backend server is running on port 5000.</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #f0e8da' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <span style={{ fontSize: '36px' }}>👧</span>
            </div>
            <h3 className="font-heading" style={{ fontSize: '24px', color: '#1E3A3A', fontWeight: 700, marginBottom: '8px' }}>No kids clothes found</h3>
            <p style={{ fontSize: '15px', color: '#6b7c6e', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              Check back soon for new arrivals!
            </p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 700, backgroundColor: '#C25A3C', color: '#fff', transition: 'all 0.3s' }}>
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
