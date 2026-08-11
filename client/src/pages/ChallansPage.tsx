import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Building,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { challanService } from '../services/challan.service';
import { Challan, ChallanStatus, PaginationMeta } from '../types';
import { TableSkeleton } from '../components/common/LoadingSpinner';
import { ChallanStatusBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const fetchChallans = async () => {
    setIsLoading(true);
    try {
      const res = await challanService.getChallans({
        page,
        limit: 10,
        search: search || undefined,
        status: (statusFilter as ChallanStatus) || undefined,
      });
      if (res.success && res.data) {
        setChallans(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to fetch sales challans', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchChallans();
  };

  const handleConfirm = async (id: string, challanNumber: string) => {
    if (
      window.confirm(
        `Are you sure you want to CONFIRM challan ${challanNumber}?\n\nWARNING: Confirming this challan will deduct product inventory.`
      )
    ) {
      try {
        await challanService.confirmChallan(id);
        alert(`Sales Challan ${challanNumber} confirmed successfully. Inventory updated.`);
        fetchChallans();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to confirm sales challan');
      }
    }
  };

  const handleCancel = async (id: string, challanNumber: string) => {
    if (window.confirm(`Are you sure you want to CANCEL sales challan ${challanNumber}?`)) {
      try {
        await challanService.cancelChallan(id);
        fetchChallans();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to cancel sales challan');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <FileText className="h-7 w-7 text-brand-600 mr-3" />
            Sales Challans & Delivery Notes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create sales quotations, track draft orders, and confirm inventory deductions atomically.
          </p>
        </div>
        <Link
          to="/challans/new"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Challan
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by challan number (CH-2026...), customer name, business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-slate-500 text-xs font-semibold uppercase">
            <Filter className="h-4 w-4" />
            <span>Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Challans List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : challans.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No sales challans found</p>
            <p className="text-sm text-slate-500 mt-1">Create your first sales challan using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3.5 px-4">Challan Number</th>
                  <th className="py-3.5 px-4">Customer Account</th>
                  <th className="py-3.5 px-4">Items / Qty</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((ch) => (
                  <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-700">
                      <Link to={`/challans/${ch.id}`} className="hover:underline">
                        {ch.challanNumber}
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">
                        {ch.customer?.businessName || ch.customer?.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                        <Building className="h-3 w-3 mr-1 text-slate-400" />
                        {ch.customer?.name}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-700">
                      {ch.totalQuantity} items
                    </td>

                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      ₹{ch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-4">
                      <ChallanStatusBadge status={ch.status} />
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/challans/${ch.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                          title="View Challan Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {ch.status === 'DRAFT' && (
                          <button
                            onClick={() => handleConfirm(ch.id, ch.challanNumber)}
                            className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            title="Confirm & Deduct Stock"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Confirm
                          </button>
                        )}

                        {ch.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(ch.id, ch.challanNumber)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Cancel Challan"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
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
    </div>
  );
};
