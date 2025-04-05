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
import { insertCustomerSchema } from "@shared/schema";
import { z } from "zod";
import { Customer } from "@shared/schema";

interface CustomerFormProps {
  customer: Customer | null;
  onClose: () => void;
}

const CustomerForm = ({ customer, onClose }: CustomerFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Extend the schema with additional validation
  const formSchema = insertCustomerSchema.extend({
    email: z.string().email("Invalid email address").or(z.literal("")).optional(),
    phone: z.string().optional(),
  });

  // Create or update customer mutation
  const customerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (customer) {
        // Update existing customer
        return apiRequest("PUT", `/api/customers/${customer.id}`, data);
      } else {
        // Create new customer
        return apiRequest("POST", "/api/customers", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: customer ? "Customer updated" : "Customer created",
        description: customer
          ? "The customer has been updated successfully"
          : "New customer has been added",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${customer ? "update" : "create"} customer: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await customerMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St, Anytown, USA"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Shipping and billing address</FormDescription>
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
                {customer ? "Updating..." : "Creating..."}
              </span>
            ) : customer ? (
              "Update Customer"
            ) : (
              "Create Customer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerForm;
