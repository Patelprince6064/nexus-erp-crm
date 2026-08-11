import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Boxes,
  MapPin,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { productService } from '../services/product.service';
import { Product, PaginationMeta } from '../types';
import { TableSkeleton } from '../components/common/LoadingSpinner';
import { StockStatusBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Fasteners',
    unitPrice: 100,
    currentStock: 50,
    minimumStockAlert: 10,
    warehouseLocation: 'Rack A-01',
    isActive: true,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        page,
        limit: 10,
        search: search || undefined,
        category: categoryFilter || undefined,
      });
      if (res.success && res.data) {
        setProducts(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to fetch product catalog', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Fasteners',
      unitPrice: 100,
      currentStock: 50,
      minimumStockAlert: 10,
      warehouseLocation: 'Rack A-01',
      isActive: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      unitPrice: prod.unitPrice,
      currentStock: prod.currentStock,
      minimumStockAlert: prod.minimumStockAlert,
      warehouseLocation: prod.warehouseLocation,
      isActive: prod.isActive,
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
      } else {
        await productService.createProduct(formData);
      }
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this product item?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to deactivate product');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Package className="h-7 w-7 text-brand-600 mr-3" />
            Product Master Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage SKU listings, unit prices, minimum alert levels, and warehouse rack locations.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product Item
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name, SKU code, category, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1 text-slate-500 text-xs font-semibold uppercase">
            <Filter className="h-4 w-4" />
            <span>Category:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white focus:border-brand-500 w-full md:w-auto"
          >
            <option value="">All Categories</option>
            <option value="Fasteners">Fasteners</option>
            <option value="Bearings">Bearings</option>
            <option value="Industrial Valves">Industrial Valves</option>
            <option value="Power Tools">Power Tools</option>
            <option value="Safety Gear">Safety Gear</option>
            <option value="Electrical">Electrical</option>
            <option value="Hydraulics">Hydraulics</option>
            <option value="Abrasives">Abrasives</option>
            <option value="Consumables">Consumables</option>
          </select>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">No products found</p>
            <p className="text-sm text-slate-500 mt-1">Try modifying search term or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3.5 px-4">Product / Category</th>
                  <th className="py-3.5 px-4">SKU Code</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Min Alert</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                        <Tag className="h-3 w-3 mr-1 text-slate-400" />
                        {prod.category}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-700 bg-slate-50/50">
                      {prod.sku}
                    </td>

                    <td className="py-4 px-4 font-extrabold text-slate-900">
                      ₹{prod.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-4">
                      <StockStatusBadge currentStock={prod.currentStock} minStockAlert={prod.minimumStockAlert} />
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-600">
                      {prod.minimumStockAlert} units
                    </td>

                    <td className="py-4 px-4 text-xs font-mono text-slate-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                        {prod.warehouseLocation}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Deactivate Product"
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product to Catalog'}
        maxWidth="xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Hex Bolt Stainless Steel M8 x 50mm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unique SKU Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 font-mono uppercase"
                placeholder="FAST-HEX-M8-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Fasteners"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Unit Price (₹ INR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Current Stock Level *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Stock Alert Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.minimumStockAlert}
                onChange={(e) => setFormData({ ...formData, minimumStockAlert: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Warehouse Rack Location *
              </label>
              <input
                type="text"
                required
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500"
                placeholder="Rack A-12"
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
              {editingProduct ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
