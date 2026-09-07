import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiCheck, FiTruck, FiHome, FiX, FiArrowRight } from 'react-icons/fi';
import { getOrderById, cancelOrder } from '../services/orderService';
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

  if (loading) return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm text-[var(--color-text-muted)] animate-pulse">Loading tracking details...</div>;
  if (!order)  return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm font-bold text-[var(--color-error)]">Order not found.</div>;

  const isCancelled = ['cancelled','refunded'].includes(order.orderStatus);
  const currentIdx  = isCancelled ? -1 : (ORDER_IDX[order.orderStatus] ?? 0);

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] py-12 lg:py-20">
      <Helmet><title>Order #{order._id.slice(-8).toUpperCase()} — Boomcart</title></Helmet>
      
      <div className="max-w-[800px] mx-auto px-6 lg:px-12 animate-smooth-reveal">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 border-b border-[var(--color-border-main)] pb-6">
          <div>
            <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)] mb-2">Order Tracking</h1>
            <p className="font-body text-xs text-[var(--color-text-muted)]">Order #{order._id.slice(-10).toUpperCase()}</p>
          </div>
          <span className={`font-body text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm ${isCancelled ? 'bg-red-50 text-red-700 border border-red-200' : order.orderStatus === 'delivered' ? 'bg-[var(--color-background)] text-[var(--color-accent-dark)] border border-[var(--color-border-light)]' : 'bg-[var(--color-primary)] text-white'}`}>
            {order.orderStatus}
          </span>
        </div>

        <div className="bg-white border border-[var(--color-border-main)] rounded-sm p-8 mb-8 flex flex-col md:flex-row gap-8 justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Date</span>
            <span className="font-body text-sm font-bold text-[var(--color-text)]">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Total Amount</span>
            <span className="font-body text-sm font-bold text-[var(--color-text)]">₹{order.totalPrice?.toLocaleString()}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Payment</span>
            <span className="font-body text-sm font-bold text-[var(--color-text)] uppercase">{order.paymentMethod}</span>
          </div>
          {order.trackingNumber && (
            <div className="flex flex-col gap-1">
              <span className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Tracking ID</span>
              <span className="font-body text-sm font-bold text-[var(--color-text)]">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        {!isCancelled ? (
          <div className="bg-white border border-[var(--color-border-main)] rounded-sm p-8 lg:p-10 mb-8 shadow-sm">
            <h3 className="font-heading text-2xl font-bold text-[var(--color-primary)] mb-10">Shipment Progress</h3>
            
            <div className="relative flex justify-between">
              {/* Progress Bar Background */}
              <div className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-[var(--color-border-main)] z-0" />
              {/* Progress Bar Fill */}
              <div 
                className="absolute top-5 left-[10%] right-[10%] h-[2px] bg-[var(--color-primary)] z-0 transition-all duration-700 ease-out" 
                style={{ width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 100)}%` }} 
              />
              
              {STEPS.map((s, i) => {
                const done = i <= currentIdx;
                const Icon = s.icon;
                return (
                  <div key={s.status} className="relative z-10 flex flex-col items-center gap-3 w-1/5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${done ? 'bg-[var(--color-primary)] text-white shadow-md scale-110' : 'bg-white border-2 border-[var(--color-border-main)] text-[var(--color-text-light)]'}`}>
                      <Icon size={16} />
                    </div>
                    <span className={`font-body text-[10px] uppercase tracking-widest text-center transition-colors ${done ? 'font-bold text-[var(--color-primary)]' : 'font-medium text-[var(--color-text-light)]'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-sm p-6 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm shrink-0">
              <FiX size={20} />
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-red-900 leading-tight">Order {order.orderStatus}</p>
              <p className="font-body text-xs text-red-700 mt-1">This order has been {order.orderStatus} and will not be shipped.</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-[var(--color-border-main)] rounded-sm mb-8 shadow-sm">
          <div className="p-6 border-b border-[var(--color-border-light)]">
            <h4 className="font-heading text-xl font-bold text-[var(--color-primary)]">Items in this order</h4>
          </div>
          <div className="flex flex-col">
            {order.orderItems?.map((item, idx) => (
              <div key={item._id} className={`flex gap-6 p-6 items-center ${idx !== order.orderItems.length - 1 ? 'border-b border-[var(--color-border-light)]' : ''}`}>
                <div className="w-16 h-20 bg-[var(--color-border-light)] rounded-sm overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-lg font-bold text-[var(--color-primary)] mb-1 leading-tight">{item.name}</p>
                  {item.size && <p className="font-body text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Size: {item.size}</p>}
                  <p className="font-body text-xs text-[var(--color-text)]">₹{item.price.toLocaleString()} × {item.quantity}</p>
                </div>
                <p className="font-body text-sm font-bold text-[var(--color-text)]">₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border-main)] rounded-sm p-6 lg:p-8 mb-10 shadow-sm">
          <h4 className="font-heading text-xl font-bold text-[var(--color-primary)] mb-6">Delivery Details</h4>
          <div className="flex flex-col gap-1">
            <p className="font-body text-sm font-bold text-[var(--color-text)] mb-2">{order.shippingAddress?.fullName}</p>
            <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
              {order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}<br/>
            </p>
            <p className="font-body text-sm text-[var(--color-text)] font-medium mt-2">📞 {order.shippingAddress?.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to="/profile?tab=orders" className="flex items-center justify-center px-8 py-4 bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-background)] transition-colors focus-visible:outline w-full sm:w-auto">
            All Orders
          </Link>
          {['pending','confirmed'].includes(order.orderStatus) && (
            <button 
              className="flex items-center justify-center px-8 py-4 bg-red-50 text-red-700 font-body text-xs font-bold uppercase tracking-widest rounded-sm border border-red-200 hover:bg-red-100 transition-colors focus-visible:outline w-full sm:w-auto disabled:opacity-50" 
              onClick={handleCancel} 
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <Link to="/" className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors focus-visible:outline w-full sm:w-auto ml-auto">
            Continue Shopping <FiArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
