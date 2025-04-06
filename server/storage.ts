import { 
  users, type User, type InsertUser, 
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  customers, type Customer, type InsertCustomer,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lte, asc, desc } from "drizzle-orm";

// Storage interface for all data operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: InsertCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategoryId(categoryId: number): Promise<Product[]>;
  getLowStockProducts(threshold: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  updateProductStock(id: number, quantity: number): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: InsertCustomer): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }
  
  async updateCategory(id: number, category: InsertCategory): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return result !== null && Object.keys(result).length > 0;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }
  
  async getLowStockProducts(threshold: number): Promise<Product[]> {
    return await db.select().from(products).where(lte(products.stock, threshold));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    // First get the product to calculate new stock
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    
    const newStock = product.stock + quantity;
    
    const [updatedProduct] = await db
      .update(products)
      .set({ stock: newStock })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result !== null && Object.keys(result).length > 0;
  }
  
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  
  async updateCustomer(id: number, customer: InsertCustomer): Promise<Customer | undefined> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer || undefined;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result !== null && Object.keys(result).length > 0;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId));
  }
  
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Use transaction to ensure all or nothing
    return await db.transaction(async (tx) => {
      // Create the order
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      // Create order items with the new order id
      const orderItemsWithOrderId = items.map(item => ({
        ...item,
        orderId: newOrder.id
      }));
      
      if (orderItemsWithOrderId.length > 0) {
        await tx.insert(orderItems).values(orderItemsWithOrderId);
      }
      
      // Update product stock for each item
      for (const item of items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));
        
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await tx
            .update(products)
            .set({ stock: newStock })
            .where(eq(products.id, item.productId));
        }
      }
      
      return newOrder;
    });
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Initialize database with sample data
  async initializeData() {
    // Check if we already have data
    const result = await db.select().from(users);
    if (result.length > 0) {
      return; // Database already has data
    }

    // Add default admin user
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: "password", // Note: In production, this should be hashed
        name: "Admin User",
        role: "admin"
      })
      .returning();

    // Add sample categories
    const [freshFlowers] = await db
      .insert(categories)
      .values({ name: "Fresh Flowers", description: "Individual fresh cut flowers" })
      .returning();
    
    const [arrangements] = await db
      .insert(categories)
      .values({ name: "Arrangements", description: "Custom flower arrangements" })
      .returning();
    
    const [pottedPlants] = await db
      .insert(categories)
      .values({ name: "Potted Plants", description: "Live potted plants" })
      .returning();
    
    const [wedding] = await db
      .insert(categories)
      .values({ name: "Wedding", description: "Wedding flowers and arrangements" })
      .returning();

    // Add sample products
    await db.insert(products).values([
      {
        name: "Red Roses",
        description: "Beautiful long-stem red roses",
        sku: "RS-001",
        price: "24.99",
        imageUrl: "https://images.unsplash.com/photo-1564201716775-851813f7fc82?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: freshFlowers.id,
        stock: 78
      },
      {
        name: "Tulip Bouquet",
        description: "Colorful tulip bouquet with assorted colors",
        sku: "TB-012",
        price: "32.99",
        imageUrl: "https://images.unsplash.com/photo-1561181286-d5c73431a97f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: arrangements.id,
        stock: 42
      },
      {
        name: "Potted Orchid",
        description: "Elegant potted orchid plant",
        sku: "PO-053",
        price: "45.00",
        imageUrl: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: pottedPlants.id,
        stock: 12
      },
      {
        name: "Wedding Bouquet",
        description: "Classic white wedding bouquet",
        sku: "WB-024",
        price: "129.99",
        imageUrl: "https://images.unsplash.com/photo-1558350315-8aa00e8e4590?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: wedding.id,
        stock: 5
      },
      {
        name: "Succulent Collection",
        description: "Set of 3 small succulents in decorative pots",
        sku: "SC-087",
        price: "36.50",
        imageUrl: "https://images.unsplash.com/photo-1575773476816-873ad10f4908?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        categoryId: pottedPlants.id,
        stock: 0
      }
    ]);

    // Add sample customers
    await db.insert(customers).values([
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "555-123-4567",
        address: "123 Main St, Anytown, USA"
      },
      {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "555-987-6543",
        address: "456 Oak Ave, Somewhere, USA"
      }
    ]);
  }
}

// Create and export an instance of DatabaseStorage
export const storage = new DatabaseStorage();
