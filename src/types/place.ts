// ---- Types ----
export interface Place {
    _id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    images?: string | string[] | null;
    governorate: "aswan" | "luxor";
    description?: string;
    type: "guest_house" | "restaurant";
    createdBy?: any;
    rooms?: number;
    breakfast?: boolean;
    wifi?: boolean;
    airConditioning?: boolean;
    pricePerNight?: number;
    cuisine?: string[];
    pricePerTable?: number;
    chairsPerTable?: number;
    isAvailable?: boolean;
    likes?: string[];
    dislikes?: string[];
    reviews?: any[];
    rating?: number;
    createdAt?: string;
}

export interface PlaceState {
    list: Place[];
    loading: boolean;
    error: string | null;
}