import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Timer, Settings } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: <LayoutDashboard className="text-xl" />, label: "Dashboard", path: "/" },
    { icon: <Users className="text-xl" />, label: "Drivers", path: "/drivers" },
    { icon: <Timer className="text-xl" />, label: "Timing", path: "/timing" },
    { icon: <Settings className="text-xl" />, label: "Settings", path: "/settings" }
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-f1-black border-t border-gray-800 lg:hidden z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex flex-col items-center py-3 px-6 cursor-pointer ${
                isActive ? "text-f1-red" : "text-gray-500 hover:text-white"
              }`}>
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 w-8 h-1 bg-f1-red rounded-t-sm"
                    layoutId="underline"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
