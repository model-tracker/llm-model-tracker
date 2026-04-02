import { Link, useLocation } from "react-router";
import { Bell, Search, User, Menu, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useState } from "react";

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/providers', label: 'Providers' },
    { path: '/compare', label: 'Compare Models' },
    { path: '/alerts', label: 'Alerts' }
  ];
  
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Menu */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl">🎯</div>
              <span className="font-semibold text-lg">LLM Tracker</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {menuItems.map(item => (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant="ghost" 
                    className={isActive(item.path) ? 'bg-gray-100' : ''}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search models..."
                className="pl-9 w-[300px] h-9"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            <Avatar className="h-8 w-8 hidden sm:flex">
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {menuItems.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${isActive(item.path) ? 'bg-gray-100' : ''}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}