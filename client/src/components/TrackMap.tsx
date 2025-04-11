import { useEffect, useRef } from "react";
import { F1Driver, F1Position, F1Location } from "@shared/schema";
import { motion } from "framer-motion";

interface TrackMapProps {
  drivers: F1Driver[];
  positions: F1Position[];
  locations: F1Location[];
  selectedDriver: F1Driver | null;
  circuitName?: string;
  countryName?: string;
}

export default function TrackMap({ 
  drivers, 
  positions, 
  locations, 
  selectedDriver,
  circuitName = "Unknown Circuit",
  countryName = "Unknown Country"
}: TrackMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate bounds for all locations to create a normalized track view
  const getBounds = () => {
    if (locations.length === 0) return { minX: 0, maxX: 800, minY: 0, maxY: 600 };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    locations.forEach(loc => {
      minX = Math.min(minX, loc.x);
      maxX = Math.max(maxX, loc.x);
      minY = Math.min(minY, loc.y);
      maxY = Math.max(maxY, loc.y);
    });

    return { minX, maxX, minY, maxY };
  };

  const bounds = getBounds();
  const padding = 50;
  const width = 800 - padding * 2;
  const height = 600 - padding * 2;

  // Normalize coordinates to fit in our SVG viewbox
  const normalizeX = (x: number) => {
    return padding + ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * width;
  };

  const normalizeY = (y: number) => {
    return padding + ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * height;
  };

  // Get driver position on track
  const getDriverPosition = (driverNumber: number) => {
    const driverLocations = locations.filter(loc => loc.driver_number === driverNumber);
    if (driverLocations.length === 0) return null;
    
    // Get most recent location
    const location = driverLocations[driverLocations.length - 1];
    return {
      x: normalizeX(location.x),
      y: normalizeY(location.y)
    };
  };

  // Create a simplified track outline from location data
  const createTrackPath = () => {
    if (locations.length < 10) return "";

    // Use first driver's location data to create a track outline
    const firstDriver = drivers[0]?.driver_number;
    if (!firstDriver) return "";

    const driverPath = locations
      .filter(loc => loc.driver_number === firstDriver)
      .map(loc => `${normalizeX(loc.x)},${normalizeY(loc.y)}`)
      .join(" L ");

    return `M ${driverPath}`;
  };

  const trackPath = createTrackPath();

  // Get driver's team color
  const getDriverColor = (driverNumber: number) => {
    const driver = drivers.find(d => d.driver_number === driverNumber);
    return driver ? `#${driver.team_colour}` : "#ffffff";
  };

  return (
    <motion.div 
      className="bg-f1-dark rounded-lg p-6 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-f1 text-xl font-bold mb-4">TRACK POSITION</h3>
      
      <div className="relative h-[400px] p-6">
        <svg viewBox="0 0 800 600" className="w-full h-full" ref={svgRef}>
          {/* Track outline */}
          {trackPath && (
            <path 
              d={trackPath}
              fill="none" 
              stroke="#444" 
              strokeWidth="20" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="track-path"
            />
          )}
          
          {/* If no track data, show sample track */}
          {!trackPath && (
            <path 
              d="M100,400 C150,250 200,200 350,200 C500,200 550,250 600,400 C650,500 700,550 750,550 C650,550 600,500 550,400 C500,300 450,250 350,250 C250,250 200,300 150,400 C100,500 50,550 50,550 C100,550 100,450 100,400 Z" 
              fill="none" 
              stroke="#444" 
              strokeWidth="20" 
              strokeLinecap="round" 
              className="track-path"
            />
          )}
          
          {/* Start/Finish line */}
          <line x1="100" y1="380" x2="100" y2="420" stroke="#fff" strokeWidth="4" strokeDasharray="5,3"/>
          
          {/* Driver positions */}
          {drivers.map(driver => {
            const position = getDriverPosition(driver.driver_number);
            if (!position) return null;
            
            const color = getDriverColor(driver.driver_number);
            const size = selectedDriver?.driver_number === driver.driver_number ? 10 : 8;
            
            return (
              <g key={driver.driver_number}>
                <motion.circle 
                  cx={position.x} 
                  cy={position.y} 
                  r={size} 
                  fill={color} 
                  className="car-position"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <text 
                  x={position.x} 
                  y={position.y} 
                  fill="white" 
                  textAnchor="middle" 
                  fontSize={size * 0.8} 
                  fontWeight="bold" 
                  dy=".3em"
                >
                  {driver.driver_number}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Track details */}
        <div className="absolute bottom-6 left-6 bg-gray-800/80 rounded-lg p-3 text-xs">
          <div className="mb-2">
            <span className="text-white font-medium">{circuitName}</span>
            <span className="block text-gray-400">{countryName}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-gray-400">DRIVERS</div>
              <div className="font-medium">{drivers.length}</div>
            </div>
            <div>
              <div className="text-gray-400">LEADER</div>
              <div className="font-medium">
                {positions[0]?.driver_number 
                  ? drivers.find(d => d.driver_number === positions[0].driver_number)?.name_acronym || '--'
                  : '--'
                }
              </div>
            </div>
            <div>
              <div className="text-gray-400">SELECTED</div>
              <div className="font-medium">{selectedDriver?.name_acronym || '--'}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
