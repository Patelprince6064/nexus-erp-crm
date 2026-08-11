import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Filter,
  History,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { inventoryService } from '../services/inventory.service';
import { productService } from '../services/product.service';
import { Product, StockMovement, MovementType, PaginationMeta } from '../types';
import { LoadingSpinner, TableSkeleton } from '../components/common/LoadingSpinner';
import { StockStatusBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

export const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('Purchase shipment received');
  const [referenceId, setReferenceId] = useState('PO-2026-001');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const [movementsRes, lowStockRes, productsRes] = await Promise.all([
        inventoryService.getMovements({
          page,
          limit: 10,
          movementType: (movementTypeFilter as MovementType) || undefined,
        }),
        inventoryService.getLowStockProducts(),
        productService.getProducts({ limit: 100 }),
      ]);

      if (movementsRes.success && movementsRes.data) {
        setMovements(movementsRes.data);
        setMeta(movementsRes.meta);
      }
      if (lowStockRes.success && lowStockRes.data) {
        setLowStockProducts(lowStockRes.data);
      }
      if (productsRes.success && productsRes.data) {
        setAllProducts(productsRes.data);
        if (productsRes.data.length > 0 && !selectedProductId) {
          setSelectedProductId(productsRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [page, movementTypeFilter]);

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    // Front-end check for OUT movements
    const targetProduct = allProducts.find((p) => p.id === selectedProductId);
    if (movementType === 'OUT' && targetProduct) {
      if (quantity > targetProduct.currentStock) {
        alert(
          `Cannot record Stock OUT. Requested quantity (${quantity}) exceeds current available stock (${targetProduct.currentStock}).`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await inventoryService.createMovement({
        productId: selectedProductId,
        quantity,
        movementType,
        reason,
        referenceId: referenceId || undefined,
      });

      if (res.success) {
        setIsMovementModalOpen(false);
        fetchInventoryData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record stock movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProductObj = allProducts.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Boxes className="h-7 w-7 text-brand-600 mr-3" />
            Inventory & Stock Movements
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock level tracking, low-stock threshold detection, and Stock IN/OUT audit history.
          </p>
        </div>
        <button
          onClick={() => setIsMovementModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Stock Movement
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-base">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Low-Stock Warning: {lowStockProducts.length} Products Need Replenishment</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((p) => (
              <div key={p.id} className="bg-white p-3 rounded-xl border border-amber-200 text-xs shadow-2xs">
                <div className="font-bold text-slate-900 truncate">{p.name}</div>
                <div className="text-slate-500 font-mono mt-0.5">{p.sku}</div>
                <div className="mt-2 flex items-center justify-between">
                  <StockStatusBadge currentStock={p.currentStock} minStockAlert={p.minimumStockAlert} />
                  <span className="text-slate-400 font-mono">{p.warehouseLocation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Movement Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <History className="h-5 w-5 text-slate-500 mr-2" />
            Stock Movement Audit Trail
          </h2>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-slate-500 uppercase">Movement Type:</span>
            <select
              value={movementTypeFilter}
              onChange={(e) => { setMovementTypeFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-brand-500"
            >
              <option value="">All Movements (IN & OUT)</option>
              <option value="IN">Stock IN (Purchases / Restock)</option>
              <option value="OUT">Stock OUT (Sales / Dispatches)</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : movements.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Boxes className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No stock movements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3.5 px-4">Movement Type</th>
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Logged By</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      {mov.movementType === 'IN' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          <ArrowDownLeft className="h-3.5 w-3.5 mr-1" />
                          STOCK IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                          <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                          STOCK OUT
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{mov.product?.name}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{mov.product?.sku}</div>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      {mov.movementType === 'IN' ? '+' : '-'}{mov.quantity} units
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-700 font-medium">
                      {mov.reason}
                      {mov.referenceId && (
                        <span className="ml-2 font-mono text-[10px] text-slate-400">
                          (Ref: {mov.referenceId})
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 font-semibold">
                      {mov.createdBy?.name || 'Warehouse Staff'}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {new Date(mov.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Record Stock Movement Modal */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Record Manual Stock Movement"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Product *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white focus:border-brand-500"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available Stock: {p.currentStock} units
                </option>
              ))}
            </select>
            {selectedProductObj && (
              <p className="mt-1 text-xs text-slate-500">
                Current warehouse stock: <span className="font-bold text-slate-900">{selectedProductObj.currentStock} units</span> ({selectedProductObj.warehouseLocation})
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Movement Direction *
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as MovementType)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm bg-white focus:border-brand-500"
              >
                <option value="IN">IN (Receiving / Restock)</option>
                <option value="OUT">OUT (Sales / Adjustment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity Units *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Justification *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500"
              placeholder="e.g. Purchase order PO-2026-005 receiving"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Reference ID / Invoice # (Optional)
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-brand-500 font-mono"
              placeholder="PO-2026-001"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsMovementModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
