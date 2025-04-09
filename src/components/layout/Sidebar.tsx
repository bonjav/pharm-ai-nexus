
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Calendar, Package, FileText, BarChart3, Settings, Search, Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Inventory', path: '/inventory', icon: <Package className="w-5 h-5" /> },
    { name: 'Billing', path: '/billing', icon: <FileText className="w-5 h-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <Database className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="p-4 flex items-center space-x-3">
        <div className="bg-pharma-primary text-white p-1.5 rounded">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-pharma-dark">PharmAI Nexus</h1>
      </div>
      
      <div className="px-4 pt-6 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pharma-input pl-10 bg-gray-50 w-full"
          />
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-x-3 px-4 py-3 text-sm rounded-md transition-colors",
                  isActive
                    ? "bg-pharma-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-pharma-primary">
            <span className="font-bold">JD</span>
          </div>
          <div>
            <h3 className="font-medium text-sm">John Doe</h3>
            <p className="text-xs text-gray-500">Pharmacy Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
