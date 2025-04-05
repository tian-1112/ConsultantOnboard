import { 
  users, type User, type InsertUser, 
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  customers, type Customer, type InsertCustomer,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private customerId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.customerId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Add default admin user
    this.createUser({
      username: "admin",
      password: "password",
      name: "Admin User",
      role: "admin"
    });
    
    // Add sample categories
    const freshFlowers = this.createCategory({ name: "Fresh Flowers", description: "Individual fresh cut flowers" });
    const arrangements = this.createCategory({ name: "Arrangements", description: "Custom flower arrangements" });
    const pottedPlants = this.createCategory({ name: "Potted Plants", description: "Live potted plants" });
    const wedding = this.createCategory({ name: "Wedding", description: "Wedding flowers and arrangements" });
    
    // Add sample products
    this.createProduct({
      name: "Red Roses",
      description: "Beautiful long-stem red roses",
      sku: "RS-001",
      price: "24.99",
      imageUrl: "https://images.unsplash.com/photo-1564201716775-851813f7fc82?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      categoryId: freshFlowers.id,
      stock: 78
    });
    
    this.createProduct({
      name: "Tulip Bouquet",
      description: "Colorful tulip bouquet with assorted colors",
      sku: "TB-012",
      price: "32.99",
      imageUrl: "https://images.unsplash.com/photo-1561181286-d5c73431a97f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      categoryId: arrangements.id,
      stock: 42
    });
    
    this.createProduct({
      name: "Potted Orchid",
      description: "Elegant potted orchid plant",
      sku: "PO-053",
      price: "45.00",
      imageUrl: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      categoryId: pottedPlants.id,
      stock: 12
    });
    
    this.createProduct({
      name: "Wedding Bouquet",
      description: "Classic white wedding bouquet",
      sku: "WB-024",
      price: "129.99",
      imageUrl: "https://images.unsplash.com/photo-1558350315-8aa00e8e4590?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      categoryId: wedding.id,
      stock: 5
    });
    
    this.createProduct({
      name: "Succulent Collection",
      description: "Set of 3 small succulents in decorative pots",
      sku: "SC-087",
      price: "36.50",
      imageUrl: "https://images.unsplash.com/photo-1575773476816-873ad10f4908?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      categoryId: pottedPlants.id,
      stock: 0
    });
    
    // Add sample customers
    this.createCustomer({
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "555-123-4567",
      address: "123 Main St, Anytown, USA"
    });
    
    this.createCustomer({
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "555-987-6543",
      address: "456 Oak Ave, Somewhere, USA"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: InsertCategory): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: Category = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategoryId(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }
  
  async getLowStockProducts(threshold: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.stock <= threshold
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async updateProductStock(id: number, quantity: number): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = { 
      ...existingProduct, 
      stock: existingProduct.stock + quantity 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const newCustomer: Customer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }
  
  async updateCustomer(id: number, customer: InsertCustomer): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer: Customer = { ...existingCustomer, ...customer };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customerId === customerId
    );
  }
  
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      orderDate: new Date() 
    };
    this.orders.set(id, newOrder);
    
    // Add order items
    const orderItemsWithIds: OrderItem[] = items.map(item => {
      const itemId = this.orderItemId++;
      
      // Update product stock
      const product = this.products.get(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        this.products.set(product.id, product);
      }
      
      return { ...item, id: itemId, orderId: id };
    });
    
    this.orderItems.set(id, orderItemsWithIds);
    
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder: Order = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.orderItems.get(orderId) || [];
  }
}

export const storage = new MemStorage();
