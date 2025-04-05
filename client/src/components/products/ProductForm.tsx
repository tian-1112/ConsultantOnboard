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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { Product, Category } from "@shared/schema";

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}

const ProductForm = ({ product, categories, onClose }: ProductFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Extend the schema with additional validation
  const formSchema = insertProductSchema.extend({
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be a positive number",
    }),
    stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stock must be a non-negative number",
    }),
  });

  // Create or update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Convert string values to numbers
      const processedData = {
        ...data,
        price: data.price,
        stock: parseInt(data.stock.toString()),
        categoryId: data.categoryId ? parseInt(data.categoryId.toString()) : undefined,
      };

      if (product) {
        // Update existing product
        return apiRequest("PUT", `/api/products/${product.id}`, processedData);
      } else {
        // Create new product
        return apiRequest("POST", "/api/products", processedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: product ? "Product updated" : "Product created",
        description: product
          ? "The product has been updated successfully"
          : "New product has been added to inventory",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${product ? "update" : "create"} product: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      sku: product?.sku || "",
      price: product?.price?.toString() || "",
      stock: product?.stock?.toString() || "0",
      imageUrl: product?.imageUrl || "",
      categoryId: product?.categoryId?.toString() || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await productMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Red Roses Bouquet" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="RR-001" {...field} />
                </FormControl>
                <FormDescription>
                  Unique product identifier code
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input placeholder="24.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  className="w-full p-2 border border-gray-200 rounded-md"
                  {...field}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Link to product image (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Beautiful arrangement of fresh red roses..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <i className="ri-loader-2-line animate-spin mr-2"></i>
                {product ? "Updating..." : "Creating..."}
              </span>
            ) : product ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
