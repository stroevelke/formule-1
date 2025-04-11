import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="fixed inset-0 z-50 bg-f1-black flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <div className="flex space-x-3 mb-8">
              {[0, 0.2, 0.4, 0.6, 0.8].map((delay, index) => (
                <motion.div 
                  key={index}
                  className="w-6 h-6 rounded-full bg-f1-red"
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                    delay: delay
                  }}
                />
              ))}
            </div>
            <h2 className="text-2xl font-f1 font-bold">LOADING TELEMETRY</h2>
            <p className="text-gray-400 mt-2">Connecting to OpenF1 API...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
