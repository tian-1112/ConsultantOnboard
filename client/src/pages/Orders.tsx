import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OrderStatus } from "@/lib/types";
import OrderForm from "@/components/orders/OrderForm";
import { Order, Customer, Product } from "@shared/schema";

function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewOrderDetails, setViewOrderDetails] = useState<Order | null>(null);

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PUT', `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    }
  });

  // Filter orders by search term and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = `Order #${order.id}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get customer name by ID
  const getCustomerName = (customerId?: number) => {
    if (!customerId || !customers) return "N/A";
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : "N/A";
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewDetails = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setViewOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setShowOrderForm(true);
  };

  const handleFormClose = () => {
    setShowOrderForm(false);
    setSelectedOrder(null);
  };

  const isLoading = ordersLoading || customersLoading || productsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <Button onClick={handleCreateOrder} className="bg-primary hover:bg-primary-dark">
          <i className="ri-add-line mr-1"></i> New Order
        </Button>
      </div>

      {/* Filters and search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full p-2 border border-gray-200 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders && filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const statusClass = getStatusColor(order.status);
                      
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-800">#{order.id}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{getCustomerName(order.customerId)}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">{new Date(order.orderDate).toLocaleDateString()}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-700">${Number(order.total).toFixed(2)}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <select
                              className={`text-xs rounded-full px-2 py-1 ${statusClass} border-0 bg-transparent cursor-pointer`}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(order.id)}>
                              <i className="ri-eye-line"></i>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-sm text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* New Order form dialog */}
      <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <OrderForm 
            customers={customers || []} 
            products={products || []} 
            onClose={handleFormClose} 
          />
        </DialogContent>
      </Dialog>

      {/* Order details dialog */}
      <Dialog open={!!viewOrderDetails} onOpenChange={(open) => !open && setViewOrderDetails(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order #{viewOrderDetails?.id} Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="text-sm font-medium">{getCustomerName(viewOrderDetails?.customerId)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {viewOrderDetails?.orderDate && new Date(viewOrderDetails.orderDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${getStatusColor(viewOrderDetails?.status || '')}`}>
                  {viewOrderDetails?.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-sm font-medium">${viewOrderDetails && Number(viewOrderDetails.total).toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Order Items</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewOrderDetails?.items?.map((item) => {
                      const product = products?.find(p => p.id === item.productId);
                      return (
                        <tr key={item.id}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{product?.name || 'Unknown Product'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">${Number(item.unitPrice).toFixed(2)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                            ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setViewOrderDetails(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Orders;
