import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Plus,
  ArrowLeft,
  UserCheck,
  CreditCard,
} from 'lucide-react';
import { customerService } from '../services/customer.service';
import { Customer, CustomerFollowUp } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CustomerStatusBadge, CustomerTypeBadge, ChallanStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Follow-up modal state
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  const fetchCustomerDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await customerService.getCustomerById(id);
      if (res.success && res.data) {
        setCustomer(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch customer details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !note) return;
    setIsSubmittingFollowUp(true);

    try {
      const res = await customerService.addFollowUp(id, { note, followUpDate });
      if (res.success) {
        setIsFollowUpModalOpen(false);
        setNote('');
        fetchCustomerDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add follow-up note');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Fetching customer profile & CRM history..." />;
  }

  if (!customer) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-lg font-bold text-slate-800">Customer account not found</p>
        <Link to="/customers" className="mt-4 inline-flex items-center text-brand-600 font-semibold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Return to Customer Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/customers" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Customer Directory
        </Link>
        <button
          onClick={() => setIsFollowUpModalOpen(true)}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" /> Log Follow-up Note
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{customer.name}</h1>
              <CustomerStatusBadge status={customer.status} />
              <CustomerTypeBadge type={customer.customerType} />
            </div>
            <p className="text-base font-semibold text-slate-600 mt-1 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-slate-400" />
              {customer.businessName}
              {customer.gstNumber && (
                <span className="ml-3 font-mono text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  GSTIN: {customer.gstNumber}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Mobile Phone</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{customer.mobile}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Email Address</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{customer.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Office / Facility Address</p>
              <p className="text-sm text-slate-700 mt-0.5">{customer.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Details: CRM Follow-ups Timeline & Sales Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Follow-up Notes Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Clock className="h-5 w-5 text-indigo-600 mr-2" />
              CRM Follow-up History
            </h2>
            <button
              onClick={() => setIsFollowUpModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
            </button>
          </div>

          {!customer.followUps || customer.followUps.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No follow-up interactions logged yet.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {customer.followUps.map((fu) => (
                <div key={fu.id} className="relative">
                  <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-line">{fu.note}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-700">
                        Logged by: {fu.createdBy?.name || 'Sales Staff'}
                      </span>
                      <span>Next Due: {new Date(fu.followUpDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Challans List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileText className="h-5 w-5 text-brand-600 mr-2" />
              Associated Sales Challans
            </h2>
            <Link to="/challans/new" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center">
              <Plus className="h-3.5 w-3.5 mr-1" /> New Challan
            </Link>
          </div>

          {!customer.challans || customer.challans.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No sales challans generated for this account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.challans.map((ch) => (
                <div key={ch.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div>
                    <Link to={`/challans/${ch.id}`} className="font-mono font-bold text-brand-700 hover:underline">
                      {ch.challanNumber}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {ch.totalQuantity} items • Created: {new Date(ch.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-slate-900">₹{ch.totalAmount.toLocaleString()}</p>
                    <div className="mt-1">
                      <ChallanStatusBadge status={ch.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal to Add Follow-up Note */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Log CRM Follow-up Interaction"
        maxWidth="md"
      >
        <form onSubmit={handleAddFollowUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Discussion Notes / Communication Log *
            </label>
            <textarea
              required
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-500"
              placeholder="e.g. Spoke with client regarding quarterly quotation. Requested 5% discount on bulk fasteners..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Next Scheduled Follow-up Date *
            </label>
            <input
              type="date"
              required
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFollowUpModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingFollowUp}
              className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
            >
              {isSubmittingFollowUp ? 'Saving...' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
