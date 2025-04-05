import { Link, useLocation } from "wouter";
import { NavItem } from "@/lib/types";

interface SidebarProps {
  onNavItemClick?: () => void;
}

const Sidebar = ({ onNavItemClick }: SidebarProps = {}) => {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { href: "/inventory", label: "Inventory", icon: "ri-stack-line" },
    { href: "/pos", label: "Point of Sale", icon: "ri-shopping-cart-line" },
    { href: "/orders", label: "Orders", icon: "ri-shopping-bag-line" },
    { href: "/customers", label: "Customers", icon: "ri-user-line" },
    { href: "/reports", label: "Reports", icon: "ri-bar-chart-line" }
  ];

  return (
    <aside className="flex flex-col w-64 bg-white shadow-md z-10 h-full">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary flex items-center">
          <i className="ri-flower-line mr-2"></i>
          <span>BloomBoard</span>
        </h1>
      </div>
      
      <div className="py-4 flex flex-col justify-between flex-grow">
        <nav className="px-2 space-y-1">
          {navItems.map(item => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={onNavItemClick}
              >
                <a className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-primary hover:text-white'
                }`}>
                  <i className={`${item.icon} text-lg mr-3`}></i>
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-4 py-2">
          <div className="border-t border-gray-200 pt-4">
            <Link href="/settings" onClick={onNavItemClick}>
              <a className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary hover:text-white rounded-lg transition-all duration-200">
                <i className="ri-settings-3-line text-lg mr-3"></i>
                <span>Settings</span>
              </a>
            </Link>
            <Link href="/help" onClick={onNavItemClick}>
              <a className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-primary hover:text-white rounded-lg transition-all duration-200">
                <i className="ri-question-line text-lg mr-3"></i>
                <span>Help & Support</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
