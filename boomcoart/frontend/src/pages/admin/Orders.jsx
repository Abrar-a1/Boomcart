import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import Loader from '../../components/common/Loader';
import { AdminNav } from './Dashboard';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import './Admin.css';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const BADGE = {
  pending:    'bg-orange-50 text-orange-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped:    'bg-cyan-50 text-cyan-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
  refunded:   'bg-stone-100 text-stone-600',
};

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [updating, setUpdating] = useState(null);

  const load = (status='') => {
    setLoading(true);
    getAllOrders(status ? { status } : {}).then(({ data }) => setOrders(data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => load(filter), [filter]);

  const handleStatusUpdate = async (orderId, status, trackingNumber) => {
    setUpdating(orderId);
    try { await updateOrderStatus(orderId, { status, trackingNumber }); toast.success('Status updated'); load(filter); }
    catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Helmet><title>Orders — Admin | Boomcoart</title></Helmet>
      <AdminNav />

      <main className="flex-1 min-w-0 overflow-x-hidden bg-[#FAF7F2]">
        <div className="px-12 py-10">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-[#123026]">Orders</h2>
            <select 
              className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white text-[#123026] font-medium outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 transition-all shadow-sm cursor-pointer" 
              style={{ minWidth: 180 }} 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>

          {/* Orders Table */}
          {loading ? <Loader /> : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-100">
                      <th className="py-4 pl-8 pr-6 text-xs font-bold uppercase tracking-wider text-stone-500">Order ID</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Customer</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Items</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Total</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Update</th>
                      <th className="py-4 pr-8 pl-6 text-xs font-bold uppercase tracking-wider text-stone-500">Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-stone-400 text-sm">No orders found.</td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <OrderRow key={o._id} order={o} onUpdate={handleStatusUpdate} updating={updating === o._id} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderRow({ order: o, onUpdate, updating }) {
  const [status, setStatus]   = useState(o.orderStatus);
  const [tracking, setTracking] = useState(o.trackingNumber || '');

  return (
    <tr className="hover:bg-stone-50 transition-colors duration-100">
      {/* Order ID */}
      <td className="py-5 pl-8 pr-6 align-top">
        <p className="font-medium text-[#123026] text-sm">#{o._id.slice(-8).toUpperCase()}</p>
        <p className="text-xs text-stone-400 mt-1">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
        <p className={`text-xs font-semibold mt-1 ${o.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
          {o.isPaid ? 'PAID' : o.paymentMethod === 'cod' ? 'COD' : 'UNPAID'}
        </p>
      </td>

      {/* Customer */}
      <td className="py-5 px-6 align-top">
        <p className="font-medium text-[#123026] text-sm">{o.user?.name}</p>
        <p className="text-xs text-stone-400 mt-0.5">{o.user?.email}</p>
      </td>

      {/* Items */}
      <td className="py-5 px-6 align-top">
        <div className="flex gap-1.5 mb-1.5">
          {o.orderItems.slice(0,3).map(i => <img key={i._id} src={i.image} alt={i.name} className="w-9 h-11 object-cover rounded-md shadow-sm border border-stone-100" />)}
          {o.orderItems.length>3 && <span className="text-xs text-stone-400 self-center ml-1">+{o.orderItems.length-3}</span>}
        </div>
        <p className="text-xs text-stone-400">{o.orderItems.length} item{o.orderItems.length>1?'s':''}</p>
      </td>

      {/* Total */}
      <td className="py-5 px-6 font-bold text-[#123026] align-top text-sm">
        ₹{o.totalPrice?.toLocaleString()}
      </td>

      {/* Status Badge */}
      <td className="py-5 px-6 align-top">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${BADGE[o.orderStatus] || 'bg-stone-100 text-stone-600'}`}>
          {o.orderStatus}
        </span>
      </td>

      {/* Update Status */}
      <td className="py-5 px-6 align-top">
        <div className="flex flex-col gap-2" style={{ minWidth: 120 }}>
          <select 
            className="border border-stone-200 rounded-lg px-3 py-1.5 text-xs bg-white text-stone-700 outline-none focus:border-[#D4AF37] w-full" 
            value={status} 
            onChange={e => setStatus(e.target.value)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button 
            className="bg-[#123026] hover:bg-[#0d221b] text-white transition-colors py-1.5 rounded-lg text-xs font-semibold shadow-sm" 
            disabled={updating} 
            onClick={() => onUpdate(o._id, status, tracking)}
          >
            {updating ? '…' : 'Update'}
          </button>
        </div>
      </td>

      {/* Tracking # */}
      <td className="py-5 pr-8 pl-6 align-top">
        <input 
          className="border border-stone-200 rounded-lg px-3 py-2 text-xs bg-white w-32 outline-none focus:border-[#D4AF37] shadow-sm" 
          placeholder="Enter tracking #" 
          value={tracking} 
          onChange={e => setTracking(e.target.value)} 
        />
      </td>
    </tr>
  );
}
