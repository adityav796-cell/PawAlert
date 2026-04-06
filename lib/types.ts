export type AnimalType = 'dog' | 'cat' | 'cow' | 'bird' | 'other';

export type RescueStatus = 'pending' | 'notified' | 'rescued';

export type City = 'vijayawada' | 'bangalore' | 'delhi' | 'mumbai' | 'other';

export interface AnimalReport {
  id: string;
  animalType: AnimalType;
  location: string;
  area: string;
  reportedAt: Date;
  status: RescueStatus;
  photo?: string;
  reporterName: string;
  reporterContact: string;
  assignedNGO?: string;
  assignedNGOName?: string;
  assignedNGOContact?: string;
  assignedVolunteer?: string;
  notes?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  declinedCount?: number;
  rescuePhoto?: string;
  rescuedAt?: Date;
  lastNGONotifiedAt?: Date;
  lastNGONotifiedId?: string;
}

export interface NGO {
  id: string;
  name: string;
  phone: string;
  areas: string[];
  type: 'ngo' | 'helpline';
}

export type TabType = 'home' | 'reports' | 'report' | 'user' | 'helplines';
