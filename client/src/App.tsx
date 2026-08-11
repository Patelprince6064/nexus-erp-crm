import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChallansPage } from './pages/ChallansPage';
import { ChallanBuilderPage } from './pages/ChallanBuilderPage';
import { ChallanDetailPage } from './pages/ChallanDetailPage';
import { UsersPage } from './pages/UsersPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes - All authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard - All roles */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Customer CRM - ADMIN, SALES, ACCOUNTS */}
              <Route
                element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}
              >
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
              </Route>

              {/* Products - All roles */}
              <Route path="/products" element={<ProductsPage />} />

              {/* Inventory - ADMIN, WAREHOUSE */}
              <Route
                element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}
              >
                <Route path="/inventory" element={<InventoryPage />} />
              </Route>

              {/* Sales Challans - All roles */}
              <Route path="/challans" element={<ChallansPage />} />
              <Route path="/challans/:id" element={<ChallanDetailPage />} />

              {/* Challan Builder - ADMIN, SALES */}
              <Route
                element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}
              >
                <Route path="/challans/new" element={<ChallanBuilderPage />} />
              </Route>

              {/* Users Management - ADMIN only */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all → Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
