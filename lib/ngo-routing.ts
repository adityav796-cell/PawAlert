import { City } from '@/lib/types';

// Map city names to their priority list of NGO names
const NGO_PRIORITY_MAP: Record<City, string[]> = {
  'vijayawada': ['Blue Cross of India', 'VSPCA'],
  'bangalore': ['CUPA', 'Wildlife SOS'],
  'delhi': ['Friendicoes SECA', 'Sanjay Gandhi AFC'],
  'mumbai': ['Paws For A Cause'],
  'other': ['Wildlife SOS'],
};

// Map city to approximate coordinates for testing
const CITY_COORDINATES: Record<City, { lat: number; lng: number }> = {
  'vijayawada': { lat: 16.5062, lng: 80.6480 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'other': { lat: 20.5937, lng: 78.9629 }, // India center
};

export function getNGOPriorityList(city: City): string[] {
  return NGO_PRIORITY_MAP[city] || NGO_PRIORITY_MAP['other'];
}

export function getCityFromArea(area: string): City {
  const lowerArea = area.toLowerCase();
  
  if (lowerArea.includes('vijayawada')) return 'vijayawada';
  if (lowerArea.includes('bangalore')) return 'bangalore';
  if (lowerArea.includes('delhi') || lowerArea.includes('delhimap')) return 'delhi';
  if (lowerArea.includes('mumbai') || lowerArea.includes('bombay')) return 'mumbai';
  
  return 'other';
}

export function getCityCoordinates(city: City) {
  return CITY_COORDINATES[city];
}

export function getNextNGOInPriority(
  city: City,
  currentNGOIndex: number
): string | null {
  const priorityList = getNGOPriorityList(city);
  const nextIndex = currentNGOIndex + 1;
  
  if (nextIndex < priorityList.length) {
    return priorityList[nextIndex];
  }
  
  return null;
}
