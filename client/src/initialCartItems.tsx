import { CartItem } from '@/lib/types';

// Update initial cart data to use correct pricing
export const initialCartItems: CartItem[] = [
  {
    productId: 1,
    name: 'Red Roses',
    price: 299000,
    quantity: 1,
    imageUrl: '/assets/red rose.jpeg'
  },
  {
    productId: 2,
    name: 'Tulip Bouquet',
    price: 249900,
    quantity: 2,
    imageUrl: '/assets/tulip bouquet.jpeg'
  }
];