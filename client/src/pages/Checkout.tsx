import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Link, useLocation } from 'wouter';

const CheckoutForm = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      
      // Redirect to success page
      setLocation('/order-success');
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
      
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center">
              <input type="radio" id="gopay" name="payment" className="mr-2" defaultChecked />
              <label htmlFor="gopay" className="font-medium">GoPay</label>
              <div className="w-12 h-8 bg-blue-500 rounded ml-auto flex items-center justify-center text-white font-bold text-xs">GoPay</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center">
              <input type="radio" id="ovo" name="payment" className="mr-2" />
              <label htmlFor="ovo" className="font-medium">OVO</label>
              <div className="w-12 h-8 bg-purple-700 rounded ml-auto flex items-center justify-center text-white font-bold text-xs">OVO</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center">
              <input type="radio" id="bca" name="payment" className="mr-2" />
              <label htmlFor="bca" className="font-medium">BCA Virtual Account</label>
              <div className="w-12 h-8 bg-blue-600 rounded ml-auto flex items-center justify-center text-white font-bold text-xs">BCA</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center">
              <input type="radio" id="mandiri" name="payment" className="mr-2" />
              <label htmlFor="mandiri" className="font-medium">Mandiri Virtual Account</label>
              <div className="w-16 h-8 bg-blue-900 rounded ml-auto flex items-center justify-center text-white font-bold text-xs">MANDIRI</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
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
        Your payment is securely processed. We accept e-wallet and debit payments.
      </p>
    </form>
  );
};

export default function Checkout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // No need to fetch payment intent from Stripe anymore
  useEffect(() => {
    // Placeholder for any additional initialization needed
  }, []);

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
                <Input id="phone" placeholder="+62 812-3456-7890" />
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
                  <Input id="city" placeholder="Jakarta" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="DKI Jakarta" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input id="zipCode" placeholder="12345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="Indonesia" />
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <CheckoutForm />
          </Card>
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
                  <p className="text-sm text-muted-foreground">1 × Rp 299.000</p>
                </div>
                <div className="font-semibold">Rp 299.000</div>
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
                  <p className="text-sm text-muted-foreground">2 × Rp 249.900</p>
                </div>
                <div className="font-semibold">Rp 499.800</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp 798.800</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp 798.800</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}