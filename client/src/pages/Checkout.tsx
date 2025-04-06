import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'wouter';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/order-success',
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded! The redirect will happen thanks to the return_url
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold">Payment Information</h3>
      <PaymentElement />
      
      <div className="pt-4">
        <Button type="submit" className="w-full" size="lg" disabled={!stripe || isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Complete Order"
          )}
        </Button>
      </div>
      
      <p className="text-sm text-center text-muted-foreground">
        Your payment is securely processed by Stripe. We don't store your payment details.
      </p>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Create PaymentIntent when the page loads
    const fetchPaymentIntent = async () => {
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", { amount: 79.97 }); // Replace with actual cart total
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchPaymentIntent();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <div className="text-sm text-muted-foreground">
          <Link href="/cart" className="hover:text-primary transition-colors">
            Back to cart
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 (123) 456-7890" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" placeholder="1234 Main St" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="NY" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input id="zipCode" placeholder="10001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="United States" />
                </div>
              </div>
            </div>
          </Card>
          
          {clientSecret && (
            <Card className="p-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </Card>
          )}
          
          {!clientSecret && (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                    alt="Red Roses"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">Red Roses</p>
                  <p className="text-sm text-muted-foreground">1 × $29.99</p>
                </div>
                <div className="font-semibold">$29.99</div>
              </div>
              
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1520219306112-90c15f970591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                    alt="Tulip Bouquet"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">Tulip Bouquet</p>
                  <p className="text-sm text-muted-foreground">2 × $24.99</p>
                </div>
                <div className="font-semibold">$49.98</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$79.97</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>$79.97</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}