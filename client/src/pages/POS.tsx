import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "@/lib/types";
import { Product, Category, Customer } from "@shared/schema";

function POS() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
    queryFn: async ({ queryKey }) => {
      const categoryId = queryKey[1];
      const url = categoryId 
        ? `/api/products?categoryId=${categoryId}` 
        : '/api/products';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/orders', data);
    },
    onSuccess: () => {
      toast({
        title: "Order completed",
        description: "The order has been successfully processed",
      });
      setCart([]);
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create order: ${error}`,
        variant: "destructive",
      });
    }
  });

  // Filter products by search term
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter customers by search term
  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(customerSearchTerm))
  );

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Increase quantity if already in cart
        return prevCart.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          imageUrl: product.imageUrl,
        }];
      }
    });
  };

  const handleUpdateCartItemQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    } else {
      // Update quantity
      setCart(prevCart => prevCart.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDialog(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to the cart before checking out",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        order: {
          customerId: selectedCustomer?.id,
          status: "pending",
          total: cartTotal,
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        }))
      };

      // Create the order
      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Point of Sale</h1>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 pb-4 h-full">
        {/* Products section */}
        <div className="w-full lg:w-2/3">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <select
                    className="w-full p-2 border border-gray-200 rounded-md"
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">All Categories</option>
                    {categories?.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading || categoriesLoading ? (
                <Skeleton className="h-full w-full" />
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleAddToCart(product)}
                    >
                      <div className="h-40 bg-gray-100 overflow-hidden">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <i className="ri-image-line text-3xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800">{product.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-lg font-semibold text-primary">${Number(product.price).toFixed(2)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' : 
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Cart section */}
        <div className="w-full lg:w-1/3">
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Current Order</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCustomerDialog(true)}
              >
                {selectedCustomer ? selectedCustomer.name : "Select Customer"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex border-b pb-3">
                      <div className="h-16 w-16 flex-shrink-0 rounded bg-gray-200 overflow-hidden mr-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-primary font-medium">${item.price.toFixed(2)}</span>
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => handleUpdateCartItemQuantity(item.productId, item.quantity - 1)}
                            >
                              <i className="ri-subtract-line"></i>
                            </Button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7" 
                              onClick={() => handleUpdateCartItemQuantity(item.productId, item.quantity + 1)}
                            >
                              <i className="ri-add-line"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 ml-2 text-red-500" 
                              onClick={() => handleRemoveFromCart(item.productId)}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 text-right mt-1">
                          Subtotal: ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Tax (included):</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span className="text-primary">${cartTotal.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary-dark" 
                size="lg"
                onClick={handleCheckout}
                disabled={cart.length === 0 || createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Processing..." : "Complete Sale"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Customer selection dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search customers..."
                className="pl-8"
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {customersLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : filteredCustomers && filteredCustomers.length > 0 ? (
              <div className="space-y-2">
                {filteredCustomers.map(customer => (
                  <div 
                    key={customer.id} 
                    className="p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary mr-3">
                        <span className="font-semibold text-sm">{customer.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{customer.name}</h3>
                        <p className="text-xs text-gray-500">
                          {customer.email || ''} {customer.phone ? `• ${customer.phone}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No customers found</p>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSelectedCustomer(null)}>
              Continue without customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default POS;
