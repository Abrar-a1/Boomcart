import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import { getWishlist, toggleWishlist } from '../services/userService';
import { useCart } from '../context/CartContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function Wishlist() {
  const { addToCart } = useCart();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWishlist().then(({ data }) => setItems(data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    try {
      await toggleWishlist(id);
      setItems(items.filter(i => i._id !== id));
      toast.success('Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="page">
      <Helmet><title>My Wishlist — Boomcart</title></Helmet>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 28 }}>
          <FiHeart style={{ verticalAlign: 'middle', marginRight: 10, color: 'var(--red)' }} />
          My Wishlist <span style={{ fontSize:16, color:'var(--gray-400)', fontFamily:'var(--font-sans)' }}>({items.length})</span>
        </h1>

        {items.length === 0 ? (
          <div className="empty-state">
            <FiHeart size={64} style={{ margin:'0 auto 20px', display:'block', opacity:.2 }} />
            <h3>Your wishlist is empty</h3>
            <p>Save items you love and come back to them later.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Products</Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:20 }}>
            {items.map(item => {
              const price = item.discountPrice > 0 ? item.discountPrice : item.price;
              const disc  = item.discountPrice > 0 ? Math.round(((item.price - item.discountPrice)/item.price)*100) : 0;
              return (
                <div key={item._id} className="card" style={{ overflow:'hidden', position:'relative' }}>
                  <button onClick={() => remove(item._id)} style={{ position:'absolute', top:10, right:10, zIndex:2, background:'rgba(255,255,255,.9)', border:'none', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--red)', boxShadow:'var(--shadow-sm)' }}>
                    <FiTrash2 size={15} />
                  </button>
                  <Link to={`/product/${item._id}`}>
                    <div style={{ aspectRatio:'3/4', overflow:'hidden', background:'var(--gray-50)' }}>
                      <img src={item.images[0]?.url} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }} />
                    </div>
                  </Link>
                  <div style={{ padding:14 }}>
                    <p style={{ fontSize:11, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:4 }}>{item.category}</p>
                    <Link to={`/product/${item._id}`} style={{ fontWeight:700, color:'var(--navy)', fontSize:14, display:'block', marginBottom:8, lineHeight:1.3 }}>{item.name}</Link>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                      <span style={{ fontWeight:700, color:'var(--navy)', fontSize:16 }}>₹{price.toLocaleString()}</span>
                      {disc > 0 && <span style={{ fontSize:12, color:'var(--gray-400)', textDecoration:'line-through' }}>₹{item.price.toLocaleString()}</span>}
                      {disc > 0 && <span className="badge badge-red" style={{ fontSize:10 }}>{disc}% OFF</span>}
                    </div>
                    <button className="btn btn-primary btn-block btn-sm" onClick={() => { addToCart(item, 1, item.sizes?.[0]||'', item.colors?.[0]||''); }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
