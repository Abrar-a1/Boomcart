import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiArrowRight, FiChevronRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import { Pagination } from '../components/common/Loader';
import productService from '../services/productService';

/* ─────────────────────────────────────────────────────── */
/*  SHOP-BY-CATEGORY DATA                                  */
/* ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Men',    href: '/?category=men',   gradient: 'linear-gradient(145deg, #1E3A3A 0%, #2a5050 100%)',   textColor: '#fff' },
  { label: 'Women',  href: '/?category=women', gradient: 'linear-gradient(145deg, #C25A3C 0%, #d47a62 100%)',   textColor: '#fff' },
  { label: 'Kids',   href: '/kids',            gradient: 'linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 100%)',   textColor: '#1E3A3A' },
  { label: 'Bridal', href: '/bridal',          gradient: 'linear-gradient(145deg, #D4AF37 0%, #e8c84a 100%)',   textColor: '#1E3A3A' },
];

export default function Home() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const hasFilters = [...params.keys()].length > 0;

  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFilter, setMobileFilter] = useState(false);

  useEffect(() => {
    productService.getProducts({ isFeatured: true, limit: 8 })
      .then(res => { setFeatured(res.data.data || res.data.products || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const filters = Object.fromEntries(params.entries());
    filters.page = page;
    filters.limit = 12;
    productService.getProducts(filters)
      .then(res => {
        const d = res.data;
        setProducts(d.data || d.products || []);
        setTotalPages(d.totalPages || d.pages || 1);
        setTotalProducts(d.total || d.totalProducts || (d.data || d.products || []).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params, page]);

  const clearFilters = () => { setParams({}); };

  /* ── Skeleton loader ── */
  const SkeletonCard = () => (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0e8da', overflow: 'hidden' }}>
      <div className="skeleton" style={{ width: '100%', aspectRatio: '4/5' }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '4px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '4px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '999px' }} />
      </div>
    </div>
  );

  const getBannerGradientAndText = () => {
    const category = params.get('category');
    const isFeatured = params.get('isFeatured');
    const keyword = params.get('keyword');
    const subCategory = params.get('subCategory');

    if (category === 'men') {
      return {
        title: "Men's Collection",
        subTitle: "Sophisticated Styles",
        description: "Explore our collection of contemporary kurtas, sherwanis, formal jackets, and everyday wear crafted for modern men.",
        image: "/images/category-men.png",
        titleColor: '#1E3A3A',
        subColor: '#C25A3C',
        textColor: '#2C3E2F',
        icon: '👔'
      };
    }
    if (category === 'women') {
      return {
        title: "Women's Collection",
        subTitle: "Elegant & Graceful",
        description: "Discover stunning tailored suits, designer lehengas, and modern fusion wear designed to express absolute elegance.",
        image: "/images/category-women.png",
        titleColor: '#1E3A3A',
        subColor: '#C25A3C',
        textColor: '#2C3E2F',
        icon: '👗'
      };
    }
    if (isFeatured === 'true') {
      return {
        title: "Exclusive Sale",
        subTitle: "Limited Time Offers",
        description: "Upgrade your wardrobe with premium apparel at special values. Shop selected bestsellers and modern couture today.",
        gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
        titleColor: '#1E3A3A',
        subColor: '#C25A3C',
        textColor: '#2C3E2F',
        icon: '✨'
      };
    }
    if (keyword) {
      return {
        title: `Search Results`,
        subTitle: "Finding items",
        description: `Showing products matching your search term: "${keyword}". Explore the curated list below.`,
        gradient: 'linear-gradient(135deg, #F5F0EB 0%, #EDE4D9 100%)',
        titleColor: '#1E3A3A',
        subColor: '#6b7c6e',
        textColor: '#2C3E2F',
        icon: '🔍'
      };
    }
    if (subCategory) {
      return {
        title: `${subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}`,
        subTitle: "Curated Styles",
        description: `Premium selected styles under the ${subCategory} collection, designed with maximum comfort and style in mind.`,
        gradient: 'linear-gradient(135deg, #F5F0EB 0%, #EDE4D9 100%)',
        titleColor: '#1E3A3A',
        subColor: '#D4AF37',
        textColor: '#2C3E2F',
        icon: '✨'
      };
    }
    return {
      title: "Our Collection",
      subTitle: "Curated Fashion",
      description: "Discover our full range of signature Indian fashion and designer couture at Boomcart.",
      gradient: 'linear-gradient(135deg, #F5F0EB 0%, #EDE4D9 100%)',
      titleColor: '#1E3A3A',
      subColor: '#D4AF37',
      textColor: '#2C3E2F',
      icon: '📦'
    };
  };

  return (
    <div className="w-full page-transition">
      <Helmet>
        <title>Boomcart — Discover Your Style</title>
        <meta name="description" content="Premium Indian fashion for Men, Women, Kids & Bridal. Discover curated collections at Boomcart." />
      </Helmet>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══  FILTER/CATEGORY HEADER BANNER  ══════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {hasFilters && (() => {
        const banner = getBannerGradientAndText();
        return (
          <section style={{ marginBottom: '40px' }}>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                padding: '48px 32px',
                position: 'relative',
                background: banner.image ? 'none' : banner.gradient,
                backgroundColor: banner.image ? '#F5F0EB' : 'transparent',
                border: '1.5px solid #E5D9C5',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                minHeight: '220px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {banner.image && (
                <img
                  src={banner.image}
                  alt={banner.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', pointerEvents: 'none' }}
                />
              )}
              {/* Overlay */}
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: banner.image 
                    ? 'linear-gradient(to right, rgba(253,247,240,0.95) 0%, rgba(253,247,240,0.85) 50%, rgba(253,247,240,0.2) 100%)' 
                    : 'none' 
                }} 
              />

              {/* Background design accents */}
              {!banner.image && (
                <div style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '36px', opacity: 0.15, pointerEvents: 'none' }}>
                  {banner.icon}
                </div>
              )}
              
              <div style={{ position: 'relative', zIndex: 10 }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: banner.subColor, marginBottom: '12px' }}>
                  {banner.subTitle}
                </span>
                <h1 className="font-heading" style={{ fontSize: '42px', fontWeight: 700, color: banner.titleColor, lineHeight: 1.1, marginBottom: '16px' }}>
                  {banner.title}
                </h1>
                <p style={{ fontSize: '15px', color: banner.textColor, opacity: 0.8, maxWidth: '480px', lineHeight: 1.7, margin: 0 }}>
                  {banner.description}
                </p>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══  HERO BANNERS  ═══════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {!hasFilters && (
        <section style={{ marginBottom: '56px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

            {/* ── KIDS BANNER ── */}
            <div
              onClick={() => navigate('/kids')}
              className="group"
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E5D9C5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                minHeight: '300px',
                transition: 'all 0.4s ease',
              }}
            >
              {/* Background image */}
              <img
                src="/images/kids-hero.png"
                alt="Kids Collection"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                className="group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,248,240,0.93) 0%, rgba(255,248,240,0.78) 50%, rgba(255,248,240,0.25) 100%)' }} />

              {/* Content — box model: each child has its own margin */}
              <div style={{ position: 'relative', zIndex: 10, padding: '40px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
                  Collection
                </span>
                <h2 className="font-heading" style={{ fontSize: '42px', color: '#1E3A3A', lineHeight: 1.1, marginBottom: '16px' }}>
                  Playful Kids
                </h2>
                <p style={{ color: '#2C3E2F', fontSize: '15px', maxWidth: '280px', lineHeight: 1.7, opacity: 0.75, marginBottom: '28px' }}>
                  Bright colors, comfy fabrics, and endless adventures for your little ones.
                </p>
                <div>
                  <button
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#C25A3C', color: '#fff', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer', minHeight: '48px', boxShadow: '0 4px 12px rgba(194,90,60,0.3)', transition: 'all 0.3s ease' }}
                    className="hover:bg-[#1E3A3A] hover:shadow-lg"
                    onClick={(e) => { e.stopPropagation(); navigate('/kids'); }}
                  >
                    Shop Kids <FiArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── BRIDAL BANNER ── */}
            <div
              onClick={() => navigate('/bridal')}
              className="group"
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E5D9C5',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                minHeight: '300px',
                transition: 'all 0.4s ease',
              }}
            >
              {/* Background image */}
              <img
                src="/images/bridal-hero.png"
                alt="Bridal Couture"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                className="group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(250,245,240,0.94) 0%, rgba(250,245,240,0.8) 50%, rgba(250,245,240,0.2) 100%)' }} />

              {/* Content — box model */}
              <div style={{ position: 'relative', zIndex: 10, padding: '40px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
                  Couture
                </span>
                <h2 className="font-heading" style={{ fontSize: '42px', color: '#1E3A3A', lineHeight: 1.1, marginBottom: '16px' }}>
                  Elegant Bridal
                </h2>
                <p style={{ color: '#2C3E2F', fontSize: '15px', maxWidth: '280px', lineHeight: 1.7, opacity: 0.75, marginBottom: '28px' }}>
                  Reserve your tailored consultation. Luxury has never been this effortless.
                </p>
                <div>
                  <button
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#C25A3C', color: '#fff', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer', minHeight: '48px', boxShadow: '0 4px 12px rgba(194,90,60,0.3)', transition: 'all 0.3s ease' }}
                    className="hover:bg-[#1E3A3A] hover:shadow-lg"
                    onClick={(e) => { e.stopPropagation(); navigate('/bridal'); }}
                  >
                    Enter Boutique <FiArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══  SHOP BY CATEGORY  ═══════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {!hasFilters && (
        <section style={{ marginBottom: '56px' }}>
          {/* Section header — box model */}
          <div style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <h2 className="font-heading" style={{ fontSize: '36px', color: '#1E3A3A', marginBottom: '12px' }}>Shop by Category</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', margin: '0 auto', gap: '12px' }}>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(212,175,55,0.4)' }} />
              <span style={{ fontSize: '10px', color: '#D4AF37' }}>❖</span>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(212,175,55,0.4)' }} />
            </div>
          </div>

          {/* Category cards — grid with box model internal spacing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                onClick={() => navigate(cat.href)}
                className="group"
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: cat.gradient,
                  minHeight: '160px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Content — each text element has its own margin */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative', zIndex: 10 }}>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: cat.textColor, opacity: 0.6, marginBottom: '0' }}>
                    Category
                  </span>
                  <div style={{ marginTop: 'auto' }}>
                    <h3 className="font-heading" style={{ fontSize: '28px', fontWeight: 700, color: cat.textColor, marginBottom: '4px' }}>
                      {cat.label}
                    </h3>
                    <div className="group-hover:gap-2" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: cat.textColor, opacity: 0.8, transition: 'all 0.3s ease' }}>
                      Explore <FiChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══  PROMOTIONAL BANNER  ═════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {!hasFilters && (
        <section style={{ marginBottom: '56px' }}>
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              textAlign: 'center',
              padding: '48px 24px',
              position: 'relative',
              background: 'linear-gradient(135deg, #1E3A3A 0%, #2a5050 60%, #1E3A3A 100%)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 1px, transparent 1px), radial-gradient(circle at 80% 20%, #D4AF37 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            {/* Content — box model: each child spaced by margin */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '12px' }}>
                Limited Time
              </span>
              <h2 className="font-heading" style={{ fontSize: '48px', color: '#ffffff', marginBottom: '12px' }}>
                Summer Sale
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', fontWeight: 500, marginBottom: '32px' }}>
                Up to <span style={{ color: '#D4AF37', fontWeight: 700 }}>50% OFF</span> on selected collections
              </p>
              <button
                onClick={() => navigate('/?isFeatured=true')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#D4AF37', color: '#1E3A3A', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: 'pointer', minHeight: '48px', boxShadow: '0 4px 16px rgba(212,175,55,0.4)', transition: 'all 0.3s ease' }}
                className="hover:bg-white hover:shadow-xl"
              >
                Shop Now <FiArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══  FEATURED BESTSELLERS  ═══════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {!hasFilters && featured.length > 0 && (
        <section style={{ marginBottom: '56px' }}>
          {/* Section header — box model */}
          <div style={{ textAlign: 'center', paddingBottom: '32px' }}>
            <h2 className="font-heading" style={{ fontSize: '36px', color: '#1E3A3A', marginBottom: '12px' }}>Featured Bestsellers</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', margin: '0 auto', gap: '12px' }}>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(212,175,55,0.4)' }} />
              <span style={{ fontSize: '10px', color: '#D4AF37' }}>❖</span>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(212,175,55,0.4)' }} />
            </div>
          </div>
          {/* Products grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {featured.slice(0, 8).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══  PRODUCT CATALOG  ════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        {/* Catalog layout — sidebar + grid using box model */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* ── Filter Sidebar — Desktop ── */}
          <aside className="hidden lg:block" style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '96px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1.5px solid #E5D9C5', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
              <ProductFilters />
            </div>
          </aside>

          {/* ── Products Grid ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header row — box model */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px', marginBottom: '24px', borderBottom: '1px solid #E5D9C5' }}>
              <div>
                <h2 className="font-heading" style={{ fontSize: '36px', color: '#1E3A3A', lineHeight: 1.1, marginBottom: '8px' }}>
                  {hasFilters ? 'Results' : 'All Products'}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7c6e', fontWeight: 500, margin: 0 }}>
                  {loading ? 'Loading...' : `Showing ${products.length} of ${totalProducts} products`}
                </p>
              </div>
              <button
                className="lg:hidden"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#1E3A3A', color: '#fff', borderRadius: '999px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', minHeight: '44px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                onClick={() => setMobileFilter(true)}
              >
                <FiFilter size={14} /> Filters
              </button>
            </div>

            {/* Products */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              /* ── Empty state — box model: each element has explicit margin ── */
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #E5D9C5',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                textAlign: 'center',
                padding: '64px 24px',
              }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FDF7F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <span style={{ fontSize: '36px' }}>📦</span>
                </div>
                <h3 className="font-heading" style={{ fontSize: '28px', fontWeight: 700, color: '#1E3A3A', marginBottom: '12px' }}>
                  No Products Found
                </h3>
                <p style={{ color: '#6b7c6e', fontSize: '15px', fontWeight: 500, maxWidth: '360px', margin: '0 auto 32px auto', lineHeight: 1.7 }}>
                  Try adjusting your filters or search terms to discover something amazing.
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#1E3A3A', color: '#fff', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 28px', borderRadius: '999px', border: 'none', cursor: 'pointer', minHeight: '44px', boxShadow: '0 4px 12px rgba(30,58,58,0.2)', transition: 'all 0.3s ease' }}
                    className="hover:bg-[#C25A3C]"
                  >
                    <FiX size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </section>

      {/* ── Mobile filter drawer ── */}
      {mobileFilter && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={() => setMobileFilter(false)}>
          <div
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '300px', maxWidth: '85vw', backgroundColor: '#fff', overflowY: 'auto', boxShadow: '8px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.25s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#1E3A3A', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
              <span className="font-heading" style={{ fontSize: '18px', fontWeight: 700 }}>Filters</span>
              <button onClick={() => setMobileFilter(false)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <FiX size={16} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <ProductFilters onClose={() => setMobileFilter(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
