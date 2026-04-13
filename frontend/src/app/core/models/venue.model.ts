export type VenueStatus = 'available' | 'maintenance' | 'closed';

export interface Venue {
    id: string;
    name: string;
    clubId: string;
    clubName: string;
    type: 'indoor' | 'outdoor';
    surface: string;
    capacity: number;
    tables: number;
    address: string;
    city: string;
    status: VenueStatus;
    amenities: string[];
    images?: string[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Reservation {
    id: string;
    venueId: string;
    venueName: string;
    title: string;
    type: 'match' | 'training' | 'competition' | 'event';
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    requestedById: string;
    requestedByName: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    notes?: string;
    conflictsWith?: string[];
}
