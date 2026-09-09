import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiArrowRight } from 'react-icons/fi';
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
      <div className="skeleton w-full aspect-[3/4] rounded-sm" />
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

      {/* ── HERO CAMPAIGN (10/10 POLISH) ── */}
      {!hasFilters && (
        <section className="relative w-full h-[85vh] min-h-[600px] mb-24 lg:mb-32 overflow-hidden animate-smooth-reveal">
          <div className="absolute inset-0">
            <img
              src="/images/bridal-hero.png"
              alt="Fashion Campaign"
              className="w-full h-full object-cover object-[center_30%] scale-105"
            />
            {/* Extremely subtle gradient for text readability without darkening the whole image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent lg:from-black/50 lg:via-transparent lg:to-transparent" />
          </div>
          
          <div className="relative h-full max-w-[1440px] mx-auto px-6 lg:px-16 flex flex-col justify-center items-start z-10 pt-16">
            <span className="font-body text-[10px] lg:text-xs font-bold uppercase tracking-[0.25em] text-white mb-6 bg-black/20 px-4 py-2 backdrop-blur-sm rounded-sm">
              New Collection
            </span>
            <h1 className="font-heading text-5xl lg:text-8xl text-white font-bold leading-[1.1] mb-6 max-w-[800px] drop-shadow-md">
              Timeless<br />Elegance.
            </h1>
            <p className="font-body text-base lg:text-lg text-white/90 max-w-[480px] mb-12 font-medium drop-shadow-sm leading-relaxed">
              Discover unparalleled craftsmanship in our curated selection of luxury couture and modern fusion wear.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/?category=women')}
                className="px-10 py-4 bg-white text-[var(--color-primary)] font-body text-xs font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-[var(--color-background)] transition-colors focus-visible:outline"
              >
                Shop Women
              </button>
              <button
                onClick={() => navigate('/?isFeatured=true')}
                className="px-10 py-4 bg-transparent border border-white text-white font-body text-xs font-bold uppercase tracking-[0.15em] rounded-sm hover:bg-white/10 transition-colors focus-visible:outline"
              >
                Explore Collection
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS (EDITORIAL GRID) ── */}
      {!hasFilters && featured.length > 0 && (
        <section className="mb-24 lg:mb-32 max-w-[1440px] mx-auto px-6 lg:px-12 animate-smooth-reveal">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-[var(--color-primary)]">New Arrivals</h2>
            </div>
            <button 
              onClick={() => navigate('/?isFeatured=true')}
              className="hidden lg:flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)] underline-hover"
            >
              View All <FiArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-x-10">
            {featured.slice(0, 4).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <div className="mt-10 lg:hidden flex justify-center">
            <button 
              onClick={() => navigate('/?isFeatured=true')}
              className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text)] border-b border-black pb-1"
            >
              View All Arrivals <FiArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* ── SHOP BY CATEGORY (ELEGANT PHOTOGRAPHY) ── */}
      {!hasFilters && (
        <section className="mb-24 lg:mb-40 max-w-[1440px] mx-auto px-6 lg:px-12 animate-smooth-reveal">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-[var(--color-primary)] mb-12">Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            
            <button onClick={() => navigate('/?category=women')} className="group relative aspect-[3/4] md:aspect-square lg:aspect-[4/5] overflow-hidden rounded-sm bg-[var(--color-border-light)] flex flex-col justify-end p-8 lg:p-12 text-left">
              <img src="/images/category-women.png" alt="Women" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />
              <div className="relative z-10">
                <h3 className="font-heading text-4xl lg:text-5xl text-white font-bold mb-3">Women</h3>
                <span className="inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[var(--color-accent)] transition-colors">
                  Shop Now <FiArrowRight size={12} />
                </span>
              </div>
            </button>

            <div className="grid grid-rows-2 gap-4 lg:gap-8">
              <button onClick={() => navigate('/?category=men')} className="group relative overflow-hidden rounded-sm bg-[var(--color-border-light)] flex flex-col justify-end p-8 text-left">
                <img src="/images/category-men.png" alt="Men" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />
                <div className="relative z-10">
                  <h3 className="font-heading text-3xl lg:text-4xl text-white font-bold mb-2">Men</h3>
                  <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[var(--color-accent)] transition-colors">Shop Now</span>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-4 lg:gap-8">
                <button onClick={() => navigate('/kids')} className="group relative overflow-hidden rounded-sm bg-[var(--color-border-light)] flex flex-col justify-end p-6 text-left">
                  <img src="/images/kids-hero.png" alt="Kids" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80" />
                  <div className="relative z-10">
                    <h3 className="font-heading text-2xl lg:text-3xl text-white font-bold mb-2">Kids</h3>
                    <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/90 group-hover:text-[var(--color-accent)] transition-colors">Shop Now</span>
                  </div>
                </button>
                <button onClick={() => navigate('/bridal')} className="group relative overflow-hidden rounded-sm bg-[var(--color-border-light)] flex flex-col justify-end p-6 text-left">
                  <div className="absolute inset-0 bg-[var(--color-primary)] transition-transform duration-1000 ease-out group-hover:scale-105" />
                  <div className="relative z-10">
                    <h3 className="font-heading text-2xl lg:text-3xl text-[var(--color-accent)] font-bold mb-2">Bridal</h3>
                    <span className="font-body text-[10px] font-bold uppercase tracking-widest text-white/90 transition-colors">Explore Edit</span>
                  </div>
                </button>
              </div>
            </div>
            
          </div>
        </section>
      )}

      {/* ── THE BRIDAL EDIT (STANDALONE LUXURY) ── */}
      {!hasFilters && (
        <section className="mb-24 lg:mb-40 animate-smooth-reveal">
          <div className="max-w-[1440px] mx-auto lg:px-12">
            <div className="flex flex-col lg:flex-row bg-[var(--color-primary)] text-[var(--color-background)] rounded-sm overflow-hidden">
              <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
                <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4">
                  Bespoke Services
                </span>
                <h2 className="font-heading text-4xl lg:text-6xl font-bold mb-6">
                  The Bridal Edit
                </h2>
                <p className="font-body text-sm lg:text-base opacity-80 max-w-[400px] mb-10 leading-relaxed">
                  Timeless pieces for unforgettable moments. Experience unparalleled craftsmanship and schedule a private consultation for your big day.
                </p>
                <div>
                  <button 
                    onClick={() => navigate('/bridal')}
                    className="px-8 py-4 bg-transparent border border-[var(--color-accent)] text-[var(--color-accent)] font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline"
                  >
                    Explore Bridal
                  </button>
                </div>
              </div>
              <div className="w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto h-[400px] lg:h-auto overflow-hidden">
                <img 
                  src="/images/bridal-hero.png" 
                  alt="Bridal Collection" 
                  className="w-full h-full object-cover object-[center_20%] opacity-90 hover-soft-scale"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      {!hasFilters && (
        <section className="mb-24 max-w-[600px] mx-auto px-6 text-center animate-smooth-reveal">
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-[var(--color-primary)] mb-4">Stay in the know.</h2>
          <p className="font-body text-sm text-[var(--color-text-muted)] mb-8">Sign up for early access to new collections and exclusive events.</p>
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-6 py-4 bg-transparent border border-[var(--color-border-main)] font-body text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors rounded-sm"
              required
            />
            <button 
              type="submit"
              className="px-8 py-4 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors focus-visible:outline"
            >
              Subscribe
            </button>
          </form>
        </section>
      )}

      {/* ── PRODUCT CATALOG ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24 animate-smooth-reveal">
        
        {hasFilters && (
          <div className="mb-16 border-b border-[var(--color-border-main)] pb-8 animate-smooth-reveal">
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 block">
              Curated Edit
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h2 className="font-heading text-4xl lg:text-6xl font-bold text-[var(--color-primary)]">The Collection</h2>
              <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                {loading ? 'Loading pieces...' : `${totalProducts} pieces`}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-16 items-start">
          
          {/* Sidebar */}
          <aside className="hidden lg:block w-[240px] shrink-0 sticky top-32">
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
                className="flex items-center gap-2 px-6 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-[10px] font-bold uppercase tracking-widest rounded-sm"
              >
                <FiFilter size={14} /> Filter
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-10">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-[var(--color-border-main)] rounded-full text-[var(--color-text-light)]">
                  <FiFilter size={24} />
                </div>
                <h3 className="font-heading text-3xl font-bold text-[var(--color-primary)] mb-4">No pieces found</h3>
                <p className="font-body text-sm text-[var(--color-text-muted)] max-w-[400px] mx-auto mb-10">
                  We couldn't find any pieces matching your refined criteria. Try broadening your search.
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-body text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors"
                  >
                    Clear Refinements
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 lg:gap-x-10">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                <div className="mt-20">
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={() => setMobileFilter(false)} />
          <div className="fixed inset-y-0 right-0 w-[85vw] max-w-[320px] bg-[var(--color-background)] z-[110] flex flex-col shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
              <span className="font-heading text-2xl font-bold text-[var(--color-primary)]">Refine</span>
              <button onClick={() => setMobileFilter(false)} className="text-[var(--color-primary)] hover:opacity-80">
                <FiX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <ProductFilters onClose={() => setMobileFilter(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
