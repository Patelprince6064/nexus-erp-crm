import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck2,
  Users2,
  ShieldAlert,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex font-sans bg-slate-900 overflow-hidden">
      {/* LEFT COLUMN: Modern Gradient Brand Hero Showcase (Hidden on small screens, 55-60% width on desktop) */}
      <div className="hidden lg:flex lg:w-7/12 relative bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 p-12 xl:p-16 flex-col justify-between overflow-hidden select-none">
        {/* Subtle Decorative Background Glow Spheres */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-xl">
            <Building2 className="h-7 w-7 text-cyan-300" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">Apex ERP + CRM</span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-cyan-200/80">Operations Portal</span>
          </div>
        </div>

        {/* Middle Main Hero Headline */}
        <div className="relative z-10 my-auto max-w-xl pr-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-cyan-200 mb-6">
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            <span>Enterprise Wholesale Operations & Distribution Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Your Wholesale ERP. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-100">
              Always Ready.
            </span>
          </h1>

          <p className="mt-4 text-base text-blue-100/80 leading-relaxed font-normal">
            Seamlessly coordinate wholesale customer CRM pipelines, SKU-level stock control, automated GST sales challan dispatch, and departmental permissions.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
            {[
              { icon: Zap, title: 'Atomic Stock Deductions', desc: 'Zero negative inventory guarantees on order confirmation.' },
              { icon: FileCheck2, title: 'GST Sales Challans', desc: 'Auto-sequence numbering with historical price snapshots.' },
              { icon: Users2, title: 'Pipeline Customer CRM', desc: 'Track leads, active distributors, and follow-up interaction history.' },
              { icon: ShieldAlert, title: 'Role-Based RBAC', desc: 'Strict security for Admin, Sales, Warehouse, and Accounts teams.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
                <div className="flex items-center space-x-2.5 mb-1">
                  <div className="p-1.5 rounded-lg bg-cyan-400/20 text-cyan-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-white">{title}</h3>
                </div>
                <p className="text-[11px] text-blue-100/70 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/60 font-medium">
          <span>&copy; {new Date().getFullYear()} Apex ERP & CRM Systems</span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>REST API v1.0 Operational</span>
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Crisp White Sign-In Card Container (100% width mobile, 40-45% width desktop) */}
      <div className="w-full lg:w-5/12 bg-white flex flex-col justify-between p-8 sm:p-12 xl:p-16 overflow-y-auto">
        {/* Mobile Header Logo (Visible only on small screens) */}
        <div className="lg:hidden flex items-center space-x-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900">Apex ERP + CRM</span>
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Operations Portal</span>
          </div>
        </div>

        <div className="my-auto max-w-md w-full mx-auto space-y-8">
          {/* Section Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Enter your work credentials or choose a demo role to quick fill.
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center space-x-3 animate-shake">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium outline-none transition-all"
                  placeholder="admin@erp-demo.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-sm font-medium outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/25 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Select Demo Role to Quick Fill:</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@erp-demo.com', 'Admin@123')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all text-left group"
              >
                <div className="font-extrabold text-xs text-rose-700 group-hover:text-rose-800 flex items-center justify-between">
                  <span>ADMIN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Full System Access</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('sales@erp-demo.com', 'Sales@123')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all text-left group"
              >
                <div className="font-extrabold text-xs text-blue-700 group-hover:text-blue-800 flex items-center justify-between">
                  <span>SALES</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">CRM & Sales Challans</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('warehouse@erp-demo.com', 'Warehouse@123')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-all text-left group"
              >
                <div className="font-extrabold text-xs text-amber-700 group-hover:text-amber-800 flex items-center justify-between">
                  <span>WAREHOUSE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Stock & Movements</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('accounts@erp-demo.com', 'Accounts@123')}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all text-left group"
              >
                <div className="font-extrabold text-xs text-indigo-700 group-hover:text-indigo-800 flex items-center justify-between">
                  <span>ACCOUNTS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Financial Dashboard</div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom security assurance */}
        <div className="pt-6 text-center text-xs text-slate-400 font-medium">
          Protected by 256-bit JWT authentication & bcrypt password encryption
        </div>
      </div>
    </div>
  );
};
