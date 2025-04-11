import { useState } from "react";
import { motion } from "framer-motion";
import { F1Driver, F1Lap } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LapComparisonChartProps {
  drivers: F1Driver[];
  laps: F1Lap[];
  selectedDrivers: F1Driver[];
}

export default function LapComparisonChart({ drivers, laps, selectedDrivers }: LapComparisonChartProps) {
  const [lapRange, setLapRange] = useState<string>("last10");
  
  // Determine lap numbers to display based on range
  const getLapRange = () => {
    const allLapNumbers = [...new Set(laps.map(lap => lap.lap_number))].sort((a, b) => a - b);
    
    switch (lapRange) {
      case "last10":
        return allLapNumbers.slice(-10);
      case "last20":
        return allLapNumbers.slice(-20);
      case "all":
      default:
        return allLapNumbers;
    }
  };
  
  const lapNumbers = getLapRange();
  
  // Get lap data for a specific driver
  const getDriverLapData = (driver: F1Driver) => {
    return lapNumbers.map(lapNumber => {
      const lap = laps.find(lap => lap.driver_number === driver.driver_number && lap.lap_number === lapNumber);
      return {
        lapNumber,
        duration: lap?.lap_duration || null,
        sector1: lap?.duration_sector_1 || null,
        sector2: lap?.duration_sector_2 || null,
        sector3: lap?.duration_sector_3 || null
      };
    });
  };

  // Format lap time for display
  const formatLapTime = (time: number | null): string => {
    if (!time) return '--';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  // Format sector time for display
  const formatSectorTime = (time: number | null): string => {
    if (!time) return '--';
    
    const seconds = Math.floor(time);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    return `${seconds}.${milliseconds.toString().padStart(3, '0')}`;
  };

  // Find fastest lap and sector times
  const findFastestLaps = () => {
    const fastestLap: Record<number, number | null> = {};
    const fastestSector1: Record<number, number | null> = {};
    const fastestSector2: Record<number, number | null> = {};
    const fastestSector3: Record<number, number | null> = {};
    
    lapNumbers.forEach(lapNumber => {
      let minLapTime = Infinity;
      let minS1Time = Infinity;
      let minS2Time = Infinity;
      let minS3Time = Infinity;
      
      selectedDrivers.forEach(driver => {
        const lap = laps.find(lap => lap.driver_number === driver.driver_number && lap.lap_number === lapNumber);
        
        if (lap?.lap_duration && lap.lap_duration < minLapTime) {
          minLapTime = lap.lap_duration;
          fastestLap[lapNumber] = driver.driver_number;
        }
        
        if (lap?.duration_sector_1 && lap.duration_sector_1 < minS1Time) {
          minS1Time = lap.duration_sector_1;
          fastestSector1[lapNumber] = driver.driver_number;
        }
        
        if (lap?.duration_sector_2 && lap.duration_sector_2 < minS2Time) {
          minS2Time = lap.duration_sector_2;
          fastestSector2[lapNumber] = driver.driver_number;
        }
        
        if (lap?.duration_sector_3 && lap.duration_sector_3 < minS3Time) {
          minS3Time = lap.duration_sector_3;
          fastestSector3[lapNumber] = driver.driver_number;
        }
      });
    });
    
    return { fastestLap, fastestSector1, fastestSector2, fastestSector3 };
  };
  
  const { fastestLap, fastestSector1, fastestSector2, fastestSector3 } = findFastestLaps();

  // Calculate SVG points for the chart
  const calculateChartPoints = (driver: F1Driver) => {
    const lapData = getDriverLapData(driver);
    const maxLapTime = 100; // Maximum lap time in seconds (adjust based on data)
    const minLapTime = 80;  // Minimum lap time in seconds (adjust based on data)
    const range = maxLapTime - minLapTime;
    
    const chartWidth = 900;
    const chartHeight = 300;
    const padding = 50;
    
    const lapWidth = (chartWidth - padding * 2) / (lapData.length - 1);
    
    return lapData.map((lap, index) => {
      const x = padding + index * lapWidth;
      
      // Calculate y position (inverted since SVG y increases downward)
      const normalizedTime = lap.duration 
        ? 1 - ((lap.duration - minLapTime) / range)
        : 0.5; // Default to middle if no time
      
      const y = padding + (chartHeight - padding * 2) * (1 - normalizedTime);
      
      return { x, y, lap };
    }).filter(point => point.lap.duration !== null) // Only include points with valid lap times
     .map(point => `${point.x},${point.y}`)
     .join(" ");
  };

  // Get team color for a driver
  const getDriverColor = (driverNumber: number) => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver ? `#${driver.team_colour}` : "#ffffff";
  };

  // Get className for fastest times
  const getFastestClass = (driverNumber: number, lapNumber: number, type: 'lap' | 's1' | 's2' | 's3') => {
    const fastestMap = {
      'lap': fastestLap,
      's1': fastestSector1,
      's2': fastestSector2,
      's3': fastestSector3
    };
    
    return fastestMap[type][lapNumber] === driverNumber 
      ? type === 'lap' ? 'text-f1-purple' : 'text-f1-green'
      : '';
  };

  return (
    <motion.div 
      className="bg-f1-dark rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="font-f1 text-xl font-bold">LAP TIME COMPARISON</h3>
        
        <div className="flex flex-wrap gap-3 mt-3 md:mt-0">
          {selectedDrivers.map((driver) => (
            <div key={driver.driver_number} className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: `#${driver.team_colour}` }}></div>
              <span className="text-sm">{driver.name_acronym}</span>
            </div>
          ))}
          <Select value={lapRange} onValueChange={setLapRange}>
            <SelectTrigger className="bg-gray-800 text-white text-sm rounded-md border border-gray-700 h-8 w-[140px]">
              <SelectValue placeholder="Lap Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last10">Last 10 laps</SelectItem>
              <SelectItem value="last20">Last 20 laps</SelectItem>
              <SelectItem value="all">All laps</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Chart area */}
      <div className="h-[300px] mt-2 overflow-hidden">
        <svg viewBox="0 0 1000 400" className="w-full h-full">
          {/* Grid lines */}
          <g stroke="#333" strokeWidth="1">
            <line x1="50" y1="350" x2="950" y2="350"></line>
            <line x1="50" y1="50" x2="950" y2="50"></line>
            <line x1="50" y1="125" x2="950" y2="125"></line>
            <line x1="50" y1="200" x2="950" y2="200"></line>
            <line x1="50" y1="275" x2="950" y2="275"></line>
            
            <line x1="50" y1="50" x2="50" y2="350"></line>
            
            {/* Dynamic lap number lines */}
            {lapNumbers.map((lapNum, index) => {
              const x = 50 + (900 / (lapNumbers.length - 1)) * index;
              return (
                <line key={index} x1={x} y1="345" x2={x} y2="355" stroke="#333" strokeWidth="1"></line>
              );
            })}
            
            <line x1="950" y1="50" x2="950" y2="350"></line>
          </g>
          
          {/* Y-axis labels */}
          <text x="40" y="350" textAnchor="end" fill="#999" fontSize="12">1:35</text>
          <text x="40" y="275" textAnchor="end" fill="#999" fontSize="12">1:34</text>
          <text x="40" y="200" textAnchor="end" fill="#999" fontSize="12">1:33</text>
          <text x="40" y="125" textAnchor="end" fill="#999" fontSize="12">1:32</text>
          <text x="40" y="50" textAnchor="end" fill="#999" fontSize="12">1:31</text>
          
          {/* X-axis labels */}
          {lapNumbers.map((lapNum, index) => {
            const x = 50 + (900 / (lapNumbers.length - 1)) * index;
            return (
              <text key={index} x={x} y="370" textAnchor="middle" fill="#999" fontSize="12">{lapNum}</text>
            );
          })}
          
          {/* Axis titles */}
          <text x="500" y="395" textAnchor="middle" fill="#fff" fontSize="14">Lap Number</text>
          <text x="15" y="200" textAnchor="middle" fill="#fff" fontSize="14" transform="rotate(-90, 15, 200)">Lap Time</text>
          
          {/* Data Lines */}
          {selectedDrivers.map((driver) => {
            const points = calculateChartPoints(driver);
            if (!points) return null;
            
            return (
              <polyline 
                key={driver.driver_number}
                points={points}
                fill="none" 
                stroke={`#${driver.team_colour}`} 
                strokeWidth="3"
                strokeLinejoin="round"
              />
            );
          })}
          
          {/* Data Points */}
          {selectedDrivers.map((driver) => {
            const driverLapData = getDriverLapData(driver);
            
            return driverLapData
              .filter(lap => lap.duration !== null)
              .map((lap, index) => {
                const x = 50 + (900 / (lapNumbers.length - 1)) * lapNumbers.indexOf(lap.lapNumber);
                
                // Calculate y position (inverted since SVG y increases downward)
                const normalizedTime = lap.duration 
                  ? 1 - ((lap.duration - 80) / 20) // Normalize between 80-100 seconds
                  : 0.5; // Default to middle if no time
                
                const y = 50 + (300) * (1 - normalizedTime);
                
                // Highlight fastest lap
                const isFastest = fastestLap[lap.lapNumber] === driver.driver_number;
                
                return (
                  <g key={`${driver.driver_number}-${lap.lapNumber}`} fill={`#${driver.team_colour}`}>
                    <circle cx={x} cy={y} r="5" />
                    {isFastest && (
                      <circle cx={x} cy={y} r="8" stroke="#9146FF" strokeWidth="2" fill="none"/>
                    )}
                  </g>
                );
              });
          })}
        </svg>
      </div>
      
      {/* Sector time comparison */}
      {selectedDrivers.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-2 text-left">Driver</th>
                <th className="pb-2 text-center">Lap</th>
                <th className="pb-2 text-center">S1</th>
                <th className="pb-2 text-center">S2</th>
                <th className="pb-2 text-center">S3</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {selectedDrivers.map((driver) => {
                // Get most recent lap with full sector data
                const recentLaps = laps
                  .filter(lap => lap.driver_number === driver.driver_number)
                  .filter(lap => lap.lap_duration && lap.duration_sector_1 && lap.duration_sector_2 && lap.duration_sector_3)
                  .sort((a, b) => b.lap_number - a.lap_number);
                
                const recentLap = recentLaps[0];
                if (!recentLap) return null;
                
                return (
                  <tr key={driver.driver_number} className="border-b border-gray-800">
                    <td className="py-2 flex items-center">
                      <div className="w-3 h-3 mr-2" style={{ backgroundColor: `#${driver.team_colour}` }}></div>
                      <span>{driver.name_acronym}</span>
                    </td>
                    <td className="py-2 text-center">{recentLap.lap_number}</td>
                    <td className={`py-2 text-center ${getFastestClass(driver.driver_number, recentLap.lap_number, 's1')}`}>
                      {formatSectorTime(recentLap.duration_sector_1)}
                    </td>
                    <td className={`py-2 text-center ${getFastestClass(driver.driver_number, recentLap.lap_number, 's2')}`}>
                      {formatSectorTime(recentLap.duration_sector_2)}
                    </td>
                    <td className={`py-2 text-center ${getFastestClass(driver.driver_number, recentLap.lap_number, 's3')}`}>
                      {formatSectorTime(recentLap.duration_sector_3)}
                    </td>
                    <td className={`py-2 text-right font-semibold ${getFastestClass(driver.driver_number, recentLap.lap_number, 'lap')}`}>
                      {formatLapTime(recentLap.lap_duration)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
