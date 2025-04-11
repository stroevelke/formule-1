import { useState } from "react";
import DriverCard from "./DriverCard";
import { F1Driver, F1Position, F1Lap } from "@shared/schema";
import { motion } from "framer-motion";

interface DriverSelectionProps {
  drivers: F1Driver[];
  positions: F1Position[];
  laps: F1Lap[];
  selectedDriver: F1Driver | null;
  onSelectDriver: (driver: F1Driver) => void;
}

export default function DriverSelection({ 
  drivers, 
  positions, 
  laps, 
  selectedDriver, 
  onSelectDriver 
}: DriverSelectionProps) {
  // Sort drivers by position
  const sortedDrivers = [...drivers].sort((a, b) => {
    const posA = positions.find(p => p.driver_number === a.driver_number)?.position || 999;
    const posB = positions.find(p => p.driver_number === b.driver_number)?.position || 999;
    return posA - posB;
  });

  const getDriverStatus = (driver: F1Driver): 'active' | 'pit' | 'inactive' => {
    // Logic to determine driver status
    const driverLaps = laps.filter(lap => lap.driver_number === driver.driver_number);
    
    if (driverLaps.length === 0) return 'inactive';
    
    const lastLap = driverLaps[driverLaps.length - 1];
    if (lastLap.is_pit_out_lap) return 'pit';
    
    return 'active';
  };

  const getLastLapTime = (driver: F1Driver): string => {
    const driverLaps = laps.filter(lap => lap.driver_number === driver.driver_number);
    if (driverLaps.length === 0) return '--:--.---';
    
    const lastLap = driverLaps[driverLaps.length - 1];
    if (!lastLap.lap_duration) return '--:--.---';
    
    // Format lap time
    const minutes = Math.floor(lastLap.lap_duration / 60);
    const seconds = Math.floor(lastLap.lap_duration % 60);
    const milliseconds = Math.floor((lastLap.lap_duration % 1) * 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const getDriverPosition = (driver: F1Driver): string => {
    const position = positions.find(p => p.driver_number === driver.driver_number)?.position;
    return position ? `P${position}` : '--';
  };

  return (
    <section className="mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="font-f1 text-2xl font-bold">DRIVER SELECTION</h2>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full bg-f1-green mr-2"></span>
            <span className="text-gray-300">On Track</span>
          </div>
          <div className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full bg-f1-yellow mr-2"></span>
            <span className="text-gray-300">Pit Lane</span>
          </div>
          <div className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full bg-gray-600 mr-2"></span>
            <span className="text-gray-300">Inactive</span>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {sortedDrivers.map((driver) => (
          <DriverCard
            key={driver.driver_number}
            driver={driver}
            lastLapTime={getLastLapTime(driver)}
            position={getDriverPosition(driver)}
            status={getDriverStatus(driver)}
            isSelected={selectedDriver?.driver_number === driver.driver_number}
            onSelect={() => onSelectDriver(driver)}
          />
        ))}
      </motion.div>
    </section>
  );
}
