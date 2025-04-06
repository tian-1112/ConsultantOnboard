import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Product, Category } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Filter products by category and search term
  const filteredProducts = products?.filter(product => {
    const matchesCategory = categoryFilter ? product.categoryId === categoryFilter : true;
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.description ? product.description.toLowerCase().includes(searchTerm.toLowerCase()) : false)
      : true;
    return matchesCategory && matchesSearch;
  });
  
  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">All Products</h1>
        
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Categories sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              <Button 
                variant={categoryFilter === null ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCategoryFilter(null)}
              >
                All Categories
              </Button>
              
              {categories?.map(category => (
                <Button 
                  key={category.id} 
                  variant={categoryFilter === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCategoryFilter(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="lg:col-span-3">
          {filteredProducts?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try changing your search or filter criteria</p>
              <Button onClick={() => {
                setSearchTerm('');
                setCategoryFilter(null);
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts?.map(product => (
                <Card key={product.id} className="overflow-hidden flex flex-col h-full">
                  <div className="h-48 overflow-hidden">
                    <Link href={`/products/${product.id}`}>
                      <img 
                        src={product.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </Link>
                  </div>
                  <CardContent className="pt-6 flex-grow">
                    <Link href={`/products/${product.id}`}>
                      <Badge className="mb-2">{categories?.find(c => c.id === product.categoryId)?.name}</Badge>
                      <CardTitle className="mb-2 hover:text-primary transition-colors">{product.name}</CardTitle>
                      <p className="text-muted-foreground line-clamp-2">{product.description}</p>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">${Number(product.price).toFixed(2)}</span>
                        <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </div>
                    </Link>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full" 
                      disabled={product.stock <= 0} 
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}