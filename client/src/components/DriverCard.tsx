import { motion } from "framer-motion";
import { F1Driver } from "@shared/schema";

interface DriverCardProps {
  driver: F1Driver;
  lastLapTime: string;
  position: string;
  status: 'active' | 'pit' | 'inactive';
  isSelected: boolean;
  onSelect: () => void;
}

export default function DriverCard({ 
  driver, 
  lastLapTime, 
  position, 
  status, 
  isSelected,
  onSelect 
}: DriverCardProps) {
  const teamColor = `#${driver.team_colour}`;
  
  const statusColor = status === 'active' 
    ? 'bg-f1-green' 
    : status === 'pit' 
      ? 'bg-f1-yellow' 
      : 'bg-gray-600';

  return (
    <motion.div 
      className={`driver-card relative cursor-pointer bg-f1-dark p-4 rounded-lg border-l-4 overflow-hidden ${isSelected ? 'ring-2 ring-f1-red' : ''}`}
      style={{ borderColor: teamColor }}
      onClick={onSelect}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute right-0 top-0 w-8 h-8 m-2">
        <div className="text-xs font-bold font-mono bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center" style={{ color: teamColor }}>
          {driver.name_acronym.charAt(0)}
        </div>
      </div>
      <div className="flex items-start mb-3">
        <div className="flex-shrink-0 w-1/3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800">
            {driver.headshot_url ? (
              <img 
                src={driver.headshot_url} 
                alt={driver.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 pl-2">
          <div className="bg-gray-800 text-white inline-block px-2 py-0.5 text-xs rounded mb-1">{driver.driver_number}</div>
          <h3 className="font-f1 font-bold text-white text-lg leading-tight">{driver.name_acronym}</h3>
          <p className="text-xs text-gray-400">{driver.team_name}</p>
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <div>
          <div className="text-gray-400">LAST LAP</div>
          <div className="font-mono font-semibold">{lastLapTime}</div>
        </div>
        <div className="text-right">
          <div className="text-gray-400">POSITION</div>
          <div className="font-mono font-semibold">{position}</div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0">
        <span className={`inline-block w-3 h-3 rounded-full ${statusColor} mr-3 mb-3`}></span>
      </div>
    </motion.div>
  );
}
