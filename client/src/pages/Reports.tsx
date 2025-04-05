import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Product, Order, Category } from "@shared/schema";

function Reports() {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Fetch data for reports
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Prepare data for charts when data is loaded
  useEffect(() => {
    if (orders && products && categories) {
      generateSalesData(orders, timeFrame);
      generateCategoryData(orders, products, categories);
      generateTopProductsData(orders, products);
    }
  }, [orders, products, categories, timeFrame]);

  // Generate sales data based on time frame
  const generateSalesData = (orders: Order[], timeFrame: 'daily' | 'weekly' | 'monthly') => {
    if (!orders.length) return;

    // Group orders by date
    const salesByDate = new Map();
    
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      let key;
      
      if (timeFrame === 'daily') {
        // Format as YYYY-MM-DD
        key = orderDate.toISOString().split('T')[0];
      } else if (timeFrame === 'weekly') {
        // Get week number
        const startOfYear = new Date(orderDate.getFullYear(), 0, 1);
        const days = Math.floor((orderDate.getTime() - startOfYear.getTime()) / 
                      (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil(days / 7);
        key = `Week ${weekNumber}, ${orderDate.getFullYear()}`;
      } else {
        // Format as YYYY-MM
        key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      }
      
      const currentTotal = salesByDate.get(key) || 0;
      salesByDate.set(key, currentTotal + Number(order.total));
    });
    
    // Convert to array for chart
    const data = Array.from(salesByDate.entries()).map(([date, total]) => ({
      date,
      total
    }));
    
    // Sort by date
    data.sort((a, b) => a.date.localeCompare(b.date));
    
    setSalesData(data);
  };

  // Generate category distribution data
  const generateCategoryData = (orders: Order[], products: Product[], categories: Category[]) => {
    if (!orders.length || !products.length || !categories.length) return;
    
    // Map product IDs to their categories
    const productCategories = new Map();
    products.forEach(product => {
      if (product.categoryId) {
        productCategories.set(product.id, product.categoryId);
      }
    });
    
    // Count sales by category
    const salesByCategory = new Map();
    categories.forEach(category => {
      salesByCategory.set(category.id, { name: category.name, value: 0 });
    });
    
    // Process orders
    orders.forEach(async order => {
      try {
        // Fetch order items
        const response = await fetch(`/api/orders/${order.id}`);
        if (!response.ok) throw new Error('Failed to fetch order items');
        const orderDetail = await response.json();
        
        if (orderDetail.items) {
          orderDetail.items.forEach(item => {
            const categoryId = productCategories.get(item.productId);
            if (categoryId && salesByCategory.has(categoryId)) {
              const category = salesByCategory.get(categoryId);
              category.value += Number(item.unitPrice) * item.quantity;
              salesByCategory.set(categoryId, category);
            }
          });
        }
      } catch (error) {
        console.error('Error processing order for category data:', error);
      }
    });
    
    // Convert to array for chart
    setCategoryData(Array.from(salesByCategory.values()));
  };

  // Generate top products data
  const generateTopProductsData = (orders: Order[], products: Product[]) => {
    if (!orders.length || !products.length) return;
    
    // Track product sales
    const productSales = new Map();
    products.forEach(product => {
      productSales.set(product.id, { name: product.name, quantity: 0, revenue: 0 });
    });
    
    // Process orders
    orders.forEach(async order => {
      try {
        // Fetch order items
        const response = await fetch(`/api/orders/${order.id}`);
        if (!response.ok) throw new Error('Failed to fetch order items');
        const orderDetail = await response.json();
        
        if (orderDetail.items) {
          orderDetail.items.forEach(item => {
            if (productSales.has(item.productId)) {
              const product = productSales.get(item.productId);
              product.quantity += item.quantity;
              product.revenue += Number(item.unitPrice) * item.quantity;
              productSales.set(item.productId, product);
            }
          });
        }
      } catch (error) {
        console.error('Error processing order for product data:', error);
      }
    });
    
    // Convert to array and sort by revenue
    const topProductsArray = Array.from(productSales.values())
      .filter(product => product.quantity > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setTopProducts(topProductsArray);
  };

  const isLoading = productsLoading || ordersLoading || categoriesLoading;

  // Color palette for pie chart
  const COLORS = ['#6d9773', '#f4acb7', '#8bab91', '#d8e2dc', '#e99ca7'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Distribution</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Sales Over Time</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setTimeFrame('daily')}
                  className={`px-3 py-1 text-sm rounded-md ${timeFrame === 'daily' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeFrame('weekly')}
                  className={`px-3 py-1 text-sm rounded-md ${timeFrame === 'weekly' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeFrame('monthly')}
                  className={`px-3 py-1 text-sm rounded-md ${timeFrame === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100'}`}
                >
                  Monthly
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : salesData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      tick={{fontSize: 12}}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Sales" fill="#6d9773" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales by Category</h2>
            
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : categoryData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h2>
            
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : topProducts.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProducts}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{fontSize: 12}}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`$${value.toFixed(2)}`, 'Revenue'];
                        return [value, name === 'quantity' ? 'Units Sold' : name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#6d9773" />
                    <Bar dataKey="quantity" name="Units Sold" fill="#f4acb7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">No product sales data available</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Reports;
