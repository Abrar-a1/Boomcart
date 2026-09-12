import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi';
import { getOrderById } from '../services/orderService';
import { Helmet } from 'react-helmet-async';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id).then(({ data }) => setOrder(data.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-[85vh] flex items-center justify-center font-body text-sm text-[var(--color-text-muted)] animate-pulse">Loading order details...</div>;

  return (
    <div className="w-full min-h-screen bg-[var(--color-background)] py-12 lg:py-20 flex items-center justify-center px-6">
      <Helmet><title>Order Confirmed — Boomcart</title></Helmet>
      
      <div className="max-w-[600px] w-full bg-white border border-[var(--color-border)] rounded-sm p-10 lg:p-16 text-center animate-smooth-reveal shadow-sm">
        
        <div className="w-20 h-20 bg-[var(--color-background)] rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--color-border-light)]">
          <FiCheck size={32} className="text-[var(--color-primary)]" />
        </div>
        
        <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4">Order Confirmed.</h1>
        <p className="font-body text-sm text-[var(--color-text-muted)] mb-10 max-w-sm mx-auto leading-relaxed">
          Thank you for your purchase. We've received your order and will start processing it soon.
        </p>

        {order && (
          <div className="bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-sm p-8 mb-10 text-left">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border-light)] pb-6">
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Order ID</p>
                <p className="font-heading text-xl font-bold text-[var(--color-primary)]">#{order._id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Total</p>
                <p className="font-heading text-xl font-bold text-[var(--color-primary)]">₹{order.totalPrice?.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Payment</p>
              <p className="font-body text-sm font-semibold text-[var(--color-text)] uppercase">{order.paymentMethod}</p>
            </div>
          </div>
        )}

        <p className="font-body text-xs text-[var(--color-text-muted)] mb-10 max-w-sm mx-auto">
          A confirmation email has been sent to <span className="font-semibold text-[var(--color-text)]">{order?.user?.email || 'your email'}</span>. Estimated delivery in 5–7 business days.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to={`/order/${id}`} 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors focus-visible:outline"
          >
            <FiPackage size={14} /> Track Order
          </Link>
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] font-body text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[var(--color-background)] transition-colors focus-visible:outline"
          >
            Continue Shopping <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
