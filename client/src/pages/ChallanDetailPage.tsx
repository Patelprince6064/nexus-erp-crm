import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Package,
  Users,
  Calendar,
  Tag,
  AlertTriangle,
  ReceiptText,
  Printer,
} from 'lucide-react';
import { challanService } from '../services/challan.service';
import { Challan } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChallanStatusBadge } from '../components/common/Badge';

export const ChallanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);

  const fetchChallan = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await challanService.getChallanById(id);
      if (res.success && res.data) {
        setChallan(res.data);
      }
    } catch {
      console.error('Failed to fetch challan details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirm = async () => {
    if (!challan) return;
    if (
      !window.confirm(
        `Confirm sales challan ${challan.challanNumber}?\n\nWARNING: This will deduct inventory immediately.`
      )
    )
      return;

    setIsActing(true);
    try {
      await challanService.confirmChallan(challan.id);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setIsActing(false);
    }
  };

  const handleCancel = async () => {
    if (!challan) return;
    if (!window.confirm(`Cancel challan ${challan.challanNumber}?`)) return;

    setIsActing(true);
    try {
      await challanService.cancelChallan(challan.id);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading sales challan details..." />;

  if (!challan)
    return (
      <div className="p-12 text-center">
        <p className="text-lg font-bold text-slate-800">Challan not found</p>
        <Link to="/challans" className="mt-4 inline-flex items-center text-brand-600 font-semibold">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Challans
        </Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/challans" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Challans List
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="h-4 w-4 mr-2 text-slate-500" /> Print / Save PDF
          </button>
          {challan.status === 'DRAFT' && (
            <button
              onClick={handleConfirm}
              disabled={isActing}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm & Deduct Stock
            </button>
          )}
          {challan.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              disabled={isActing}
              className="inline-flex items-center px-4 py-2 rounded-xl border border-rose-300 text-rose-600 text-sm font-bold hover:bg-rose-50 disabled:opacity-50 transition-colors"
            >
              <XCircle className="h-4 w-4 mr-2" /> Cancel Challan
            </button>
          )}
        </div>
      </div>

      {/* Challan Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <ReceiptText className="h-6 w-6 text-brand-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {challan.challanNumber}
              </h1>
              <ChallanStatusBadge status={challan.status} />
            </div>
            {challan.status === 'DRAFT' && (
              <div className="flex items-center space-x-2 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="font-semibold">Draft: Inventory not yet deducted. Confirm to process stock.</span>
              </div>
            )}
            {challan.status === 'CONFIRMED' && (
              <div className="flex items-center space-x-2 mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="font-semibold">Confirmed: Warehouse inventory has been deducted for this challan.</span>
              </div>
            )}
          </div>
          <div className="text-right text-sm text-slate-500 space-y-1">
            <div className="flex items-center text-xs text-slate-500 justify-end">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Created: {new Date(challan.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">By: <span className="font-semibold text-slate-800">{challan.createdBy?.name}</span></div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="pt-6 pb-6 border-b border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-1.5" /> Bill To / Dispatch For
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900 text-base">{challan.customer?.businessName}</p>
            <p className="text-sm text-slate-700">Contact: {challan.customer?.name}</p>
            {challan.customer?.gstNumber && (
              <p className="font-mono text-xs text-slate-500">GSTIN: {challan.customer.gstNumber}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">{challan.customer?.address}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center">
            <Package className="h-4 w-4 mr-1.5" /> Order Line Items (Historical Price Snapshot)
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Product Name (Snapshot)</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(challan.items || []).map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-semibold">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.productNameSnapshot}</div>
                      {item.product?.warehouseLocation && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Rack: {item.product.warehouseLocation}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600">{item.skuSnapshot}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      ₹{item.unitPriceSnapshot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/80">
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">
                    Total: {challan.totalQuantity} units
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-semibold text-slate-600">Subtotal</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{challan.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="py-2 px-4 text-right text-xs font-semibold text-slate-600">GST Tax</td>
                  <td className="py-2 px-4 text-right font-bold text-slate-700">
                    ₹{challan.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="border-t border-slate-300">
                  <td colSpan={5} className="py-3 px-4 text-right text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Grand Total
                  </td>
                  <td className="py-3 px-4 text-right text-xl font-extrabold text-brand-700">
                    ₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {challan.notes && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Delivery Notes: </span>
              {challan.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
