import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage } from 'react-icons/fi';
import { getOrderById } from '../services/orderService';
import Loader from '../components/common/Loader';
import { Helmet } from 'react-helmet-async';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id).then(({ data }) => setOrder(data.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="page">
      <Helmet><title>Order Confirmed — Boomcart</title></Helmet>
      <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
        <div style={{ padding: '48px 32px', background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
          <FiCheckCircle size={72} style={{ color: 'var(--green)', margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--navy)', marginBottom: 10 }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 16, marginBottom: 24 }}>
            Thank you for your purchase. We've received your order and will start processing it soon.
          </p>
          {order && (
            <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 6 }}>Order ID</p>
              <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15, fontFamily: 'monospace' }}>#{order._id.slice(-12).toUpperCase()}</p>
              <hr style={{ margin: '12px 0', borderColor: 'var(--gray-100)' }} />
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 6 }}>Total Paid</p>
              <p style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 18 }}>₹{order.totalPrice?.toLocaleString()}</p>
              <hr style={{ margin: '12px 0', borderColor: 'var(--gray-100)' }} />
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 6 }}>Payment Method</p>
              <p style={{ fontWeight: 600, color: 'var(--gray-700)', fontSize: 14, textTransform: 'uppercase' }}>{order.paymentMethod}</p>
            </div>
          )}
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28 }}>
            A confirmation email has been sent to <strong>{order?.user?.email || 'your email'}</strong>. Estimated delivery in 5–7 business days.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/order/${id}`} className="btn btn-primary"><FiPackage /> Track Order</Link>
            <Link to="/" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
