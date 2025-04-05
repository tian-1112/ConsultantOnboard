import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { Search, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-neutral-lightest flex">
      {/* Fixed floral background pattern with reduced opacity */}
      <div className="fixed inset-0 z-[-1] bg-[url('https://images.unsplash.com/photo-1559511260-66a654ae982a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat opacity-[0.03]"></div>

      {/* Sidebar for desktop */}
      {!isMobile && <Sidebar />}

      {/* Mobile menu */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0">
            <Sidebar onNavItemClick={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="text-gray-500">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {isMobile && (
                <div className="relative">
                  <h1 className="text-xl font-bold text-primary flex items-center">
                    <i className="ri-flower-line mr-1"></i>
                    <span>BloomBoard</span>
                  </h1>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-48 lg:w-64 pl-8"
                />
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">3</span>
              </Button>
              
              <div className="border-l border-gray-200 pl-4 flex items-center">
                <Avatar>
                  <div className="bg-primary text-white flex items-center justify-center h-full">
                    JD
                  </div>
                </Avatar>
                <div className="ml-2 hidden sm:block">
                  <p className="text-sm font-medium">Jane Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-neutral-lightest p-4">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
