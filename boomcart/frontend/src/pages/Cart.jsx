import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

export default function Cart() {
  const { items, itemsPrice, shippingPrice, taxPrice, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="page">
      <Helmet><title>Cart — Boomcart</title></Helmet>
      <div className="container">
        <div className="empty-state">
          <FiShoppingBag size={64} style={{ margin:'0 auto 20px', display:'block', opacity:.2 }} />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop:16 }}>Start Shopping</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <Helmet><title>Cart ({items.length}) — Boomcart</title></Helmet>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom:28 }}>
          Shopping Cart{' '}
          <span style={{ fontSize:18, color:'var(--gray-400)', fontFamily:'var(--font-sans)' }}>
            ({items.length} item{items.length !== 1 ? 's' : ''})
          </span>
        </h1>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:28, alignItems:'start' }} className="responsive-2col">

          {/* Items list */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            {items.map((item, idx) => (
              <div key={item._key} style={{ display:'flex', gap:16, padding:'20px 24px', borderBottom: idx < items.length-1 ? '1px solid var(--gray-100)' : 'none', alignItems:'flex-start' }}>
                <Link to={`/product/${item.product}`} style={{ flexShrink:0 }}>
                  <img src={item.image} alt={item.name} style={{ width:88, height:108, objectFit:'cover', borderRadius:'var(--radius-md)' }} />
                </Link>
                <div style={{ flex:1, minWidth:0 }}>
                  <Link to={`/product/${item.product}`} style={{ fontWeight:700, fontSize:15, color:'var(--navy)', display:'block', marginBottom:6 }}>
                    {item.name}
                  </Link>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                    {item.size  && <span className="badge badge-gray">Size: {item.size}</span>}
                    {item.color && (
                      <span className="badge badge-gray" style={{ display:'flex', alignItems:'center', gap:5 }}>
                        <span style={{ width:10, height:10, borderRadius:'50%', background:item.color, display:'inline-block', border:'1px solid rgba(0,0,0,.15)' }} />
                        Color
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item._key, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._key, Math.min(99, item.quantity + 1))} disabled={item.quantity >= 99}>+</button>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                      <div>
                        <span style={{ fontWeight:700, fontSize:17, color:'var(--navy)' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span style={{ fontSize:13, color:'var(--gray-400)', marginLeft:6 }}>₹{item.price.toLocaleString()} each</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._key)}
                        style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', padding:6, borderRadius:'var(--radius-sm)', transition:'background .15s', display:'flex', alignItems:'center' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--red-light)'}
                        onMouseLeave={e => e.currentTarget.style.background='none'}
                        title="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="card sticky-summary" style={{ padding:24, position:'sticky', top:100 }}>
            <h3 style={{ fontFamily:'var(--font-serif)', fontSize:20, color:'var(--navy)', marginBottom:20 }}>Order Summary</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-600)' }}>
                <span>Items Total</span><span style={{ fontWeight:500 }}>₹{itemsPrice.toLocaleString()}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-600)' }}>
                <span>Shipping</span>
                <span style={{ fontWeight:500, color: shippingPrice===0 ? 'var(--green)' : 'inherit' }}>
                  {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, color:'var(--gray-600)' }}>
                <span>Tax (5%)</span><span style={{ fontWeight:500 }}>₹{taxPrice.toLocaleString()}</span>
              </div>
              {shippingPrice > 0 && (
                <p style={{ fontSize:12, color:'var(--blue)', background:'#eff6ff', padding:'8px 10px', borderRadius:'var(--radius-sm)', lineHeight:1.5 }}>
                  💡 Add ₹{(999 - itemsPrice).toLocaleString()} more for free shipping!
                </p>
              )}
              <hr className="divider" />
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:18, color:'var(--navy)' }}>
                <span>Total</span><span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-block btn-lg"
              style={{ marginTop:20 }}
              onClick={() => user ? navigate('/checkout') : navigate('/login')}
            >
              Proceed to Checkout <FiArrowRight />
            </button>
            <Link to="/" className="btn btn-outline btn-block" style={{ marginTop:10, textAlign:'center' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
