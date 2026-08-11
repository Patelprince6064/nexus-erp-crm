import React from 'react';
import { Role, CustomerStatus, CustomerType, ChallanStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    primary: 'bg-brand-50 text-brand-700 border border-brand-200',
    secondary: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-md font-medium tracking-wide ${sizeClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="danger">ADMIN</Badge>;
    case 'SALES':
      return <Badge variant="primary">SALES</Badge>;
    case 'WAREHOUSE':
      return <Badge variant="warning">WAREHOUSE</Badge>;
    case 'ACCOUNTS':
      return <Badge variant="secondary">ACCOUNTS</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};

export const CustomerStatusBadge: React.FC<{ status: CustomerStatus }> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">ACTIVE</Badge>;
    case 'LEAD':
      return <Badge variant="info">LEAD</Badge>;
    case 'INACTIVE':
      return <Badge variant="neutral">INACTIVE</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const CustomerTypeBadge: React.FC<{ type: CustomerType }> = ({ type }) => {
  switch (type) {
    case 'DISTRIBUTOR':
      return <Badge variant="secondary">DISTRIBUTOR</Badge>;
    case 'WHOLESALE':
      return <Badge variant="primary">WHOLESALE</Badge>;
    case 'RETAIL':
      return <Badge variant="info">RETAIL</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
};

export const ChallanStatusBadge: React.FC<{ status: ChallanStatus }> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="success">CONFIRMED</Badge>;
    case 'DRAFT':
      return <Badge variant="warning">DRAFT</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">CANCELLED</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export const StockStatusBadge: React.FC<{ currentStock: number; minStockAlert: number }> = ({
  currentStock,
  minStockAlert,
}) => {
  if (currentStock <= 0) {
    return <Badge variant="danger">OUT OF STOCK</Badge>;
  }
  if (currentStock <= minStockAlert) {
    return <Badge variant="warning">LOW STOCK ({currentStock})</Badge>;
  }
  return <Badge variant="success">IN STOCK ({currentStock})</Badge>;
};
