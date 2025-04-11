// This file contains type definitions for the OpenF1 API responses
// Used for strongly typing API responses in components and hooks

export interface OpenF1Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url?: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface OpenF1CarData {
  brake: number;
  date: string;
  driver_number: number;
  drs: number;
  meeting_key: number;
  n_gear: number;
  rpm: number;
  session_key: number;
  speed: number;
  throttle: number;
}

export interface OpenF1Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface OpenF1Lap {
  date_start: string;
  driver_number: number;
  duration_sector_1?: number | null;
  duration_sector_2?: number | null;
  duration_sector_3?: number | null;
  i1_speed?: number | null;
  i2_speed?: number | null;
  is_pit_out_lap?: boolean;
  lap_duration?: number | null;
  lap_number: number;
  meeting_key: number;
  segments_sector_1?: number[] | null;
  segments_sector_2?: number[] | null;
  segments_sector_3?: number[] | null;
  session_key: number;
  st_speed?: number | null;
}

export interface OpenF1Location {
  date: string;
  driver_number: number;
  meeting_key: number;
  session_key: number;
  x: number;
  y: number;
  z: number;
}

export interface OpenF1Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  meeting_name: string;
  country_name: string;
  circuit_short_name: string;
  date_start: string;
}

export interface OpenF1Interval {
  date: string;
  driver_number: number;
  gap_to_leader?: number | null;
  interval?: number | null;
  meeting_key: number;
  session_key: number;
}

export interface OpenF1Pit {
  date: string;
  driver_number: number;
  lap_number: number;
  meeting_key: number;
  pit_duration: number;
  session_key: number;
}
