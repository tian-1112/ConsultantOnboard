import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle size={64} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for your purchase. We've received your order and will
          process it as soon as possible. You'll receive a confirmation 
          email shortly with all the details.
        </p>
        
        <div className="bg-muted/30 p-6 rounded-lg mb-8">
          <h2 className="font-semibold mb-2">Order Information</h2>
          <p className="text-sm">
            Order #: ORD-{Math.floor(100000 + Math.random() * 900000)}<br />
            Date: {new Date().toLocaleDateString()}<br />
            Payment Status: Completed
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}