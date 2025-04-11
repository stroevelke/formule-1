import express, { Router } from "express";
import axios from "axios";
import NodeCache from "node-cache";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Create cache with 10 second TTL for live data, 5 minutes for static data
const cache = new NodeCache({ 
  stdTTL: 10, // 10 seconds for most data
  checkperiod: 5
});

// OpenF1 API base URL
const OPENF1_API_URL = "https://api.openf1.org/v1";

// Create API router
const apiRouter = Router();

// Middleware to handle errors and cache
apiRouter.use(async (req, res, next) => {
  try {
    // Check if we have a cached response for this request
    const cacheKey = req.originalUrl;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Get sessions
apiRouter.get("/sessions", async (req, res) => {
  try {
    // Get latest meetings first
    const meetingsResponse = await axios.get(`${OPENF1_API_URL}/meetings`);
    
    if (!meetingsResponse.data || meetingsResponse.data.length === 0) {
      return res.json([]);
    }
    
    // Get sessions for each meeting
    const sessionsPromises = meetingsResponse.data.slice(0, 3).map(async (meeting: any) => {
      const sessionsResponse = await axios.get(`${OPENF1_API_URL}/sessions?meeting_key=${meeting.meeting_key}`);
      
      return sessionsResponse.data.map((session: any) => ({
        session_key: session.session_key,
        meeting_key: session.meeting_key,
        session_name: session.session_name,
        session_type: session.session_type,
        meeting_name: meeting.meeting_name,
        country_name: meeting.country_name,
        circuit_short_name: meeting.circuit_short_name,
        date_start: session.date_start
      }));
    });
    
    const sessionsArrays = await Promise.all(sessionsPromises);
    const sessions = sessionsArrays.flat();
    
    // Cache for 5 minutes (static data)
    cache.set(req.originalUrl, sessions, 300);
    
    res.json(sessions);
  } catch (error: any) {
    console.error("Error fetching sessions:", error.message);
    res.status(500).json({ error: "Failed to fetch sessions from OpenF1 API" });
  }
});

// Get drivers for a session
apiRouter.get("/drivers", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    
    const response = await axios.get(`${OPENF1_API_URL}/drivers?session_key=${sessionKey}`);
    
    // Define team colors
    const teamColors: Record<string, string> = {
      "Red Bull Racing": "0600EF",
      "Ferrari": "DC0000",
      "Mercedes": "00D2BE",
      "Alpine": "0090FF",
      "McLaren": "FF8700",
      "Alfa Romeo": "900000",
      "Aston Martin": "006F62",
      "Haas F1 Team": "FFFFFF",
      "AlphaTauri": "2B4562",
      "Williams": "0057E9",
      "RB": "0041C2"
    };
    
    // Assign teams based on driver number (for 2023 season)
    const driverTeams: Record<number, { team: string, firstName: string, lastName: string, country: string }> = {
      1: { team: "Red Bull Racing", firstName: "Max", lastName: "Verstappen", country: "NLD" },
      11: { team: "Red Bull Racing", firstName: "Sergio", lastName: "Perez", country: "MEX" },
      16: { team: "Ferrari", firstName: "Charles", lastName: "Leclerc", country: "MON" },
      55: { team: "Ferrari", firstName: "Carlos", lastName: "Sainz", country: "ESP" },
      44: { team: "Mercedes", firstName: "Lewis", lastName: "Hamilton", country: "GBR" },
      63: { team: "Mercedes", firstName: "George", lastName: "Russell", country: "GBR" },
      14: { team: "Aston Martin", firstName: "Fernando", lastName: "Alonso", country: "ESP" },
      18: { team: "Aston Martin", firstName: "Lance", lastName: "Stroll", country: "CAN" },
      10: { team: "Alpine", firstName: "Pierre", lastName: "Gasly", country: "FRA" },
      31: { team: "Alpine", firstName: "Esteban", lastName: "Ocon", country: "FRA" },
      4: { team: "McLaren", firstName: "Lando", lastName: "Norris", country: "GBR" },
      81: { team: "McLaren", firstName: "Oscar", lastName: "Piastri", country: "AUS" },
      27: { team: "Haas F1 Team", firstName: "Nico", lastName: "Hulkenberg", country: "DEU" },
      20: { team: "Haas F1 Team", firstName: "Kevin", lastName: "Magnussen", country: "DNK" },
      22: { team: "RB", firstName: "Yuki", lastName: "Tsunoda", country: "JPN" },
      21: { team: "RB", firstName: "Nyck", lastName: "de Vries", country: "NLD" },
      3: { team: "RB", firstName: "Daniel", lastName: "Ricciardo", country: "AUS" },
      23: { team: "Williams", firstName: "Alexander", lastName: "Albon", country: "THA" },
      2: { team: "Williams", firstName: "Logan", lastName: "Sargeant", country: "USA" },
      77: { team: "Alfa Romeo", firstName: "Valtteri", lastName: "Bottas", country: "FIN" },
      24: { team: "Alfa Romeo", firstName: "Zhou", lastName: "Guanyu", country: "CHN" }
    };
    
    // Add positions from the positions endpoint
    const positionsResponse = await axios.get(`${OPENF1_API_URL}/position?session_key=${sessionKey}`);
    
    // Process position data to get latest position for each driver
    const latestPositions = positionsResponse.data.reduce((acc: Record<number, number>, pos: any) => {
      const driverNumber = pos.driver_number;
      
      if (!acc[driverNumber] || new Date(pos.date) > new Date(acc[driverNumber].date)) {
        acc[driverNumber] = pos.position;
      }
      
      return acc;
    }, {});
    
    // Enhance driver data with team info and position
    const enhancedDrivers = response.data.map((driver: any) => {
      const driverInfo = driverTeams[driver.driver_number];
      const teamName = driverInfo?.team || "Unknown Team";
      
      return {
        ...driver,
        team_name: teamName,
        team_colour: teamColors[teamName] || "CCCCCC",
        first_name: driverInfo?.firstName || driver.full_name.split(' ')[0],
        last_name: driverInfo?.lastName || driver.full_name.split(' ')[1],
        country_code: driverInfo?.country || "XXX",
        position: latestPositions[driver.driver_number] || null
      };
    });
    
    // Cache for 5 minutes (relatively static data)
    cache.set(req.originalUrl, enhancedDrivers, 300);
    
    res.json(enhancedDrivers);
  } catch (error: any) {
    console.error("Error fetching drivers:", error.message);
    res.status(500).json({ error: "Failed to fetch drivers from OpenF1 API" });
  }
});

// Get positions
apiRouter.get("/positions", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    
    const response = await axios.get(`${OPENF1_API_URL}/position?session_key=${sessionKey}`);
    
    // Process position data to get latest position for each driver
    const latestPositions = response.data.reduce((acc: any[], pos: any) => {
      const existingIndex = acc.findIndex((p) => p.driver_number === pos.driver_number);
      
      if (existingIndex === -1) {
        // Driver not in array yet, add them
        acc.push(pos);
      } else {
        // Update if this position is newer
        const existingDate = new Date(acc[existingIndex].date);
        const newDate = new Date(pos.date);
        
        if (newDate > existingDate) {
          acc[existingIndex] = pos;
        }
      }
      
      return acc;
    }, []);
    
    // Sort by position
    latestPositions.sort((a: any, b: any) => a.position - b.position);
    
    // Add interval to show gap between positions
    latestPositions.forEach((pos: any, index: number, arr: any[]) => {
      if (index === 0) {
        pos.interval = null; // Leader has no interval
      } else {
        // Try to get interval data from OpenF1 API
        pos.interval = null; // Default to null if not available
      }
    });
    
    // Cache for 10 seconds (dynamic data)
    cache.set(req.originalUrl, latestPositions, 10);
    
    res.json(latestPositions);
  } catch (error: any) {
    console.error("Error fetching positions:", error.message);
    res.status(500).json({ error: "Failed to fetch positions from OpenF1 API" });
  }
});

// Get lap data
apiRouter.get("/laps", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    const driverNumber = req.query.driver_number;
    
    let url = `${OPENF1_API_URL}/laps?session_key=${sessionKey}`;
    if (driverNumber) {
      url += `&driver_number=${driverNumber}`;
    }
    
    const response = await axios.get(url);
    
    // Cache for 10 seconds (dynamic data)
    cache.set(req.originalUrl, response.data, 10);
    
    res.json(response.data);
  } catch (error: any) {
    console.error("Error fetching laps:", error.message);
    res.status(500).json({ error: "Failed to fetch laps from OpenF1 API" });
  }
});

// Get car telemetry data
apiRouter.get("/car_data", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    const driverNumber = req.query.driver_number;
    
    if (!driverNumber) {
      return res.status(400).json({ error: "driver_number is required" });
    }
    
    // Fetch the most recent car data for the driver
    const response = await axios.get(
      `${OPENF1_API_URL}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`
    );
    
    if (response.data && response.data.length > 0) {
      // Return the most recent data point
      const sorted = response.data.sort((a: any, b: any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      res.json(sorted[0]);
    } else {
      res.json(null);
    }
  } catch (error: any) {
    console.error("Error fetching car data:", error.message);
    res.status(500).json({ error: "Failed to fetch car data from OpenF1 API" });
  }
});

// Get location data
apiRouter.get("/locations", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    
    // Get the most recent position data for visualization
    // Limit results to not overload the client
    let url = `${OPENF1_API_URL}/location?session_key=${sessionKey}&limit=1000`;
    
    const response = await axios.get(url);
    
    // Process data to get a reasonable number of points for each driver
    const driversData: Record<number, any[]> = {};
    
    response.data.forEach((loc: any) => {
      if (!driversData[loc.driver_number]) {
        driversData[loc.driver_number] = [];
      }
      
      driversData[loc.driver_number].push(loc);
    });
    
    // For each driver, sample points to get a reasonable number
    const sampledData: any[] = [];
    Object.values(driversData).forEach((driverLocations) => {
      // Sort by date
      driverLocations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Sample locations (take every Nth point)
      const sampleRate = Math.max(1, Math.floor(driverLocations.length / 50));
      
      for (let i = 0; i < driverLocations.length; i += sampleRate) {
        sampledData.push(driverLocations[i]);
      }
      
      // Always include the most recent point
      if (driverLocations.length > 0) {
        sampledData.push(driverLocations[driverLocations.length - 1]);
      }
    });
    
    // Cache for 10 seconds (dynamic data)
    cache.set(req.originalUrl, sampledData, 10);
    
    res.json(sampledData);
  } catch (error: any) {
    console.error("Error fetching location data:", error.message);
    res.status(500).json({ error: "Failed to fetch location data from OpenF1 API" });
  }
});

// Get intervals between drivers
apiRouter.get("/intervals", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    
    const response = await axios.get(`${OPENF1_API_URL}/intervals?session_key=${sessionKey}`);
    
    // Process to get the latest intervals
    const latestIntervals = response.data.reduce((acc: any[], interval: any) => {
      const existingIndex = acc.findIndex((i) => i.driver_number === interval.driver_number);
      
      if (existingIndex === -1) {
        // Driver not in array yet, add them
        acc.push(interval);
      } else {
        // Update if this interval is newer
        const existingDate = new Date(acc[existingIndex].date);
        const newDate = new Date(interval.date);
        
        if (newDate > existingDate) {
          acc[existingIndex] = interval;
        }
      }
      
      return acc;
    }, []);
    
    // Cache for 10 seconds (dynamic data)
    cache.set(req.originalUrl, latestIntervals, 10);
    
    res.json(latestIntervals);
  } catch (error: any) {
    console.error("Error fetching intervals:", error.message);
    res.status(500).json({ error: "Failed to fetch intervals from OpenF1 API" });
  }
});

// Get team radio messages
apiRouter.get("/team_radio", async (req, res) => {
  try {
    const sessionKey = req.query.session_key || "latest";
    const driverNumber = req.query.driver_number;
    
    let url = `${OPENF1_API_URL}/team_radio?session_key=${sessionKey}`;
    if (driverNumber) {
      url += `&driver_number=${driverNumber}`;
    }
    
    const response = await axios.get(url);
    
    // Cache for 2 minutes (radio messages don't change often)
    cache.set(req.originalUrl, response.data, 120);
    
    res.json(response.data);
  } catch (error: any) {
    console.error("Error fetching team radio:", error.message);
    res.status(500).json({ error: "Failed to fetch team radio from OpenF1 API" });
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);

  return httpServer;
}
