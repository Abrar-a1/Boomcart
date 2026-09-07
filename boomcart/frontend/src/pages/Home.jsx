import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiArrowRight, FiTruck, FiShield, FiStar } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/product/ProductCard';
import ProductFilters from '../components/product/ProductFilters';
import { Pagination } from '../components/common/Loader';
import productService from '../services/productService';

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

  const SkeletonCard = () => (
    <div className="flex flex-col gap-4">
      <div className="skeleton w-full aspect-[4/5] rounded-sm" />
      <div>
        <div className="skeleton h-3 w-1/2 mb-2 rounded-sm" />
        <div className="skeleton h-4 w-3/4 mb-3 rounded-sm" />
        <div className="skeleton h-4 w-1/3 rounded-sm" />
      </div>
    </div>
  );

  return (
    <div className="w-full bg-[var(--color-background)] min-h-screen">
      <Helmet>
        <title>Boomcart — Modern Indian Timeless Luxury</title>
        <meta name="description" content="Premium Indian fashion for Men, Women, Kids & Bridal. Discover curated collections at Boomcart." />
      </Helmet>

      {/* ── HERO SECTION ── */}
      {!hasFilters && (
        <section className="mb-20 lg:mb-32">
          <div className="max-w-[1440px] mx-auto lg:px-12 flex flex-col-reverse lg:flex-row lg:h-[70vh] lg:min-h-[600px] border-b border-[var(--color-border-light)] lg:border-none">
            
            {/* Left Content (Text) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:pr-20 xl:pr-32 animate-slide-in">
              <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-dark)] mb-6">
                The Heritage Collection
              </span>
              <h1 className="font-heading text-5xl lg:text-7xl font-bold text-[var(--color-primary)] leading-[1.05] mb-8">
                Timeless Indian Elegance.
              </h1>
              <p className="font-body text-base lg:text-lg text-[var(--color-text)] opacity-80 leading-relaxed mb-10 max-w-[480px]">
                Discover unparalleled craftsmanship in our curated selection of bridal couture, tailored suits, and modern fusion wear.
              </p>
              <div>
                <button
                  onClick={() => navigate('/bridal')}
                  className="inline-flex items-center gap-4 px-10 py-4 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:bg-[var(--color-cta-dark)] focus-visible:outline"
                >
                  Explore Bridal <FiArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Content (Image) */}
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-full relative overflow-hidden">
              <img
                src="/images/bridal-hero.png"
                alt="Bridal Couture"
                className="w-full h-full object-cover object-top hover-soft-scale"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST BANNER ── */}
      {!hasFilters && (
        <section className="mb-20 lg:mb-32 max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-y border-[var(--color-border-light)] animate-smooth-reveal">
            <div className="flex flex-col items-center text-center gap-3">
              <FiTruck size={28} className="text-[var(--color-accent)]" />
              <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">Global Delivery</h3>
              <p className="font-body text-sm text-[var(--color-text-muted)] max-w-[240px]">Secure, tracked shipping worldwide on all luxury orders.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <FiShield size={28} className="text-[var(--color-accent)]" />
              <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">Secure Payments</h3>
              <p className="font-body text-sm text-[var(--color-text-muted)] max-w-[240px]">Fully encrypted transactions for your peace of mind.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <FiStar size={28} className="text-[var(--color-accent)]" />
              <h3 className="font-heading text-xl font-bold text-[var(--color-primary)]">Premium Quality</h3>
              <p className="font-body text-sm text-[var(--color-text-muted)] max-w-[240px]">Handcrafted fabrics and meticulous tailoring guaranteed.</p>
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORY NAVIGATION ── */}
      {!hasFilters && (
        <section className="mb-20 lg:mb-32 max-w-[1440px] mx-auto px-6 lg:px-12 animate-smooth-reveal">
          <div className="mb-12">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] text-center">Curated Collections</h2>
            <div className="flex items-center justify-center gap-4 mt-6 w-[200px] mx-auto">
              <div className="h-[1px] flex-1 bg-[var(--color-accent)] opacity-40" />
              <span className="text-[var(--color-accent)] text-xs">❖</span>
              <div className="h-[1px] flex-1 bg-[var(--color-accent)] opacity-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={() => navigate('/?category=women')} className="group relative aspect-[4/5] rounded-sm overflow-hidden bg-[var(--color-border-light)] text-left">
              <img src="/images/category-women.png" alt="Women" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-heading text-3xl text-white mb-2">Women</h3>
                <span className="font-body text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-[var(--color-accent)] transition-colors">Shop Now</span>
              </div>
            </button>
            <button onClick={() => navigate('/?category=men')} className="group relative aspect-[4/5] rounded-sm overflow-hidden bg-[var(--color-border-light)] text-left">
              <img src="/images/category-men.png" alt="Men" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-heading text-3xl text-white mb-2">Men</h3>
                <span className="font-body text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-[var(--color-accent)] transition-colors">Shop Now</span>
              </div>
            </button>
            <button onClick={() => navigate('/kids')} className="group relative aspect-[4/5] rounded-sm overflow-hidden bg-[var(--color-border-light)] text-left">
              <img src="/images/kids-hero.png" alt="Kids" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-heading text-3xl text-white mb-2">Kids</h3>
                <span className="font-body text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-[var(--color-accent)] transition-colors">Shop Now</span>
              </div>
            </button>
            <button onClick={() => navigate('/bridal')} className="group relative aspect-[4/5] rounded-sm overflow-hidden bg-[var(--color-border-light)] text-left">
              <img src="/images/bridal-hero.png" alt="Bridal" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="font-heading text-3xl text-white mb-2">Bridal</h3>
                <span className="font-body text-xs font-bold uppercase tracking-widest text-white/80 group-hover:text-[var(--color-accent)] transition-colors">Explore</span>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ── FEATURED BESTSELLERS ── */}
      {!hasFilters && featured.length > 0 && (
        <section className="mb-20 lg:mb-32 max-w-[1440px] mx-auto px-6 lg:px-12 animate-smooth-reveal">
          <div className="mb-12">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] text-center">Featured Pieces</h2>
            <div className="flex items-center justify-center gap-4 mt-6 w-[200px] mx-auto">
              <div className="h-[1px] flex-1 bg-[var(--color-accent)] opacity-40" />
              <span className="text-[var(--color-accent)] text-xs">❖</span>
              <div className="h-[1px] flex-1 bg-[var(--color-accent)] opacity-40" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {featured.slice(0, 8).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCT CATALOG ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-20 animate-smooth-reveal">
        
        {hasFilters && (
          <div className="mb-12">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)]">Collection</h2>
            <p className="font-body text-sm text-[var(--color-text-muted)] mt-2">
              {loading ? 'Loading...' : `Showing ${products.length} of ${totalProducts} pieces`}
            </p>
          </div>
        )}

        <div className="flex gap-12 items-start">
          
          {/* Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-28 border-r border-[var(--color-border-light)] pr-8">
            <ProductFilters />
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            
            {/* Mobile Filter Trigger */}
            <div className="lg:hidden flex justify-between items-center mb-8 border-b border-[var(--color-border-light)] pb-4">
              <span className="font-body text-sm font-semibold text-[var(--color-text)]">
                {products.length} Results
              </span>
              <button
                onClick={() => setMobileFilter(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-xs font-bold uppercase tracking-widest rounded-sm"
              >
                <FiFilter size={14} /> Filter
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[var(--color-border-light)] rounded-sm text-[var(--color-primary)]">
                  <FiFilter size={24} />
                </div>
                <h3 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-4">No pieces found</h3>
                <p className="font-body text-base text-[var(--color-text-muted)] max-w-[400px] mx-auto mb-8">
                  We couldn't find any pieces matching your refined criteria.
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  >
                    <FiX size={14} /> Clear Refinements
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                <div className="mt-16">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── MOBILE FILTER DRAWER ── */}
      {mobileFilter && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-black/40 z-[100]" onClick={() => setMobileFilter(false)} />
          <div className="fixed inset-y-0 right-0 w-[300px] bg-[var(--color-background)] z-[110] flex flex-col shadow-xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
              <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">Refine</span>
              <button onClick={() => setMobileFilter(false)} className="text-[var(--color-primary)] hover:opacity-80">
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ProductFilters onClose={() => setMobileFilter(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
