import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCategorySchema, 
  insertProductSchema, 
  insertCustomerSchema,
  insertOrderSchema, 
  insertOrderItemSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: 'An unexpected error occurred' });
  };

  // Categories API
  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get categories' });
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get category' });
    }
  });

  app.post('/api/categories', async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, data);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete category' });
    }
  });

  // Products API
  app.get('/api/products', async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      if (categoryId) {
        const products = await storage.getProductsByCategoryId(categoryId);
        return res.json(products);
      }
      
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get products' });
    }
  });

  app.get('/api/products/low-stock', async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get low stock products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get product' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put('/api/products/:id/stock', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number') {
        return res.status(400).json({ message: 'Quantity must be a number' });
      }
      
      const product = await storage.updateProductStock(id, quantity);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update product stock' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Customers API
  app.get('/api/customers', async (_req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get customers' });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get customer' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(id, data);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomer(id);
      if (!success) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete customer' });
    }
  });

  // Orders API
  app.get('/api/orders', async (req, res) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      
      if (customerId) {
        const orders = await storage.getOrdersByCustomerId(customerId);
        return res.json(orders);
      }
      
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get orders' });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Get order items
      const items = await storage.getOrderItems(id);
      
      // Return full order with items
      res.json({ ...order, items });
    } catch (err) {
      res.status(500).json({ message: 'Failed to get order' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { order, items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Order must have at least one item' });
      }
      
      const orderData = insertOrderSchema.parse(order);
      
      // Parse items, orderId will be added in the storage.createOrder method
      const itemsData = items.map(item => {
        // Remove orderId if it exists (will be set by the storage method)
        const { orderId, ...itemWithoutOrderId } = item;
        return insertOrderItemSchema.omit({ orderId: true }).parse(itemWithoutOrderId);
      });
      
      const newOrder = await storage.createOrder(orderData, itemsData);
      const orderItems = await storage.getOrderItems(newOrder.id);
      
      res.status(201).json({ ...newOrder, items: orderItems });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.put('/api/orders/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (typeof status !== 'string') {
        return res.status(400).json({ message: 'Status must be a string' });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  // Stripe Payment API
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || isNaN(Number(amount))) {
        return res.status(400).json({ message: 'Valid amount is required' });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(amount) * 100), // Convert to cents
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: { integration_check: 'accept_a_payment' },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ 
        message: 'Error creating payment intent', 
        error: error.message 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize database with sample data
  // This is safe to call multiple times as it checks if data already exists
  try {
    // Check if storage instance has initializeData method (DatabaseStorage vs MemStorage)
    if (typeof (storage as any).initializeData === 'function') {
      await (storage as any).initializeData();
      console.log('Database initialized with sample data');
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }

  return httpServer;
}
