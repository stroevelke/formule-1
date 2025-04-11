import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpeedGauge from "./SpeedGauge";
import RpmGauge from "./RpmGauge";
import TelemetryBar from "./TelemetryBar";
import { F1CarData } from "@shared/schema";

interface TelemetryGaugesProps {
  carData: F1CarData | null;
  driverNumber: number;
}

export default function TelemetryGauges({ carData, driverNumber }: TelemetryGaugesProps) {
  const [telemetry, setTelemetry] = useState({
    speed: 0,
    rpm: 0,
    throttle: 0,
    brake: 0,
    gear: 0,
    drs: 0
  });

  useEffect(() => {
    if (carData) {
      setTelemetry({
        speed: carData.speed,
        rpm: carData.rpm,
        throttle: carData.throttle,
        brake: carData.brake,
        gear: carData.n_gear,
        drs: carData.drs
      });
    }
  }, [carData]);

  // Map DRS value to status text
  const drsStatus = () => {
    const drsValue = telemetry.drs;
    if (drsValue === 10 || drsValue === 12 || drsValue === 14) {
      return { text: "ACTIVE", color: "text-f1-green" };
    } else if (drsValue === 8) {
      return { text: "ELIGIBLE", color: "text-f1-yellow" };
    } else {
      return { text: "DISABLED", color: "text-white" };
    }
  };

  return (
    <motion.div 
      className="bg-f1-dark rounded-lg p-6 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-f1 text-xl font-bold mb-4">LIVE TELEMETRY</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speedometer */}
        <SpeedGauge speed={telemetry.speed} />
        
        {/* RPM Gauge */}
        <RpmGauge rpm={telemetry.rpm} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Gear indicator */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">GEAR</div>
          <motion.div 
            className="font-mono text-3xl font-bold"
            key={telemetry.gear}
            initial={{ scale: 1.2, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {telemetry.gear === 0 ? 'N' : telemetry.gear}
          </motion.div>
        </div>
        
        {/* DRS Status */}
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">DRS</div>
          <div className={`font-mono text-xl font-bold ${drsStatus().color}`}>
            {drsStatus().text}
          </div>
        </div>
        
        {/* Throttle */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2">THROTTLE</div>
          <div className="flex items-center">
            <TelemetryBar 
              value={telemetry.throttle} 
              color="bg-f1-green" 
            />
            <div className="font-mono font-bold whitespace-nowrap ml-3">
              {telemetry.throttle}%
            </div>
          </div>
        </div>
        
        {/* Brake */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-2">BRAKE</div>
          <div className="flex items-center">
            <TelemetryBar 
              value={telemetry.brake} 
              color="bg-f1-red" 
            />
            <div className="font-mono font-bold whitespace-nowrap ml-3">
              {telemetry.brake}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Live indicator */}
      <div className="absolute top-6 right-6 flex items-center">
        <div className="w-2 h-2 rounded-full bg-f1-red pulse-dot mr-1"></div>
        <span className="text-xs text-gray-400">LIVE</span>
      </div>
    </motion.div>
  );
}
