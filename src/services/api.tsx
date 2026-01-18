// API Configuration and Service Layer
// Update BASE_URL to match your backend endpoint
const BASE_URL = import.meta.env.VITE_API_URL || 'https://golden-nile-backend.vercel.app/api';
// Change this to your backend URL

import Cookies from 'js-cookie';

// Get JWT token from cookies
const getAuthToken = (): string | null => {
  return Cookies.get('goldenNileToken') || null;
};

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
  }

  // NEVER reassign response → use new variable
  const data = await response.json();
  return data as T;
}

// Booking API Interface
export interface Booking {
  _id?: string;
  arrivalDate: string;
  leavingDate: string;
  memberNumber: number;
  roomNumber?: number;
  place: string | Place;
  user: string;
  status?: "pending" | "paid";
  paymentStatus?: "unpaid" | "paid";
  paymentMethod?: "visa" | "wallet" | null;
  platform?: "web" | "mobile";
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id?: string;
  bookingId: string;
  method: "visa" | "wallet";
  amount: number;
  fakeTransactionId: string;
  platform: "web" | "mobile";
  paidAt?: string;
}

export interface Place {
  _id: string;
  name: string;
  type: "guest_house" | "restaurant";
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  governorate: "aswan" | "luxor";
  createdBy: any; // User object
  phone?: string;
  description?: string;
  rooms?: number;
  tables?: number;
  breakfast?: boolean;
  wifi?: boolean;
  airConditioning?: boolean;
  pricePerNight?: number;
  cuisine?: string[];
  pricePerTable?: number;
  chairsPerTable?: number;
  isAvailable: boolean;
  likes: string[];
  dislikes: string[];
  reviews: {
    user: any;
    comment: string;
    createdAt: string;
  }[];
  rating: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingData {
  place: string;
  bookingType: "guest_house" | "restaurant";
  governorate: "aswan" | "luxor";
  memberNumber: number;
  totalPrice: number;
  platform?: "web" | "mobile";
  // Guest house fields
  arrivalDate?: string;
  leavingDate?: string;
  numberOfRooms?: number;
  guestTypes?: {
    adults: number;
    children: number;
  };
  // Restaurant fields
  bookingDay?: string;
  bookingTime?: string;
  // Shared optional
  roomNumber?: number;
}

export interface GeneratedProgram {
  days: Array<{
    date: string;
    schedule: Array<{
      time: string;
      type: "attraction" | "restaurant";
      id: string;
      name: string;
      description: string;
      image: string;
      latitude: string;
      longitude: string;
      price?: number;
    }>;
  }>;
  suggest: {
    guestHouses: Array<{
      id: string;
      name: string;
      price: number;
      latitude: number;
      longitude: number;
      image?: string;
    }>;
  };
}

export interface SavedProgram {
  _id?: string;
  name: string;
  user: string;
  destination: string;
  budget?: number;
  checkInDate: string;
  checkOutDate: string;
  interests?: string[];
  adults: number;
  children: number;
  activities: Array<{
    name: string;
    image?: string;
    latitude?: string;
    longitude?: string;
    startTime: string;
    endTime: string;
    type?: "attraction" | "guest_house" | "restaurant";
    placeId?: string;
  }>;
  estimatedBudget?: {
    accommodation: number;
    food: number;
    attractions: number;
    total: number;
  };
  suggestedGuestHouses?: Array<{
    id: string;
    name?: string;
    price?: number;
    latitude?: number;
    longitude?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgramData {
  name: string;
  destination: string;
  budget?: number;
  checkInDate: string;
  checkOutDate: string;
  interests?: string[];
  adults: number;
  children: number;
  user?: string;
  activities: Array<{
    name: string;
    image?: string;
    latitude?: string;
    longitude?: string;
    startTime: string;
    endTime: string;
    type?: "attraction" | "guest_house" | "restaurant";
    placeId?: string;
  }>;
  estimatedBudget?: {
    accommodation: number;
    food: number;
    attractions: number;
    total: number;
  };
  suggestedGuestHouses?: Array<{
    id: string;
    name?: string;
    price?: number;
    latitude?: number;
    longitude?: number;
  }>;
}

// Booking API Service
export const bookingApi = {
  // Create a new booking
  createBooking: (data: CreateBookingData) =>
    apiRequest<{ success: boolean; data: Booking }>('/booking/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get all bookings for a user
  getUserBookings: (userId: string) =>
    apiRequest<{ bookings: Booking[] }>(`/booking/user/${userId}`),

  // Get bookings for a specific place
  getPlaceBookings: (placeId: string) =>
    apiRequest<{ bookings: Booking[] }>(`/booking/place/${placeId}`),

  // Get a single booking by ID
  getBooking: (id: string) =>
    apiRequest<{ booking: Booking }>(`/booking/${id}`),

  // Update a booking
  updateBooking: (id: string, data: Partial<CreateBookingData>) =>
    apiRequest<{ booking: Booking }>(`/booking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete a booking
  deleteBooking: (id: string) =>
    apiRequest<{ message: string }>(`/booking/${id}`, {
      method: 'DELETE',
    }),
};

export const paymentApi = {
  fakePay: (payload: {
    bookingId: string;
    method: "visa" | "wallet";
    amount?: number;
    platform?: "web" | "mobile";
    cardNumber?: string;
    expiry?: string;
    simulateStatus?: "paid" | "pending" | "failed";
  }) =>
    apiRequest<{ success: boolean; data: { paymentStatus: string; bookingStatus: string; message: string; bookingId: string; paymentId: string } }>(
      '/payments/fake',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
};

// Place API Service
export const placeApi = {
  // Get all places
  getAllPlaces: () =>
    apiRequest<{ success: boolean; count: number; data: Place[] }>('/place'),

  // Get all guest houses
  getAllGuestHouses: () =>
    apiRequest<{ success: boolean; count: number; data: Place[] }>('/place/type/guest_house'),

  // Get all restaurants
  getAllRestaurants: () =>
    apiRequest<{ success: boolean; count: number; data: Place[] }>('/place/type/restaurant'),

  // Get places by governorate
  getPlacesByGovernorate: (governorate: string) =>
    apiRequest<{ success: boolean; count: number; data: Place[] }>(`/place/governorate/${governorate}`),

  // Get place by ID
  getPlace: (id: string) =>
    apiRequest<{ success: boolean; data: Place }>(`/place/${id}`),

  // Like place
  likePlace: (id: string) =>
    apiRequest<{ success: boolean; data: Place }>(`/place/${id}/like`, {
      method: 'POST',
    }),

  // Dislike place
  dislikePlace: (id: string) =>
    apiRequest<{ success: boolean; data: Place }>(`/place/${id}/dislike`, {
      method: 'POST',
    }),

  // Add review
  addReview: (placeId: string, message: string) =>
    apiRequest<{ success: boolean; data: any }>(`/review`, {
      method: 'POST',
      body: JSON.stringify({ place: placeId, message }),
    }),

  // Get reviews for place
  getReviews: (placeId: string) =>
    apiRequest<{ success: boolean; count: number; data: any[] }>(`/review/place/${placeId}`),

  // Update review
  updateReview: (reviewId: string, message: string) =>
    apiRequest<{ success: boolean; data: any }>(`/review/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    }),

  // Delete review
  deleteReview: (reviewId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/review/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Trip API Service
export const tripApi = {
  // Generate travel program
  generateProgram: (data: {
    destination: string;
    budget?: number;
    checkInDate: string;
    checkOutDate: string;
    interests?: string[];
    adults: number;
    children: number;
  }) =>
    apiRequest<{ success: boolean; data: GeneratedProgram }>('/generate-program', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get attractions
  getAttractions: () =>
    apiRequest<{ success: boolean; data: any[] }>('/attractions'),
};

// Program API Service
export const programApi = {
  // Create a new program
  createProgram: (data: CreateProgramData) =>
    apiRequest<{ success: boolean; data: SavedProgram }>('/program/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get all programs (admin only)
  getAllPrograms: () =>
    apiRequest<{ success: boolean; count: number; data: SavedProgram[] }>('/program'),

  // Get programs by user
  getProgramsByUser: (userId: string) =>
    apiRequest<{ success: boolean; count: number; data: SavedProgram[] }>(`/program/user/${userId}`),

  // Get program by id
  getProgram: (id: string) =>
    apiRequest<{ success: boolean; data: SavedProgram }>(`/program/${id}`),

  // Update program
  updateProgram: (id: string, data: Partial<CreateProgramData>) =>
    apiRequest<{ success: boolean; data: SavedProgram }>(`/program/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete program
  deleteProgram: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/program/${id}`, {
      method: 'DELETE',
    }),
};

// Chatbot API Service
export const chatbotApi = {
  // Create conversation
  createConversation: () =>
    apiRequest<{ success: boolean; data: { conversationId: string } }>('/conversation/id', {
      method: 'POST',
    }),

  // Travel advice chatbot
  travelAdvice: (message: string, conversationId: string) =>
    apiRequest<{ success: boolean; data: { advice: string; conversationId: string; message: string; user: string; _id: string; createdAt: string } }>('/travel-advice', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    }),
};

// Place data is now fetched from API

// Authentication helpers
export const authHelpers = {
  setAuthToken: (token: string) => {
    Cookies.set('goldenNileToken', token);
  },

  removeAuthToken: () => {
    Cookies.remove('goldenNileToken');
  },

  // Get user ID from JWT token payload
  getCurrentUserId: (): string => {
    const token = Cookies.get('goldenNileToken');
    if (!token) return '';

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.id || '';
    } catch {
      return '';
    }
  },

  // Get user role from JWT token payload
  getCurrentUserRole: (): string => {
    const token = Cookies.get('goldenNileToken');
    if (!token) return '';

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.role || 'customer';
    } catch {
      return 'customer';
    }
  },

  setUserId: (userId: string) => {
    // User ID is now extracted from JWT token, so this might not be needed
    // But keeping for backward compatibility
    localStorage.setItem('userId', userId);
  },
};
