import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Customer, Product } from "@shared/schema";
import { z } from "zod";
import { X, Search, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface OrderFormProps {
  customers: Customer[];
  products: Product[];
  onClose: () => void;
}

interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

// Form validation schema
const formSchema = z.object({
  customerId: z.string().optional(),
  status: z.string().default("pending"),
});

const OrderForm = ({ customers, products, onClose }: OrderFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate total from order items
  const total = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (orderItems.length === 0) {
        throw new Error("Order must have at least one item");
      }

      const orderData = {
        order: {
          customerId: data.customerId ? parseInt(data.customerId) : undefined,
          status: data.status,
          total: total,
        },
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Order created",
        description: "The order has been created successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create order: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Set up form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      status: "pending",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await orderMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to order
  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      // Update quantity if item already exists
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.price),
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ]);
    }
  };

  // Remove item from order
  const removeOrderItem = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  // Update item quantity
  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeOrderItem(productId);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Filter products by search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer selection */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer (Optional)</FormLabel>
                <FormControl>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-md"
                    {...field}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Order status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <FormControl>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-md"
                    {...field}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Products</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Product search results */}
          <Card className="p-2 max-h-[200px] overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No products found
              </p>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => addProductToOrder(product)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 overflow-hidden mr-3">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku} | Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-primary mr-2">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Order items */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Order Items</h3>
            {orderItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 border rounded-md">
                No items added to this order
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orderItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-200 overflow-hidden mr-2">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <span className="text-sm">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateItemQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <i className="ri-subtract-line text-xs"></i>
                            </Button>
                            <Input
                              type="number"
                              className="w-12 mx-1 h-6 text-center p-0"
                              value={item.quantity}
                              min="1"
                              onChange={(e) =>
                                updateItemQuantity(
                                  item.productId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                updateItemQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              <i className="ri-add-line text-xs"></i>
                            </Button>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500"
                            onClick={() => removeOrderItem(item.productId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 py-2 text-sm font-medium text-right"
                      >
                        Total:
                      </td>
                      <td className="px-3 py-2 text-sm font-bold text-right text-primary">
                        ${total.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white"
              disabled={isLoading || orderItems.length === 0}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <i className="ri-loader-2-line animate-spin mr-2"></i>
                  Creating Order...
                </span>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OrderForm;
