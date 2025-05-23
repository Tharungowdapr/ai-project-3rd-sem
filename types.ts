
export interface ObjectCount {
  total: number;
  types: { [key: string]: number }; // e.g., { 'car': 10, 'bus': 2 }
}

export interface LogEntry {
  frame: number;
  timestamp: number;
  vehicles: ObjectCount;
  humans: ObjectCount; // Added
  animals: ObjectCount; // Added
  congestion: CongestionLevel;
  incident: boolean;
  relativeTime: number;
}

export enum CongestionLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export interface CurrentFrameStats {
  vehicleCount: number;
  humanCount: number; // Added
  animalCount: number; // Added
  congestion: CongestionLevel;
  incident: boolean;
  frameNumber: number;
}

export interface SummaryStats {
  averageVehicleCount: number;
  averageHumanCount: number; // Added
  averageAnimalCount: number; // Added
  totalIncidents: number;
  finalCongestionLevel: CongestionLevel;
}

export interface ObjectTypeDistribution {
  name: string; // e.g., 'car', 'person', 'dog'
  value: number;
}

export interface OverallDetectionDistribution {
    name: 'Vehicles' | 'Humans' | 'Animals';
    value: number;
}
