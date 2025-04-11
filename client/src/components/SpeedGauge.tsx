import { motion } from "framer-motion";

interface SpeedGaugeProps {
  speed: number;
}

export default function SpeedGauge({ speed }: SpeedGaugeProps) {
  // Calculate angle of gauge based on speed (0-350 km/h range)
  const maxSpeed = 350;
  const angle = Math.min(speed / maxSpeed, 1) * 180;

  return (
    <div>
      <div className="text-center mb-2">
        <span className="text-gray-400 text-sm">SPEED</span>
      </div>
      <div className="relative">
        <svg viewBox="0 0 200 120" className="w-full">
          {/* Speedometer background */}
          <path d="M10,110 A90,90 0 0,1 190,110" fill="none" stroke="#333" strokeWidth="10" strokeLinecap="round"/>
          
          {/* Speed level */}
          <motion.path 
            d="M10,110 A90,90 0 0,1 190,110" 
            fill="none" 
            stroke="#E10600" 
            strokeWidth="10" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: angle / 180,
              transition: { type: "spring", stiffness: 60 }
            }}
            style={{ transformOrigin: "10px 110px", rotate: "0deg" }}
          />
          
          {/* Center point */}
          <circle cx="100" cy="110" r="8" fill="#E10600"/>
          
          {/* Speed ticks */}
          <g className="text-xs" fill="#999" fontFamily="'JetBrains Mono', monospace" fontSize="10">
            <text x="10" y="95" textAnchor="middle">0</text>
            <text x="30" y="70" textAnchor="middle">50</text>
            <text x="65" y="45" textAnchor="middle">100</text>
            <text x="100" y="35" textAnchor="middle">150</text>
            <text x="135" y="45" textAnchor="middle">200</text>
            <text x="170" y="70" textAnchor="middle">250</text>
            <text x="190" y="95" textAnchor="middle">300</text>
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center mt-10">
          <div className="text-center">
            <motion.div 
              className="font-mono text-4xl font-bold"
              key={speed}
              initial={{ scale: 1.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {speed}
            </motion.div>
            <div className="text-xs text-gray-400">KM/H</div>
          </div>
        </div>
      </div>
    </div>
  );
}
