import { F1Driver, F1Position, F1Lap } from "@shared/schema";
import { motion } from "framer-motion";

interface ActiveDriverHeaderProps {
  driver: F1Driver;
  positions: F1Position[];
  laps: F1Lap[];
}

export default function ActiveDriverHeader({ driver, positions, laps }: ActiveDriverHeaderProps) {
  const teamColor = `#${driver.team_colour}`;
  
  const position = positions.find(p => p.driver_number === driver.driver_number)?.position;
  const positionDisplay = position ? `P${position}` : '--';
  
  const driverLaps = laps.filter(lap => lap.driver_number === driver.driver_number);
  
  // Get last lap time
  const lastLap = driverLaps[driverLaps.length - 1];
  const lastLapTime = lastLap?.lap_duration;
  
  // Format lap time
  const formatLapTime = (time: number | undefined | null): string => {
    if (!time) return '--:--.---';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };
  
  // Get best lap time
  const bestLap = driverLaps.reduce((best, lap) => {
    if (!lap.lap_duration) return best;
    if (!best.lap_duration) return lap;
    return lap.lap_duration < best.lap_duration ? lap : best;
  }, { lap_duration: null } as F1Lap);
  
  // Determine driver status
  const isInPit = lastLap?.is_pit_out_lap;
  const statusText = isInPit ? "Pit Lane" : "On Track";
  const statusColor = isInPit ? "bg-f1-yellow" : "bg-f1-green";
  
  // Determine gap to leader
  const gap = position === 1 
    ? "LEADER" 
    : positions.find(p => p.driver_number === driver.driver_number)?.interval 
      ? `+${positions.find(p => p.driver_number === driver.driver_number)?.interval?.toFixed(3)}s`
      : "--";

  return (
    <motion.div 
      className="bg-f1-dark p-6 rounded-lg mb-6"
      style={{ borderLeft: `4px solid ${teamColor}` }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-16 h-16 mr-4 rounded-full overflow-hidden border-2" style={{ borderColor: teamColor }}>
            {driver.headshot_url ? (
              <img 
                src={driver.headshot_url} 
                alt={driver.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center">
              <div className="inline-block px-2 py-0.5 text-xs rounded mr-2 text-white" style={{ backgroundColor: teamColor }}>
                {driver.driver_number}
              </div>
              <h2 className="font-f1 text-2xl font-bold">{driver.broadcast_name}</h2>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-400">{driver.team_name}</span>
              <span className="mx-2 text-gray-600">|</span>
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full ${statusColor} mr-1`}></span>
                <span className="text-sm text-gray-300">{statusText}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">POSITION</div>
            <div className="font-f1 text-xl font-bold">{positionDisplay}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">GAP</div>
            <div className="font-mono text-xl font-bold">{gap}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">LAST LAP</div>
            <div className="font-mono text-xl font-bold text-f1-green">{formatLapTime(lastLapTime)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">BEST LAP</div>
            <div className="font-mono text-xl font-bold text-f1-purple">{formatLapTime(bestLap.lap_duration)}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
