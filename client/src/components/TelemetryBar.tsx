import { motion } from "framer-motion";

interface TelemetryBarProps {
  value: number;
  color: string;
}

export default function TelemetryBar({ value, color }: TelemetryBarProps) {
  return (
    <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden">
      <motion.div 
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 100 }}
      />
    </div>
  );
}
