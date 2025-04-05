// Navigation item type definition
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  isActive?: boolean;
}

// Stats card type definition
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  borderColor?: string;
}

// Product status type
export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

// Order status type
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

// Dashboard statistics type
export interface DashboardStats {
  totalSales: number;
  ordersToday: number;
  lowStockItems: number;
  totalCustomers: number;
}

// Cart item interface for POS
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
