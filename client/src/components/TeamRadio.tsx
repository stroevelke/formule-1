import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { F1Driver, F1TeamRadio } from "@shared/schema";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface TeamRadioProps {
  driver: F1Driver | null;
  sessionKey: string;
}

export default function TeamRadio({ driver, sessionKey }: TeamRadioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRadio, setCurrentRadio] = useState<F1TeamRadio | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch team radio data
  const { data: teamRadios = [] } = useQuery<F1TeamRadio[]>({
    queryKey: [
      `/api/team_radio?session_key=${sessionKey}${driver ? `&driver_number=${driver.driver_number}` : ''}`
    ],
    enabled: !!driver,
  });

  // Sort messages by date (newest first)
  const sortedRadios = [...teamRadios].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Handle play/pause
  const togglePlay = (radio: F1TeamRadio) => {
    if (currentRadio?.recording_url === radio.recording_url && isPlaying) {
      // Pause current audio
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      // Play new audio
      setCurrentRadio(radio);
      if (audioRef.current) {
        audioRef.current.src = radio.recording_url;
        audioRef.current.volume = isMuted ? 0 : 0.8;
        audioRef.current.play().catch(err => console.error("Could not play audio:", err));
        setIsPlaying(true);
      }
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0.8 : 0;
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // When driver changes, reset audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentRadio(null);
    }
  }, [driver?.driver_number]);

  return (
    <motion.div 
      className="bg-f1-dark rounded-lg p-6 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between mb-4">
        <h3 className="font-f1 text-xl font-bold">TEAM RADIO</h3>
        <button 
          className="text-gray-400 hover:text-white focus:outline-none"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
        {driver && sortedRadios.length > 0 ? (
          sortedRadios.map((radio) => (
            <motion.div 
              key={radio.recording_url}
              className={`flex items-center p-3 rounded-lg ${
                currentRadio?.recording_url === radio.recording_url 
                  ? 'bg-gray-800 border-l-2' 
                  : 'bg-gray-900 hover:bg-gray-800'
              }`}
              style={{ 
                borderLeftColor: currentRadio?.recording_url === radio.recording_url 
                  ? `#${driver.team_colour}` 
                  : 'transparent' 
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <div 
                className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer mr-3"
                onClick={() => togglePlay(radio)}
              >
                {currentRadio?.recording_url === radio.recording_url && isPlaying ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{driver.broadcast_name}</div>
                  <div className="text-xs text-gray-400">{formatDate(radio.date)}</div>
                </div>
                <div className="text-sm text-gray-400 mt-1">Radio Transmission</div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            {driver ? 'No team radio messages available for this driver.' : 'Select a driver to see team radio messages.'}
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded} 
        className="hidden"
      />

      {/* Playback indicator */}
      <AnimatePresence>
        {isPlaying && currentRadio && (
          <motion.div 
            className="fixed bottom-4 right-4 bg-f1-dark p-3 rounded-lg shadow-lg flex items-center z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="w-8 h-8 mr-3 relative">
              <div className="absolute inset-0 bg-f1-red rounded-full animate-ping opacity-25"></div>
              <div className="relative w-full h-full bg-f1-red rounded-full flex items-center justify-center">
                {isPlaying ? (
                  <Pause size={14} className="text-white" onClick={() => togglePlay(currentRadio)} />
                ) : (
                  <Play size={14} className="text-white" onClick={() => togglePlay(currentRadio)} />
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Playing Team Radio</div>
              <div className="text-xs text-gray-400">{driver?.broadcast_name}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}