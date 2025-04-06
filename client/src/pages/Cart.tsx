import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { CartItem } from '@/lib/types';

// Mock cart data - in a real app this would come from state management or localStorage
const initialCartItems: CartItem[] = [
  {
    productId: 1,
    name: 'Red Roses',
    price: 29.99,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1548094990-c16ca90f1f0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    productId: 2,
    name: 'Tulip Bouquet',
    price: 24.99,
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1520219306112-90c15f970591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

export default function Cart() {
  const [, setLocation] = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(items => 
      items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  const removeItem = (productId: number) => {
    setCartItems(items => items.filter(item => item.productId !== productId));
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <Card key={item.productId} className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 overflow-hidden rounded-md">
                  <img 
                    src={item.imageUrl || 'https://placehold.co/100x100?text=No+Image'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <Link href={`/products/${item.productId}`} className="font-semibold hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                    <button 
                      onClick={() => removeItem(item.productId)} 
                      className="text-sm text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <p className="text-muted-foreground my-2">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0) {
                          updateQuantity(item.productId, value);
                        }
                      }}
                      className="w-16 text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </Button>
                    
                    <div className="ml-auto font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0 
                    ? 'Free' 
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              {shipping > 0 && (
                <div className="text-sm text-muted-foreground">
                  Free shipping on orders over $50
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <Button className="w-full" size="lg" onClick={() => setLocation('/checkout')}>
                Proceed to Checkout
              </Button>
              
              <div className="text-sm text-muted-foreground text-center mt-4">
                Secure payments powered by Stripe
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}