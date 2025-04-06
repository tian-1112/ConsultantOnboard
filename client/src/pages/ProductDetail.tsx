import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product, Category } from '@shared/schema';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch single product
  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', parseInt(id || '0')],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!id,
  });
  
  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch related products
  const { data: relatedProducts, isLoading: relatedLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', 'related', product?.categoryId],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      const response = await fetch(`/api/products?categoryId=${product.categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch related products');
      const data = await response.json();
      return data.filter((p: Product) => p.id !== product.id).slice(0, 4);
    },
    enabled: !!product?.categoryId,
  });
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 0)) {
      setQuantity(value);
    }
  };
  
  const addToCart = () => {
    if (!product) return;
    
    toast({
      title: 'Added to cart',
      description: `${quantity} × ${product.name} added to your cart`,
    });
  };
  
  const category = product?.categoryId 
    ? categories?.find(c => c.id === product.categoryId) 
    : undefined;
  
  if (productLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">Sorry, we couldn't find the product you're looking for.</p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>
      
      {/* Product detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="overflow-hidden rounded-lg h-[400px] md:h-[500px]">
          <img 
            src={product.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex flex-col">
          <Badge variant="outline" className="mb-2 w-fit">{category?.name || 'Uncategorized'}</Badge>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="mb-6">
            <span className="text-2xl font-semibold">${Number(product.price).toFixed(2)}</span>
          </div>
          
          <p className="text-muted-foreground mb-6">{product.description}</p>
          
          <div className="mb-4">
            <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="text-sm">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>
          
          <Separator className="mb-6" />
          
          <div className="space-y-6">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="w-20">Quantity:</span>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      value={quantity}
                      onChange={handleQuantityChange}
                      min={1}
                      max={product.stock}
                      className="w-16 text-center mx-2"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button size="lg" className="flex-grow" onClick={addToCart}>
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="secondary" className="flex-grow">
                    Buy Now
                  </Button>
                </div>
              </>
            ) : (
              <Button size="lg" disabled className="w-full">
                Out of Stock
              </Button>
            )}
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related products */}
      {!relatedLoading && relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <Card key={relatedProduct.id} className="overflow-hidden">
                <Link href={`/products/${relatedProduct.id}`}>
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={relatedProduct.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1">{relatedProduct.name}</h3>
                    <p className="text-muted-foreground line-clamp-1 mb-2">{relatedProduct.description}</p>
                    <span className="font-medium">${Number(relatedProduct.price).toFixed(2)}</span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}