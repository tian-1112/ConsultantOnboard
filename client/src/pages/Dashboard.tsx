import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/ui/stats-card";
import { DashboardStats, ProductStatus } from "@/lib/types";
import { Product, Order, Customer } from "@shared/schema";

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    ordersToday: 0,
    lowStockItems: 0,
    totalCustomers: 0,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch low stock products
  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/low-stock'],
  });

  useEffect(() => {
    if (products && orders && customers && lowStockProducts) {
      // Calculate dashboard statistics
      const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
      
      // Get orders from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersToday = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= today;
      }).length;
      
      setStats({
        totalSales,
        ordersToday,
        lowStockItems: lowStockProducts.length,
        totalCustomers: customers.length,
      });
    }
  }, [products, orders, customers, lowStockProducts]);

  const isLoading = productsLoading || ordersLoading || customersLoading || lowStockLoading;

  // Helper function to determine product status
  const getProductStatus = (stock: number): ProductStatus => {
    if (stock <= 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  // Helper function to get status color class
  const getStatusColorClass = (status: ProductStatus): string => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loading states
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))
        ) : (
          <>
            <StatsCard 
              title="Total Sales" 
              value={`$${stats.totalSales.toFixed(2)}`} 
              icon="ri-money-dollar-circle-line" 
              change="+8% from last month" 
              changeType="increase"
              borderColor="border-primary"
            />
            <StatsCard 
              title="Orders Today" 
              value={stats.ordersToday} 
              icon="ri-shopping-bag-line" 
              change="+2 since yesterday" 
              changeType="increase"
              borderColor="border-secondary"
            />
            <StatsCard 
              title="Low Stock Items" 
              value={stats.lowStockItems} 
              icon="ri-alert-line" 
              change="3 items need reordering" 
              changeType={stats.lowStockItems > 5 ? 'decrease' : 'neutral'}
              borderColor="border-yellow-500"
            />
            <StatsCard 
              title="Total Customers" 
              value={stats.totalCustomers} 
              icon="ri-user-line" 
              change="+5% from last month" 
              changeType="increase"
              borderColor="border-green-500"
            />
          </>
        )}
      </div>

      {/* Recent orders and inventory sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <div className="p-4">
            {ordersLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0">
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            ) : orders && orders.length > 0 ? (
              <>
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="mb-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">Order #{order.id}</h4>
                        <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">${Number(order.total).toFixed(2)}</span>
                        <p className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-3">
                  <a href="/orders" className="text-sm text-primary hover:text-primary-dark font-medium">View all orders</a>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Low Stock Items</h2>
          </div>
          <div className="p-4">
            {lowStockLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lowStockProducts.map((product) => {
                      const status = getProductStatus(product.stock);
                      const statusClass = getStatusColorClass(status);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 overflow-hidden">
                                {product.imageUrl && (
                                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800">{product.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{product.sku}</td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{product.stock} units</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${statusClass}`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No low stock items</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
