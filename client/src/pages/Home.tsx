import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product, Category } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Add to cart function
  const addToCart = (product: Product) => {
    // For now, just show a toast
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Filter products by category
  const filteredProducts = categoryFilter
    ? products?.filter(product => product.categoryId === categoryFilter)
    : products;
  
  // Featured product (first product for now)
  const featuredProduct = products?.[0];
  
  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-green-900/80 to-green-700/80 rounded-lg overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: "url('https://images.unsplash.com/photo-1561181286-d5c73431a97f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')",
               backgroundSize: 'cover',
               backgroundPosition: 'center',
             }} />
        <div className="relative p-8 md:p-12 flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Welcome to Petals Flower Shop</h1>
          <p className="text-white/90 text-lg max-w-xl mb-6">
            Beautiful fresh flowers for every occasion. From elegant bouquets to stunning arrangements, 
            we have the perfect floral gift for your loved ones.
          </p>
          <Button size="lg" asChild>
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      </div>
      
      {/* Category filter */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={categoryFilter === null ? "default" : "outline"}
            onClick={() => setCategoryFilter(null)}
          >
            All
          </Button>
          {categories?.map(category => (
            <Button 
              key={category.id} 
              variant={categoryFilter === category.id ? "default" : "outline"}
              onClick={() => setCategoryFilter(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Featured product section */}
      {featuredProduct && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-6 rounded-lg">
            <div className="overflow-hidden rounded-lg h-[300px]">
              <img 
                src={featuredProduct.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                alt={featuredProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <Badge className="mb-2 w-fit">{categories?.find(c => c.id === featuredProduct.categoryId)?.name}</Badge>
              <h3 className="text-2xl font-bold mb-2">{featuredProduct.name}</h3>
              <p className="text-muted-foreground mb-4">{featuredProduct.description}</p>
              <p className="text-xl font-semibold mb-4">${Number(featuredProduct.price).toFixed(2)}</p>
              <div className="flex gap-4">
                <Button onClick={() => addToCart(featuredProduct)}>Add to Cart</Button>
                <Button variant="outline" asChild>
                  <Link href={`/products/${featuredProduct.id}`}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Products section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts?.map(product => (
            <Card key={product.id} className="overflow-hidden flex flex-col h-full">
              <div className="h-48 overflow-hidden">
                <img 
                  src={product.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="pt-6 flex-grow">
                <Badge className="mb-2">{categories?.find(c => c.id === product.categoryId)?.name}</Badge>
                <CardTitle className="mb-2">{product.name}</CardTitle>
                <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">${Number(product.price).toFixed(2)}</span>
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Button 
                  className="flex-grow" 
                  disabled={product.stock <= 0} 
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
                <Button variant="outline" asChild className="flex-grow">
                  <Link href={`/products/${product.id}`}>Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}