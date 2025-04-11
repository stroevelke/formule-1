import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { F1Session } from "@shared/schema";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface CircuitSelectionProps {
  sessions: F1Session[];
  selectedSession: string;
  onSessionChange: (sessionKey: string) => void;
}

export default function CircuitSelection({ 
  sessions, 
  selectedSession, 
  onSessionChange 
}: CircuitSelectionProps) {
  const [activeSession, setActiveSession] = useState<F1Session | null>(null);
  
  // Update active session when sessions or selected session changes
  useEffect(() => {
    if (sessions && sessions.length > 0 && selectedSession) {
      const foundSession = sessions.find(s => s.session_key.toString() === selectedSession) || null;
      setActiveSession(foundSession);
    }
  }, [sessions, selectedSession]);
  
  // Map of country names to image URLs (these would need to be actual circuit images)
  const circuitImageMap: Record<string, string> = {
    "Bahrain": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Bahrain_Circuit.png.transform/7col/image.png",
    "Saudi Arabia": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Saudi_Arabia_Circuit.png.transform/7col/image.png",
    "Australia": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Australia_Circuit.png.transform/7col/image.png",
    "Japan": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Japan_Circuit.png.transform/7col/image.png",
    "China": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/China_Circuit.png.transform/7col/image.png",
    "Miami": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Miami_Circuit.png.transform/7col/image.png",
    "Emilia Romagna": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Emilia_Romagna_Circuit.png.transform/7col/image.png",
    "Monaco": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Monaco_Circuit.png.transform/7col/image.png",
    "Canada": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Canada_Circuit.png.transform/7col/image.png",
    "Spain": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Spain_Circuit.png.transform/7col/image.png",
    "Austria": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Austria_Circuit.png.transform/7col/image.png",
    "United Kingdom": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit.png.transform/7col/image.png",
    "Hungary": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Hungary_Circuit.png.transform/7col/image.png",
    "Belgium": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Belgium_Circuit.png.transform/7col/image.png",
    "Netherlands": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Netherlands_Circuit.png.transform/7col/image.png",
    "Italy": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Italy_Circuit.png.transform/7col/image.png",
    "Azerbaijan": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Azerbaijan_Circuit.png.transform/7col/image.png",
    "Singapore": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Singapore_Circuit.png.transform/7col/image.png",
    "United States": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/USA_Circuit.png.transform/7col/image.png",
    "Mexico": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Mexico_Circuit.png.transform/7col/image.png",
    "Brazil": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Brazil_Circuit.png.transform/7col/image.png",
    "Las Vegas": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Las_Vegas_Circuit.png.transform/7col/image.png",
    "Qatar": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Qatar_Circuit.png.transform/7col/image.png",
    "Abu Dhabi": "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Abu_Dhabi_Circuit.png.transform/7col/image.png"
  };
  
  // Generic circuit image when specific one is not available
  const fallbackCircuitImage = "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Formula1_Circuit.png.transform/7col/image.png";
  
  // Group sessions by country
  const sessionsByCountry = sessions?.length ? sessions.reduce((acc, session) => {
    if (!acc[session.country_name]) {
      acc[session.country_name] = [];
    }
    acc[session.country_name].push(session);
    return acc;
  }, {} as Record<string, F1Session[]>) : {};
  
  // Handle selection change
  const handleSelectionChange = (value: string) => {
    if (!value) return; // Prevent empty selection
    
    console.log(`Selected session changed to: ${value}`);
    
    // Find the session in our list
    const session = sessions?.find(s => s.session_key.toString() === value);
    setActiveSession(session || null);
    
    // Pass the new selection to parent component
    onSessionChange(value);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div 
      className="bg-f1-dark rounded-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-f1 text-2xl font-bold mb-6">CIRCUIT SELECTION</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Circuit image */}
          <div className="rounded-lg overflow-hidden border-2 border-gray-800 mb-4 aspect-video">
            {activeSession ? (
              <img 
                src={circuitImageMap[activeSession.country_name] || fallbackCircuitImage} 
                alt={`${activeSession.circuit_short_name} Circuit`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <p className="text-gray-400">Select a circuit</p>
              </div>
            )}
          </div>
          
          {/* Circuit details */}
          {activeSession && (
            <div className="space-y-2">
              <h3 className="font-f1 text-xl">{activeSession.meeting_name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400">CIRCUIT</div>
                  <div className="font-medium">{activeSession.circuit_short_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">DATE</div>
                  <div className="font-medium">{formatDate(activeSession.date_start)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">SESSION</div>
                  <div className="font-medium">{activeSession.session_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">COUNTRY</div>
                  <div className="font-medium">{activeSession.country_name}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Grand Prix & Session</label>
            <Select value={selectedSession} onValueChange={handleSelectionChange}>
              <SelectTrigger className="w-full bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Select a circuit and session" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.entries(sessionsByCountry).map(([country, countrySessions]) => (
                  <div key={country} className="pb-2">
                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-400 border-b border-gray-700">{country}</div>
                    {countrySessions.map(session => (
                      <SelectItem key={session.session_key} value={session.session_key.toString()} className="text-white">
                        {session.circuit_short_name} - {session.session_name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Recently viewed or upcoming sessions */}
          <div>
            <h4 className="text-sm font-medium mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {sessions && sessions.length > 0 ? (
                sessions.slice(0, 4).map(session => (
                  <div 
                    key={session.session_key}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                      session.session_key.toString() === selectedSession
                        ? 'bg-gray-700'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => handleSelectionChange(session.session_key.toString())}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{session.circuit_short_name}</div>
                        <div className="text-xs text-gray-400">{session.session_name} • {formatDate(session.date_start)}</div>
                      </div>
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-f1-red"
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: session.session_key.toString() === selectedSession ? 1 : 0 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-gray-400">
                  <p>Loading race sessions...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}