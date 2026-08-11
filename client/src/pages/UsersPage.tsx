import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { authService } from '../services/auth.service';
import { User, Role } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RoleBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SALES' as Role,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employee accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.createUser(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user account');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await authService.toggleUserStatus(user.id, !user.isActive);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <UserCheck className="h-7 w-7 text-brand-600 mr-3" />
            Employee User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system access credentials and role-based permissions for internal staff accounts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* RBAC Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { role: 'ADMIN' as Role, description: 'Full system access. Manage users, all modules, settings.', color: 'rose' },
          { role: 'SALES' as Role, description: 'CRM customers, products view, sales challans, follow-ups.', color: 'blue' },
          { role: 'WAREHOUSE' as Role, description: 'Products, inventory stock IN/OUT movements, challans view.', color: 'amber' },
          { role: 'ACCOUNTS' as Role, description: 'Customers, products, confirmed challans, financial overview.', color: 'indigo' },
        ].map(({ role, description }) => (
          <div key={role} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="mb-2">
              <RoleBadge role={role} />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> employee account(s)
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <LoadingSpinner message="Loading employee accounts..." />
        ) : error ? (
          <div className="p-8 text-center text-rose-600 font-medium">{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No users found</p>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search filter or click "Add New User" to create an employee account.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-900">{u.name}</td>
                  <td className="py-4 px-4 text-slate-600">{u.email}</td>
                  <td className="py-4 px-4"><RoleBadge role={u.role} /></td>
                  <td className="py-4 px-4">
                    {u.isActive !== false ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        u.isActive !== false
                          ? 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-rose-600'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                      title={u.isActive !== false ? 'Deactivate user account' : 'Activate user account'}
                    >
                      {u.isActive !== false ? (
                        <>
                          <ToggleRight className="h-4 w-4 mr-1 text-slate-500" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 mr-1 text-emerald-600" />
                          Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Employee Account" maxWidth="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              placeholder="Rajesh Sharma"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Work Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              placeholder="rajesh@erp-demo.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">System Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              <option value="SALES">SALES</option>
              <option value="WAREHOUSE">WAREHOUSE</option>
              <option value="ACCOUNTS">ACCOUNTS</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
