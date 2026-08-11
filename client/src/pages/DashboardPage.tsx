import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Boxes,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { DashboardData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ChallanStatusBadge, StockStatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Gathering real-time ERP analytics..." />;
  }

  if (!data) return null;

  const { metrics, charts, lowStockAlerts, recentActivity, upcomingFollowUps } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Here is today's ERP & CRM operational summary.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/challans/new"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sales Challan
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Customers</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.totalCustomers}</p>
            <span className="text-xs font-medium text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Active CRM Accounts
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Products</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{metrics.totalProducts}</p>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Catalog inventory</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low Stock Alerts</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{metrics.lowStockCount}</p>
            <span className="text-xs font-medium text-amber-600 mt-1 block">Needs Restock</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Confirmed Challans</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{metrics.confirmedChallans}</p>
            <span className="text-xs font-medium text-slate-500 mt-1 block">
              {metrics.draftChallans} Drafts Pending
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Status Breakdown</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.customerStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.customerStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-2">
            {charts.customerStatus.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }} />
                <span className="text-xs font-semibold text-slate-700">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Types Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Segment Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.customerTypes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#026fc7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Section & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Low Stock Inventory Alerts</h2>
            </div>
            <Link to="/inventory" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center">
              View All Inventory <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Current Stock</th>
                  <th className="py-3 px-3">Min Threshold</th>
                  <th className="py-3 px-3">Rack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStockAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 text-sm">
                      🎉 All inventory levels are above minimum alert thresholds!
                    </td>
                  </tr>
                ) : (
                  lowStockAlerts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{prod.name}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">{prod.sku}</td>
                      <td className="py-3 px-3">
                        <StockStatusBadge currentStock={prod.currentStock} minStockAlert={prod.minimumStockAlert} />
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{prod.minimumStockAlert} units</td>
                      <td className="py-3 px-3 text-slate-500 text-xs font-mono">{prod.warehouseLocation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming CRM Follow-ups Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900">CRM Follow-ups</h2>
            </div>
            <Link to="/customers" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View CRM
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingFollowUps.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No pending follow-ups scheduled for today.</p>
            ) : (
              upcomingFollowUps.map((cust) => (
                <div key={cust.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <Link to={`/customers/${cust.id}`} className="font-bold text-slate-900 text-sm hover:text-brand-600">
                      {cust.name}
                    </Link>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {cust.customerType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{cust.businessName}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-slate-400" />
                    Due: {cust.followUpDate ? new Date(cust.followUpDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Challans Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Sales Challans</h2>
          <Link to="/challans" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center">
            All Challans <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-3">Challan #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Total Qty</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivity.challans.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-brand-700">
                    <Link to={`/challans/${ch.id}`}>{ch.challanNumber}</Link>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {ch.customer?.businessName || ch.customer?.name}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{ch.totalQuantity} items</td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{ch.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <ChallanStatusBadge status={ch.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-xs">
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
