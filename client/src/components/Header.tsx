import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { RefreshCcw, BarChart2, MapPin, Clock, Radio, Settings, Menu, Flag } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  activeCircuit?: string;
}

export default function Header({ onRefresh, activeCircuit }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: <BarChart2 className="w-4 h-4" />, label: "Dashboard", path: "/" },
    { icon: <MapPin className="w-4 h-4" />, label: "Track", path: "/track" },
    { icon: <Clock className="w-4 h-4" />, label: "Timing", path: "/timing" },
    { icon: <Radio className="w-4 h-4" />, label: "Radio", path: "/radio" },
    { icon: <Settings className="w-4 h-4" />, label: "Settings", path: "/settings" }
  ];

  return (
    <motion.header 
      className="bg-f1-black border-b border-gray-800 py-4 px-4 md:px-8 sticky top-0 z-40"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 mr-6">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Flag className="text-f1-red h-8 w-8" />
                <div className="flex flex-col">
                  <h1 className="font-f1 text-white text-lg md:text-xl font-bold leading-none">F1 LIVE</h1>
                  <span className="text-[10px] text-gray-400 uppercase leading-none">Telemetry Dashboard</span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Circuit name */}
          {activeCircuit && (
            <>
              <div className="h-6 w-px bg-gray-700 mx-4 hidden md:block"></div>
              <div className="hidden md:block">
                <div className="text-xs text-gray-400">CIRCUIT</div>
                <div className="text-sm font-medium">{activeCircuit}</div>
              </div>
            </>
          )}
          
          {/* Live indicator */}
          <div className="h-6 w-px bg-gray-700 mx-4 hidden md:block"></div>
          <div className="hidden md:flex space-x-1 items-center">
            <div className="w-3 h-3 rounded-full bg-f1-red pulse-dot"></div>
            <span className="text-xs text-gray-300">LIVE</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <ul className="flex space-x-1">
            {navItems.map(item => (
              <li key={item.path}>
                <Link href={item.path}>
                  <div className={`px-4 py-2 rounded-md flex items-center text-sm cursor-pointer ${
                    location === item.path 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
                  }`}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                    {location === item.path && (
                      <motion.div 
                        layoutId="navbar-indicator" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-f1-red"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="h-6 w-px bg-gray-700 mx-4"></div>
          
          <Button 
            onClick={onRefresh} 
            className="bg-f1-red hover:bg-red-700 transition-colors text-white rounded-md px-4 py-2 text-sm"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </nav>
        
        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-3">
          <Button 
            onClick={onRefresh} 
            className="bg-f1-red hover:bg-red-700 transition-colors text-white rounded-md p-2"
            size="sm"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="outline"
            size="sm"
            className="text-white p-2 border-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-gray-900 mt-4 rounded-lg overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <nav className="p-2">
            <ul className="space-y-1">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <div 
                      className={`px-4 py-3 rounded-md flex items-center cursor-pointer ${
                        location === item.path 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
