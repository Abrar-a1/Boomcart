import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import { getDashboardStats } from '../../services/orderService';
import Loader from '../../components/common/Loader';
import { Helmet } from 'react-helmet-async';
import './Admin.css';

/* ── Shared Sidebar Navigation ────────────────────────────── */
function AdminNav() {
  const { pathname } = useLocation();
  const links = [
    { to:'/admin',          label:'Dashboard',  Icon:FiGrid },
    { to:'/admin/products', label:'Products',   Icon:FiShoppingBag },
    { to:'/admin/orders',   label:'Orders',     Icon:FiPackage },
    { to:'/admin/users',    label:'Users',      Icon:FiUsers },
  ];

  return (
    <aside className="w-60 bg-white border-r border-stone-200 shrink-0 h-screen sticky top-0 overflow-y-auto flex flex-col shadow-sm">
      {/* Brand */}
      <div className="px-7 pt-8 pb-6 border-b border-stone-100">
        <h1 className="text-lg font-serif text-[#123026] tracking-tight">Admin Panel</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 px-4 pt-5 flex-1">
        {links.map(({ to, label, Icon }) => {
          const isActive = pathname === to || (to !== '/admin' && pathname.startsWith(to));
          return (
            <Link 
              key={to} 
              to={to} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-[#FAF7F2] text-[#123026] font-semibold border border-stone-200' 
                  : 'text-stone-500 hover:text-[#123026] hover:bg-stone-50'
              }`}
            >
              <Icon size={18} className="shrink-0" /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { AdminNav };

/* ── Dashboard Page ───────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(({ data }) => setStats(data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label:'Total Revenue', value:`₹${stats.totalRevenue?.toLocaleString()}`, Icon:FiDollarSign, bg:'#eff6ff', color:'#1d4ed8' },
    { label:'Total Orders',  value:stats.totalOrders,  Icon:FiPackage,     bg:'#f5f3ff', color:'#6d28d9' },
    { label:'Total Users',   value:stats.totalUsers,   Icon:FiUsers,       bg:'#ecfdf5', color:'#065f46' },
    { label:'Products',      value:stats.totalProducts, Icon:FiShoppingBag, bg:'#fff7ed', color:'#c2410c' },
    { label:'Paid Orders',   value:stats.paidOrders,   Icon:FiCheckCircle, bg:'#dcfce7', color:'#15803d' },
    { label:'Pending Orders',value:stats.pendingOrders, Icon:FiClock,       bg:'#fef9c3', color:'#854d0e' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Helmet><title>Admin Dashboard — Boomcoart</title></Helmet>
      <AdminNav />

      <main className="flex-1 min-w-0 overflow-x-hidden bg-[#FAF7F2]">
        <div className="px-12 py-10">
          {/* Page Header */}
          <h2 className="text-3xl font-serif text-[#123026] mb-10">Dashboard</h2>

          {loading ? <Loader /> : (
            <>
              {/* ── Stat Cards ────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {STAT_CARDS.map(({ label, value, Icon, bg, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-7 border border-stone-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background:bg, color }}>
                      <Icon />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1.5">{label}</p>
                      <p className="text-2xl font-bold text-[#123026] leading-tight">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Recent Orders Section ─────────────────────── */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif text-[#123026]">Recent Orders</h3>
                <Link 
                  to="/admin/orders" 
                  className="text-sm font-semibold px-5 py-2 bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md hover:border-stone-300 transition-all duration-200 text-stone-600"
                >
                  View All →
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-100">
                        <th className="py-4 pl-8 pr-6 text-xs font-bold uppercase tracking-wider text-stone-500">Order ID</th>
                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Customer</th>
                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Amount</th>
                        <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                        <th className="py-4 pr-8 pl-6 text-xs font-bold uppercase tracking-wider text-stone-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {stats?.recentOrders?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-stone-400 text-sm">No recent orders.</td>
                        </tr>
                      ) : (
                        stats?.recentOrders?.map(o => (
                          <tr key={o._id} className="hover:bg-stone-50 transition-colors duration-100">
                            <td className="py-5 pl-8 pr-6 font-medium text-[#123026] text-sm">#{o._id.slice(-8).toUpperCase()}</td>
                            <td className="py-5 px-6">
                              <p className="font-medium text-[#123026] text-sm">{o.user?.name}</p>
                              <p className="text-xs text-stone-400 mt-0.5">{o.user?.email}</p>
                            </td>
                            <td className="py-5 px-6 font-bold text-[#123026] text-sm">₹{o.totalPrice?.toLocaleString()}</td>
                            <td className="py-5 px-6">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                                o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 
                                o.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="py-5 pr-8 pl-6 text-stone-500 text-sm">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
