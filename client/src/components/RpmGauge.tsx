import { motion } from "framer-motion";

interface RpmGaugeProps {
  rpm: number;
}

export default function RpmGauge({ rpm }: RpmGaugeProps) {
  // Calculate angle of gauge based on RPM (0-12000 range)
  const maxRpm = 12000;
  const angle = Math.min(rpm / maxRpm, 1) * 180;

  return (
    <div>
      <div className="text-center mb-2">
        <span className="text-gray-400 text-sm">RPM</span>
      </div>
      <div className="relative">
        <svg viewBox="0 0 200 120" className="w-full">
          {/* RPM background */}
          <path d="M10,110 A90,90 0 0,1 190,110" fill="none" stroke="#333" strokeWidth="10" strokeLinecap="round"/>
          
          {/* Warning zone (yellow) */}
          <path d="M150,51.5 A90,90 0 0,1 190,110" fill="none" stroke="#FFBC00" strokeWidth="10" strokeLinecap="round"/>
          
          {/* Red line zone */}
          <path d="M170,70 A90,90 0 0,1 190,110" fill="none" stroke="#E10600" strokeWidth="10" strokeLinecap="round"/>
          
          {/* RPM level */}
          <motion.path 
            d="M10,110 A90,90 0 0,1 190,110" 
            fill="none" 
            stroke="#0084FF" 
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
          <circle cx="100" cy="110" r="8" fill="#0084FF"/>
          
          {/* RPM ticks */}
          <g className="text-xs" fill="#999" fontFamily="'JetBrains Mono', monospace" fontSize="10">
            <text x="10" y="95" textAnchor="middle">0</text>
            <text x="30" y="70" textAnchor="middle">2K</text>
            <text x="65" y="45" textAnchor="middle">4K</text>
            <text x="100" y="35" textAnchor="middle">6K</text>
            <text x="135" y="45" textAnchor="middle">8K</text>
            <text x="170" y="70" textAnchor="middle">10K</text>
            <text x="190" y="95" textAnchor="middle">12K</text>
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center mt-10">
          <div className="text-center">
            <motion.div 
              className="font-mono text-4xl font-bold"
              key={rpm}
              initial={{ scale: 1.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {rpm}
            </motion.div>
            <div className="text-xs text-gray-400">RPM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
