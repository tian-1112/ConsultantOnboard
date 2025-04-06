import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Fixed floral background pattern with reduced opacity */}
      <div className="fixed inset-0 z-[-1] bg-[url('https://images.unsplash.com/photo-1559511260-66a654ae982a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat opacity-[0.03]"></div>

      {/* Navigation Header */}
      <Sidebar onNavItemClick={() => setMobileMenuOpen(false)} />

      {/* Mobile menu - slides in from side */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-full sm:max-w-sm p-0">
            <div className="h-full flex flex-col py-20 px-6">
              <nav className="space-y-6 text-lg">
                <a href="/" className="block py-2 font-medium hover:text-primary transition-colors">Home</a>
                <a href="/products" className="block py-2 font-medium hover:text-primary transition-colors">Shop All</a>
                <a href="/products?categoryId=1" className="block py-2 font-medium hover:text-primary transition-colors">Fresh Flowers</a>
                <a href="/products?categoryId=2" className="block py-2 font-medium hover:text-primary transition-colors">Bouquets</a>
                <a href="/cart" className="block py-2 font-medium hover:text-primary transition-colors">Cart</a>
                <a href="/checkout" className="block py-2 font-medium hover:text-primary transition-colors">Checkout</a>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main content */}
      <main className="flex-1 pt-20">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-primary/10 text-primary-foreground mt-8 md:mt-16">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Petals Flower Shop</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Beautiful flowers for every occasion. From elegant bouquets to stunning arrangements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Quick Links</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/products" className="hover:underline">Shop</a></li>
                <li><a href="/cart" className="hover:underline">Cart</a></li>
                <li><a href="/checkout" className="hover:underline">Checkout</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Categories</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li><a href="/products?categoryId=1" className="hover:underline">Fresh Flowers</a></li>
                <li><a href="/products?categoryId=2" className="hover:underline">Bouquets</a></li>
                <li><a href="/products?categoryId=3" className="hover:underline">Potted Plants</a></li>
                <li><a href="/products?categoryId=4" className="hover:underline">Succulents</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Contact Us</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <li className="flex items-center"><i className="ri-map-pin-line mr-2"></i> 123 Flower Street, City</li>
                <li className="flex items-center"><i className="ri-phone-line mr-2"></i> (123) 456-7890</li>
                <li className="flex items-center"><i className="ri-mail-line mr-2"></i> info@petalsflowershop.com</li>
              </ul>
              
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-primary hover:text-primary/80"><i className="ri-facebook-fill text-lg md:text-xl"></i></a>
                <a href="#" className="text-primary hover:text-primary/80"><i className="ri-instagram-line text-lg md:text-xl"></i></a>
                <a href="#" className="text-primary hover:text-primary/80"><i className="ri-twitter-fill text-lg md:text-xl"></i></a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-6 md:mt-12 pt-4 md:pt-6 text-center text-xs md:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Petals Flower Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
