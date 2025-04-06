import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NavItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import the logo
import petalsLogo from "@/assets/petals-logo.svg";

interface SidebarProps {
  onNavItemClick?: () => void;
}

const Sidebar = ({ onNavItemClick }: SidebarProps = {}) => {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(2); // Mock cart count

  // Navigation items for the online shop
  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: "ri-home-line" },
    { href: "/products", label: "Shop", icon: "ri-store-2-line" },
    { href: "/cart", label: "Cart", icon: "ri-shopping-cart-line" },
  ];

  // Change navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center">
              <img src={petalsLogo} alt="Petals Flower Shop Logo" className="h-10 w-10 mr-2" />
              <div>
                <h1 className="text-xl font-bold text-[#5B6A47]">Petals</h1>
                <div className="text-xs text-[#5B6A47] uppercase tracking-widest">Flower Shop</div>
              </div>
            </div>
          </Link>
          
          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={onNavItemClick}
                >
                  <div className={`flex items-center font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-700 hover:text-primary'
                  }`}>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
          
          {/* Cart and User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart">
              <div className="relative">
                <i className="ri-shopping-cart-2-line text-lg"></i>
                {cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </div>
            </Link>
            
            <Link href="/auth">
              <div className="flex items-center text-gray-700 hover:text-primary">
                <i className="ri-user-line text-lg mr-1"></i>
                <span>Sign In</span>
              </div>
            </Link>
            
            <Button asChild className="ml-4">
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Link href="/cart">
              <div className="relative mr-4">
                <i className="ri-shopping-cart-2-line text-xl"></i>
                {cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </div>
            </Link>
            
            <Link href="/auth">
              <div className="mr-3">
                <i className="ri-user-line text-xl"></i>
              </div>
            </Link>
            
            <Button variant="ghost" className="p-2" onClick={onNavItemClick}>
              <i className="ri-menu-line text-xl"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
