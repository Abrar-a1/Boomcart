import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiCheck, FiTruck, FiHome, FiX } from 'react-icons/fi';
import { getOrderById, cancelOrder } from '../services/orderService';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const STEPS = [
  { status: 'pending',    label: 'Order Placed',  icon: FiPackage },
  { status: 'confirmed',  label: 'Confirmed',     icon: FiCheck },
  { status: 'processing', label: 'Processing',    icon: FiPackage },
  { status: 'shipped',    label: 'Shipped',       icon: FiTruck },
  { status: 'delivered',  label: 'Delivered',     icon: FiHome },
];
const ORDER_IDX = { pending:0, confirmed:1, processing:2, shipped:3, delivered:4 };

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrderById(id).then(({ data }) => setOrder(data.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      const { data } = await cancelOrder(order._id);
      setOrder(data.data);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    } finally { setCancelling(false); }
  };

  if (loading) return <Loader />;
  if (!order)  return <div className="page container"><p>Order not found.</p></div>;

  const isCancelled = ['cancelled','refunded'].includes(order.orderStatus);
  const currentIdx  = isCancelled ? -1 : (ORDER_IDX[order.orderStatus] ?? 0);

  return (
    <div className="page">
      <Helmet><title>Order #{order._id.slice(-8).toUpperCase()} — Boomcart</title></Helmet>
      <div className="container" style={{ maxWidth: 800 }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:28 }}>
          <h1 className="section-title">Order Tracking</h1>
          <span className={`badge ${isCancelled?'badge-red':order.orderStatus==='delivered'?'badge-green':'badge-blue'}`} style={{ fontSize:13, padding:'6px 16px' }}>
            {order.orderStatus.toUpperCase()}
          </span>
        </div>

        <div className="card" style={{ padding:20, marginBottom:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
            {[['Order ID',`#${order._id.slice(-10).toUpperCase()}`],['Date',new Date(order.createdAt).toLocaleDateString('en-IN')],['Total',`₹${order.totalPrice?.toLocaleString()}`],['Payment',order.paymentMethod?.toUpperCase()]].map(([l,v]) => (
              <div key={l}><p style={{ fontSize:12, color:'var(--gray-400)', marginBottom:4 }}>{l}</p><p style={{ fontWeight:700, color:'var(--navy)', fontSize:14 }}>{v}</p></div>
            ))}
          </div>
          {order.trackingNumber && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--gray-100)' }}>
              <p style={{ fontSize:12, color:'var(--gray-400)', marginBottom:4 }}>Tracking Number</p>
              <p style={{ fontWeight:700, fontFamily:'monospace', color:'var(--navy)' }}>{order.trackingNumber}</p>
            </div>
          )}
        </div>

        {!isCancelled ? (
          <div className="card" style={{ padding:'28px 32px', marginBottom:24 }}>
            <h3 style={{ fontFamily:'var(--font-serif)', fontSize:18, color:'var(--navy)', marginBottom:28 }}>Shipment Progress</h3>
            <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
              <div style={{ position:'absolute', top:18, left:'10%', right:'10%', height:3, background:'var(--gray-100)', zIndex:0 }}>
                <div style={{ height:'100%', background:'var(--navy)', width:`${Math.max(0,(currentIdx/(STEPS.length-1))*100)}%`, transition:'width .4s ease' }} />
              </div>
              {STEPS.map((s,i) => {
                const done = i <= currentIdx;
                const Icon = s.icon;
                return (
                  <div key={s.status} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, zIndex:1, flex:1 }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:`3px solid ${done?'var(--navy)':'var(--gray-200)'}`, background:done?'var(--navy)':'var(--white)', color:done?'var(--gold)':'var(--gray-300)', transition:'all .3s' }}>
                      <Icon size={15} />
                    </div>
                    <p style={{ fontSize:11, fontWeight:done?700:400, color:done?'var(--navy)':'var(--gray-400)', textAlign:'center', lineHeight:1.3 }}>{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding:24, marginBottom:24, background:'var(--red-light)', border:'1px solid var(--red)', borderRadius:'var(--radius-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <FiX size={24} style={{ color:'var(--red)' }} />
              <div>
                <p style={{ fontWeight:700, color:'var(--red)', fontSize:15 }}>Order {order.orderStatus}</p>
                <p style={{ color:'#b91c1c', fontSize:13, marginTop:2 }}>This order has been {order.orderStatus}.</p>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:24 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--gray-100)' }}>
            <h4 style={{ color:'var(--navy)', fontWeight:700 }}>Items in this order</h4>
          </div>
          {order.orderItems?.map(item => (
            <div key={item._id} style={{ display:'flex', gap:14, padding:'16px 20px', borderBottom:'1px solid var(--gray-100)', alignItems:'center' }}>
              <img src={item.image} alt={item.name} style={{ width:60, height:72, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, color:'var(--navy)', fontSize:14 }}>{item.name}</p>
                {item.size && <p style={{ fontSize:12, color:'var(--gray-400)' }}>Size: {item.size}</p>}
                <p style={{ fontSize:13, color:'var(--gray-600)', marginTop:4 }}>₹{item.price.toLocaleString()} × {item.quantity}</p>
              </div>
              <p style={{ fontWeight:700, color:'var(--navy)', fontSize:15 }}>₹{(item.price*item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding:20, marginBottom:24 }}>
          <h4 style={{ color:'var(--navy)', fontWeight:700, marginBottom:12 }}>Shipping Address</h4>
          <p style={{ fontSize:14, color:'var(--gray-600)', lineHeight:1.8 }}>
            {order.shippingAddress?.fullName}<br/>
            {order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2?`, ${order.shippingAddress.addressLine2}`:''}<br/>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br/>
            📞 {order.shippingAddress?.phone}
          </p>
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <Link to="/profile?tab=orders" className="btn btn-outline">← All Orders</Link>
          {['pending','confirmed'].includes(order.orderStatus) && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <Link to="/" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
