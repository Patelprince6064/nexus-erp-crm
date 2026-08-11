import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Save,
  Calculator,
} from 'lucide-react';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { challanService } from '../services/challan.service';
import { Customer, Product, ChallanStatus } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface FormItem {
  productId: string;
  quantity: number;
}

export const ChallanBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ productId: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');
  const [taxPercentage, setTaxPercentage] = useState(18);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
        ]);

        if (custRes.success && custRes.data) {
          setCustomers(custRes.data);
          if (custRes.data.length > 0) setSelectedCustomerId(custRes.data[0].id);
        }

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
          if (prodRes.data.length > 0) {
            setItems([{ productId: prodRes.data[0].id, quantity: 1 }]);
          }
        }
      } catch (err) {
        console.error('Failed to initialize challan builder', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    if (field === 'productId') {
      updated[index].productId = value;
    } else {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    }
    setItems(updated);
  };

  // Compute live financial totals
  let totalQuantity = 0;
  let subtotal = 0;
  let hasStockIssue = false;

  const itemCalculations = items.map((item) => {
    const product = productMap.get(item.productId);
    const availableStock = product ? product.currentStock : 0;
    const unitPrice = product ? product.unitPrice : 0;
    const itemSubtotal = unitPrice * item.quantity;
    const isInsufficient = product ? item.quantity > availableStock : false;

    if (isInsufficient) hasStockIssue = true;

    totalQuantity += item.quantity;
    subtotal += itemSubtotal;

    return {
      product,
      availableStock,
      unitPrice,
      itemSubtotal,
      isInsufficient,
    };
  });

  const taxAmount = Math.round(subtotal * (taxPercentage / 100) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleSaveChallan = async (status: ChallanStatus) => {
    if (!selectedCustomerId) {
      alert('Please select a customer');
      return;
    }

    if (items.some((i) => !i.productId)) {
      alert('Please select a valid product for every item line');
      return;
    }

    if (status === 'CONFIRMED' && hasStockIssue) {
      alert(
        'Cannot confirm challan: One or more products exceed available warehouse stock. Reduce quantities or save as Draft.'
      );
      return;
    }

    setIsSubmitting(true);
    setWarningMessage(null);

    try {
      const res = await challanService.createChallan({
        customerId: selectedCustomerId,
        items,
        status,
        notes: notes || undefined,
        taxPercentage,
      });

      if (res.success && res.data) {
        if (status === 'DRAFT') {
          alert(`Draft Sales Challan ${res.data.challanNumber} saved successfully. (Inventory was NOT reduced)`);
        } else {
          alert(`Sales Challan ${res.data.challanNumber} CONFIRMED! Inventory deducted successfully.`);
        }
        navigate(`/challans/${res.data.id}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save sales challan';
      setWarningMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Initializing Sales Challan Builder..." />;
  }

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/challans" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Challans List
        </Link>
        <span className="text-xs font-mono bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-bold">
          Auto Challan Number Generator
        </span>
      </div>

      {/* Main Builder Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <FileText className="h-7 w-7 text-brand-600 mr-3" />
            Create Sales Challan (Delivery Note / Order)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build wholesale quote or delivery challan. Confirming will deduct warehouse stock atomically.
          </p>
        </div>

        {warningMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-sm font-medium">
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transaction Failed</p>
              <p className="mt-0.5">{warningMessage}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Select Customer */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <Users className="h-4 w-4 mr-2 text-brand-600" />
            Step 1: Select Customer Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Account *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:border-brand-500 font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.name}) — {c.customerType}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomerObj && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{selectedCustomerObj.businessName}</div>
                <div className="text-slate-600">Contact: {selectedCustomerObj.name} ({selectedCustomerObj.mobile})</div>
                <div className="text-slate-500 truncate">Address: {selectedCustomerObj.address}</div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Line Items */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <Package className="h-4 w-4 mr-2 text-brand-600" />
              Step 2: Add Line Item Products
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Product Line
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const calc = itemCalculations[index];
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-colors ${
                    calc.isInsufficient ? 'bg-rose-50/50 border-rose-300' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                        Select Product Item
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:border-brand-500"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 text-xs">
                      <span className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                        Available Stock
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-1 rounded-md inline-block ${
                          calc.isInsufficient ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {calc.availableStock} units
                      </span>
                    </div>

                    <div className="md:col-span-2 text-xs">
                      <span className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                        Unit Price
                      </span>
                      <span className="font-bold text-slate-900">
                        ₹{calc.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={`w-full rounded-lg border p-2 text-sm font-bold ${
                          calc.isInsufficient ? 'border-rose-500 text-rose-700' : 'border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-1 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {calc.isInsufficient && (
                    <p className="mt-2 text-xs font-bold text-rose-600 flex items-center">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Requested quantity ({item.quantity}) exceeds warehouse stock ({calc.availableStock}). Confirmation will fail.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Financial Summary & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Challan Notes & Delivery Instructions
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500"
              placeholder="e.g. Delivery via V-Trans logistics. GST Invoice to be issued by Accounts."
            />
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <Calculator className="h-4 w-4 mr-1.5 text-brand-600" /> Financial Calculation Summary
            </h3>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Total Line Items:</span>
              <span className="font-semibold text-slate-900">{items.length} items</span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Total Units Quantity:</span>
              <span className="font-semibold text-slate-900">{totalQuantity} units</span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal Amount:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-sm text-slate-600 items-center">
              <span>GST Tax ({taxPercentage}%):</span>
              <span className="font-bold text-slate-900">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Grand Amount:</span>
              <span className="text-brand-700 text-lg">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* STEP 4: Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-1.5 flex-shrink-0" />
            <span>Note: Drafts do not reduce stock. Confirmed challans reduce inventory immediately.</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveChallan('DRAFT')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" /> Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting || hasStockIssue}
              onClick={() => handleSaveChallan('CONFIRMED')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Challan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
