export interface BaseEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  images: string[];
  category: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  };
  capacity?: number;
  availableTickets?: number;
  status: 'active' | 'cancelled' | 'postponed' | 'rescheduled';
  source: 'ticketmaster' | 'platform';
}

// Platform-created events
export interface PlatformEvent extends BaseEvent {
  source: 'platform';
  createdBy: string; // Staff user ID
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  registrations?: EventRegistration[];
  tags?: string[];
}

// Ticketmaster events
export interface TicketmasterEvent extends BaseEvent {
  source: 'ticketmaster';
  ticketmasterData: {
    originalId: string;
    url: string;
    ticketUrl?: string;
    priceRanges?: Array<{
      type: string;
      currency: string;
      min: number;
      max: number;
    }>;
    sales: {
      public: {
        startDateTime?: string;
        endDateTime?: string;
      };
    };
    classifications?: Array<{
      segment: string;
      genre: string;
      subGenre?: string;
    }>;
  };
  lastSynced: string;
}

export type Event = PlatformEvent | TicketmasterEvent;

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended';
  ticketCount: number;
}

export interface EventFilters {
  category?: string;
  city?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  source?: 'all' | 'ticketmaster' | 'platform';
  search?: string;
}

// Ticketmaster API Response Types
export interface TicketmasterAPIResponse {
  _embedded?: {
    events: TicketmasterAPIEvent[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface TicketmasterAPIEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  sales?: {
    public: {
      startDateTime?: string;
      startTBD?: boolean;
      startTBA?: boolean;
      endDateTime?: string;
    };
  };
  dates: {
    start: {
      localDate: string;
      localTime?: string;
      dateTime?: string;
      dateTBD?: boolean;
      dateTBA?: boolean;
      timeTBA?: boolean;
      noSpecificTime?: boolean;
    };
    end?: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
      approximate?: boolean;
    };
    status: {
      code: string;
    };
    spanMultipleDays?: boolean;
  };
  classifications?: Array<{
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre?: {
      id: string;
      name: string;
    };
    type?: {
      id: string;
      name: string;
    };
    subType?: {
      id: string;
      name: string;
    };
    family?: boolean;
  }>;
  promoter?: {
    id: string;
    name: string;
    description: string;
  };
  promoters?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  info?: string;
  pleaseNote?: string;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded?: {
    venues: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      locale: string;
      images?: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
        fallback: boolean;
      }>;
      postalCode?: string;
      timezone?: string;
      city: {
        name: string;
      };
      state?: {
        name: string;
        stateCode: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      address?: {
        line1?: string;
        line2?: string;
      };
      location?: {
        longitude: string;
        latitude: string;
      };
      markets?: Array<{
        name: string;
        id: string;
      }>;
      dmas?: Array<{
        id: number;
      }>;
      social?: {
        twitter?: {
          handle: string;
        };
      };
      boxOfficeInfo?: {
        phoneNumberDetail?: string;
        openHoursDetail?: string;
        acceptedPaymentDetail?: string;
        willCallDetail?: string;
      };
      parkingDetail?: string;
      accessibleSeatingDetail?: string;
      generalInfo?: {
        generalRule?: string;
        childRule?: string;
      };
      upcomingEvents?: {
        ticketmaster?: number;
        _total: number;
        _filtered: number;
      };
      ada?: {
        adaPhones?: string;
        adaCustomCopy?: string;
        adaHours?: string;
      };
    }>;
    attractions?: Array<{
      id: string;
      name: string;
      type: string;
      url?: string;
      locale: string;
      externalLinks?: {
        youtube?: Array<{
          url: string;
        }>;
        twitter?: Array<{
          url: string;
        }>;
        itunes?: Array<{
          url: string;
        }>;
        lastfm?: Array<{
          url: string;
        }>;
        facebook?: Array<{
          url: string;
        }>;
        spotify?: Array<{
          url: string;
        }>;
        musicbrainz?: Array<{
          id: string;
        }>;
        homepage?: Array<{
          url: string;
        }>;
      };
      images?: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
        fallback: boolean;
      }>;
      classifications?: Array<{
        primary: boolean;
        segment: {
          id: string;
          name: string;
        };
        genre: {
          id: string;
          name: string;
        };
        subGenre?: {
          id: string;
          name: string;
        };
        type?: {
          id: string;
          name: string;
        };
        subType?: {
          id: string;
          name: string;
        };
        family?: boolean;
      }>;
      upcomingEvents?: {
        ticketmaster?: number;
        _total: number;
        _filtered: number;
      };
    }>;
  };
}