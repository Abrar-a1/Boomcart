import { useState, useEffect } from 'react';
import { FiShield, FiUserX } from 'react-icons/fi';
import { getAllUsers, updateUserRole, deactivateUser } from '../../services/userService';
import Loader from '../../components/common/Loader';
import { AdminNav } from './Dashboard';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllUsers().then(({ data }) => setUsers(data.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Make ${user.name} a ${newRole}?`)) return;
    try { await updateUserRole(user._id, newRole); toast.success(`Role updated to ${newRole}`); load(); } catch { toast.error('Failed'); }
  };

  const deactivate = async (user) => {
    if (!window.confirm(`Deactivate ${user.name}?`)) return;
    try { await deactivateUser(user._id); toast.success('User deactivated'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Helmet><title>Users — Admin | Boomcart</title></Helmet>
      <AdminNav />

      <main className="flex-1 min-w-0 overflow-x-hidden bg-[#FAF7F2]">
        <div className="px-12 py-10">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-[#123026]">Users</h2>
            <span className="text-sm text-stone-400 font-medium">
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </span>
          </div>
          
          {/* Users Table */}
          {loading ? <Loader /> : (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-100">
                      <th className="py-4 pl-8 pr-6 text-xs font-bold uppercase tracking-wider text-stone-500">Name</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Email</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Role</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-stone-500">Joined</th>
                      <th className="py-4 pr-8 pl-6 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400 text-sm">No users found.</td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u._id} className="hover:bg-stone-50 transition-colors duration-100">
                          {/* Name + Avatar */}
                          <td className="py-5 pl-8 pr-6">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-[#123026] shrink-0 border border-stone-200/60">
                                {u.name?.[0]?.toUpperCase()}
                              </span>
                              <span className="font-medium text-[#123026] text-sm">{u.name}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-5 px-6 text-stone-500 text-sm">{u.email}</td>

                          {/* Role */}
                          <td className="py-5 px-6">
                            <span className={`inline-flex items-center gap-1 text-xs uppercase px-2.5 py-1 rounded-full font-semibold tracking-wide ${
                              u.role === 'admin' ? 'bg-[#123026] text-[#D4AF37]' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {u.role === 'admin' && <FiShield size={11} />}
                              {u.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-5 px-6">
                            <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold ${
                              u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                            }`}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className="py-5 px-6 text-stone-500 text-sm">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>

                          {/* Actions */}
                          <td className="py-5 pr-8 pl-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all" 
                                onClick={() => toggleRole(u)} 
                                title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                              >
                                <FiShield size={12}/> {u.role === 'admin' ? 'Revoke' : 'Admin'}
                              </button>
                              {u.isActive && (
                                <button 
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all" 
                                  onClick={() => deactivate(u)} 
                                  title="Deactivate"
                                >
                                  <FiUserX size={12}/> Disable
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
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
