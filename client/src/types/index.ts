export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdById: string;
  createdBy?: { id: string; name: string; email?: string };
  createdAt: string;
  updatedAt: string;
  followUps?: CustomerFollowUp[];
  challans?: Challan[];
  _count?: {
    followUps: number;
    challans: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  warehouseLocation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: { id: string; name: string; sku: string; category?: string; currentStock?: number };
  quantity: number;
  movementType: MovementType;
  reason: string;
  referenceId?: string | null;
  createdById: string;
  createdBy?: { id: string; name: string; role?: Role };
  createdAt: string;
}

export interface ChallanItem {
  id?: string;
  challanId?: string;
  productId: string;
  product?: { id: string; name: string; sku: string; currentStock: number; warehouseLocation: string };
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  status: ChallanStatus;
  totalQuantity: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string | null;
  createdById: string;
  createdBy?: { id: string; name: string; email?: string; role?: Role };
  createdAt: string;
  updatedAt: string;
  items?: ChallanItem[];
  _count?: { items: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string>;
}

export interface DashboardMetrics {
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  todaysChallans: number;
  confirmedChallans: number;
  draftChallans: number;
  pendingFollowUps: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: {
    customerStatus: Array<{ name: string; value: number; color?: string }>;
    customerTypes: Array<{ name: string; value: number }>;
  };
  lowStockAlerts: Product[];
  recentActivity: {
    customers: Customer[];
    challans: Challan[];
    movements: StockMovement[];
  };
  upcomingFollowUps: Customer[];
}
