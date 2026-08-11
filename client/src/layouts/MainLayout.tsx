import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileText,
  Clock,
  UserCheck,
  LogOut,
  Menu,
  X,
  Building2,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';

export const MainLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-aware navigation definitions matching section 17 requirements
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      name: 'Customers CRM',
      href: '/customers',
      icon: Users,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS'],
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: Boxes,
      roles: ['ADMIN', 'WAREHOUSE'],
    },
    {
      name: 'Sales Challans',
      href: '/challans',
      icon: FileText,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
    },
    {
      name: 'Follow-ups',
      href: '/customers',
      icon: Clock,
      roles: ['ADMIN', 'SALES'],
    },
    {
      name: 'Employees',
      href: '/users',
      icon: UserCheck,
      roles: ['ADMIN'],
    },
  ];

  const allowedNavItems = navigationItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-md">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-none">
                  Apex Logistics ERP
                </span>
                <span className="text-[10px] text-brand-300 font-medium tracking-wider uppercase">
                  Wholesale & CRM Operations
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
            </button>

            <div className="hidden sm:flex items-center space-x-3 border-l border-slate-800 pl-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user?.name}</span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
              {role && <RoleBadge role={role} />}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-slate-200">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="px-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Logged in as
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{user?.name}</p>
                <div className="mt-1.5">
                  {role && <RoleBadge role={role} />}
                </div>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
              {allowedNavItems.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">Mini ERP + CRM Portal v1.0</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PostgreSQL & Prisma Engine</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-200">
                <span className="text-lg font-bold text-slate-900">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="mt-4 flex-1 px-3 space-y-1">
                {allowedNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 text-slate-500" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
