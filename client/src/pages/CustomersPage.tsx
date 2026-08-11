import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Building,
} from 'lucide-react';
import { customerService } from '../services/customer.service';
import { Customer, CustomerType, CustomerStatus, PaginationMeta } from '../types';
import { LoadingSpinner, TableSkeleton } from '../components/common/LoadingSpinner';
import { CustomerStatusBadge, CustomerTypeBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'WHOLESALE' as CustomerType,
    address: '',
    status: 'LEAD' as CustomerStatus,
    notes: '',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await customerService.getCustomers({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        customerType: typeFilter || undefined,
      });
      if (res.success && res.data) {
        setCustomers(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'WHOLESALE',
      address: '',
      status: 'LEAD',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      notes: customer.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      setIsAddModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this customer?')) {
      try {
        await customerService.deleteCustomer(id);
        fetchCustomers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to deactivate customer');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Users className="h-7 w-7 text-brand-600 mr-3" />
            Customer CRM Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage wholesale, distributor, and retail client relationships and follow-ups.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, business, mobile, GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-slate-500 text-xs font-semibold uppercase">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="LEAD">LEAD</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500"
          >
            <option value="">All Segment Types</option>
            <option value="WHOLESALE">WHOLESALE</option>
            <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            <option value="RETAIL">RETAIL</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No customers found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3.5 px-4">Contact / Business</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Follow-up Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <Link to={`/customers/${cust.id}`} className="font-bold text-slate-900 hover:text-brand-600 block">
                        {cust.name}
                      </Link>
                      <div className="flex items-center text-xs text-slate-500 mt-0.5 font-medium">
                        <Building className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {cust.businessName}
                        {cust.gstNumber && <span className="ml-2 font-mono text-[10px] text-slate-400">({cust.gstNumber})</span>}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <CustomerTypeBadge type={cust.customerType} />
                    </td>

                    <td className="py-4 px-4">
                      <CustomerStatusBadge status={cust.status} />
                    </td>

                    <td className="py-4 px-4 text-xs space-y-1">
                      <div className="flex items-center text-slate-700 font-medium">
                        <Phone className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        {cust.mobile}
                      </div>
                      <div className="flex items-center text-slate-500">
                        <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        {cust.email}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                      {cust.followUpDate ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(cust.followUpDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/customers/${cust.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(cust)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Deactivate Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Account' : 'Add New Customer Account'}
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Ramesh Gupta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Business / Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Apex Industrial Supplies"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="+91 98200 11223"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="ramesh@apex.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                GST Number (Optional)
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 uppercase"
                placeholder="27AAACA1234H1Z5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Customer Segment Type *
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 bg-white"
              >
                <option value="WHOLESALE">WHOLESALE</option>
                <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                <option value="RETAIL">RETAIL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Lifecycle Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 bg-white"
              >
                <option value="LEAD">LEAD</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Business Address *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Plot 42, MIDC Industrial Area, Mumbai, Maharashtra 400093"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Account Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Credit terms, preferred payment method, special discounts..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm"
            >
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
