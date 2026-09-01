import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';

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
    <div style={{ width: '100%', backgroundColor: '#FAF5F0', minHeight: '60vh' }}>
      <Helmet><title>Bridal & Couture — Boomcart</title></Helmet>

      {/* ── Hero Banner — unique bridal luxury design ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '340px',
        backgroundColor: '#FAF5F0',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Background Image */}
        <img
          src="/images/bridal-hero.png"
          alt="Bridal Couture"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
        {/* Gradient overlay to keep text highly readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,14,7,0.75) 0%, rgba(26,14,7,0.85) 100%)' }} />

        {/* Decorative gold corner borders */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', width: '40px', height: '40px', borderLeft: '2px solid #D4AF37', borderTop: '2px solid #D4AF37', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '40px', height: '40px', borderRight: '2px solid #D4AF37', borderBottom: '2px solid #D4AF37', opacity: 0.6 }} />

        {/* Floating sparkles */}
        <div className="animate-float" style={{ position: 'absolute', top: '40px', right: '80px', fontSize: '20px', color: '#D4AF37', opacity: 0.5 }}>✦</div>
        <div className="animate-float" style={{ position: 'absolute', bottom: '48px', left: '60px', fontSize: '16px', color: '#D4AF37', opacity: 0.4, animationDelay: '1.5s' }}>❖</div>

        {/* Content — box model: padding on container, margin on each child */}
        <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '56px 32px 64px 32px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', marginBottom: '32px' }}>
            <Link to="/" style={{ color: '#ffffff', transition: 'color 0.3s', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#ffffff'; }}>
              <FiArrowLeft size={14} /> Home
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Bridal</span>
          </nav>

          {/* Sub-label */}
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '16px' }}>
            Couture Collection
          </span>

          {/* Ring icon */}
          <div className="animate-float" style={{ fontSize: '44px', marginBottom: '16px' }}>💍</div>

          {/* Title */}
          <h1 className="font-heading" style={{ fontSize: '48px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ffffff', marginBottom: '16px' }}>
            Bridal & Couture
          </h1>

          {/* Description */}
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: 1.7 }}>
            Handcrafted luxury for your most memorable day. Each piece is designed with love and precision.
          </p>

          {/* Gold divider */}
          <div style={{ width: '60px', height: '2px', backgroundColor: '#D4AF37', margin: '0 auto' }} />
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 64px 32px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '16px', backgroundColor: '#fff', border: '1px solid #f0e8da' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F5F0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <span style={{ fontSize: '36px' }}>👰</span>
            </div>
            <h3 className="font-heading" style={{ fontSize: '24px', color: '#1E3A3A', fontWeight: 700, marginBottom: '8px' }}>Bridal collection coming soon</h3>
            <p style={{ fontSize: '15px', color: '#6b7c6e', maxWidth: '320px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              Our designers are crafting something special for you.
            </p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 700, backgroundColor: '#1E3A3A', color: '#fff', transition: 'all 0.3s' }}>
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
