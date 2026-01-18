
export interface Flight {
  icao24: string;
  callsign: string;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  onGround: boolean;
  verticalRate: number;
  lastContact: number;
}

export interface FlightInsight {
  summary: string;
  funFact: string;
  aircraftTypeGuess: string;
  origin: string;
  destination: string;
  destinationCoords?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
  schedule?: {
    departureEstimated: string;
    departureActual: string;
    arrivalEstimated: string;
    arrivalActual: string;
  };
}

export interface AirportFlight {
  callsign: string;
  airline: string;
  status: 'Em curso' | 'Estimado' | 'Próximo';
  type: 'Partida' | 'Chegada';
  time: string;
  destinationOrigin: string;
}

export interface AirportBoard {
  airportName: string;
  city: string;
  flights: AirportFlight[];
}

export interface MapPosition {
  lat: number;
  lng: number;
  zoom: number;
}
