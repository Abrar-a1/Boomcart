import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';

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
    <div style={{ width: '100%', backgroundColor: '#FFF8F0', minHeight: '60vh' }}>
      <Helmet><title>Kids Collection — Boomcart</title></Helmet>

      {/* ── Hero Banner — unique kids design with large image background ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '340px',
        backgroundColor: '#FFF8F0',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Background Image */}
        <img
          src="/images/kids-hero.png"
          alt="Kids Collection"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
        {/* Gradient overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,248,240,0.95) 0%, rgba(255,248,240,0.85) 50%, rgba(255,248,240,0.2) 100%)' }} />

        {/* Decorative floating elements */}
        <div className="animate-float" style={{ position: 'absolute', top: '20px', right: '60px', fontSize: '40px', opacity: 0.2 }}>🧸</div>
        <div className="animate-float" style={{ position: 'absolute', bottom: '30px', left: '40px', fontSize: '32px', opacity: 0.15, animationDelay: '1s' }}>⭐</div>
        <div className="animate-float" style={{ position: 'absolute', top: '50%', right: '15%', fontSize: '28px', opacity: 0.15, animationDelay: '2s' }}>🎈</div>

        {/* Content — box model: explicit padding and margin on every child */}
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '56px 32px 64px 32px', position: 'relative', zIndex: 10 }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '24px' }}>
            <Link to="/" style={{ color: '#1E3A3A', transition: 'color 0.3s', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#1E3A3A'; }}>
              <FiArrowLeft size={14} /> Home
            </Link>
            <span style={{ color: '#9eaa9f' }}>/</span>
            <span style={{ color: '#6b7c6e', fontWeight: 600 }}>Kids</span>
          </nav>

          {/* Title block */}
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C25A3C', marginBottom: '12px' }}>
            For Little Ones
          </span>
          <h1 className="font-heading" style={{ fontSize: '48px', fontWeight: 700, color: '#1E3A3A', lineHeight: 1.1, marginBottom: '16px' }}>
            Kids Collection
          </h1>
          <p style={{ fontSize: '16px', color: '#2C3E2F', opacity: 0.75, maxWidth: '420px', lineHeight: 1.7, marginBottom: '20px' }}>
            Durable, colorful, and fun fabrics for your little ones. Explore playful styles designed for comfort and adventure.
          </p>
          <div style={{ width: '60px', height: '3px', backgroundColor: '#D4AF37', borderRadius: '2px' }} />
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 64px 32px' }}>
        {/* Product count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #E5D9C5' }}>
          <h2 className="font-heading" style={{ fontSize: '24px', color: '#1E3A3A', fontWeight: 700, margin: 0 }}>
            All Kids Products
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7c6e', fontWeight: 500, margin: 0 }}>
            {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
