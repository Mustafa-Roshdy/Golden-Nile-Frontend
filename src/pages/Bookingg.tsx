import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryTiles from "@/components/CategoryTiles";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Home, Flame, MapPin, Users, Search, Star, Heart, ChevronLeft, ChevronRight, Navigation, Building2, Palmtree, Landmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import ChatButton from "@/components/ChatButton";
import { authHelpers } from "@/services/api";
import { cn, formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { placeApi, Place } from "@/services/api";

const GOVERNORATES = [
  { id: "aswan", name: "Aswan", icon: Palmtree, description: "Nubian culture and nature" },
  { id: "luxor", name: "Luxor", icon: Landmark, description: "Ancient temples and tombs" },
];

interface Property {
  id: string;
  title: string;
  location: string;
  type: string;
  placeType: "guest_house" | "restaurant";
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  price: number;
  priceType: string;
  rating: number;
  reviews: number;
  images: string[];
  isGuestFavorite: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

const Booking = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
  const [showGovernorates, setShowGovernorates] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPlaceIds, setNewPlaceIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const totalGuests = adults + children;

  const handleSearch = () => {
    if (selectedGovernorate) {
      fetchPlaces(selectedGovernorate);
      setHasSearched(true);
    }
  };

  const fetchPlaces = async (governorate?: string, newPlaceId?: string) => {
    try {
      setLoading(true);
      let response;
      if (governorate) {
        response = await placeApi.getPlacesByGovernorate(governorate);
      } else {
        response = await placeApi.getAllPlaces();
      }
      const places = response.data;
      const mappedProperties: Property[] = places.map((place: Place) => {
        const isGuestHouse = place.type === "guest_house";
        return {
          id: place._id,
          title: place.name,
          location: place.address,
          type: isGuestHouse ? "Entire guest house" : "Restaurant",
          placeType: place.type, // Add this to distinguish
          guests: isGuestHouse ? (place.rooms ? place.rooms * 2 : 2) : (place.pricePerTable ? 1 : 1), // For restaurants, maybe 1 table
          bedrooms: isGuestHouse ? (place.rooms || 1) : 0,
          beds: isGuestHouse ? (place.rooms ? place.rooms * 2 : 2) : 0,
          baths: isGuestHouse ? (place.rooms || 1) : 0,
          price: isGuestHouse ? (place.pricePerNight || 0) : (place.pricePerTable || 0),
          priceType: isGuestHouse ? "night" : "table", // Add price type
          rating: place.rating,
          reviews: place.reviews.length,
          images: place.images.length > 0 ? place.images : ["/placeholder.svg"],
          isGuestFavorite: place.rating > 4.5,
          ownerId: typeof place.createdBy === 'object' ? (place.createdBy._id || place.createdBy.id) : place.createdBy,
          createdAt: place.createdAt,
          updatedAt: place.updatedAt,
        };
      });
      setProperties(mappedProperties.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()));

      // Mark new place for animation
      if (newPlaceId) {
        setNewPlaceIds(prev => new Set([...prev, newPlaceId]));
        // Remove animation class after animation completes
        setTimeout(() => {
          setNewPlaceIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(newPlaceId);
            return newSet;
          });
        }, 1000);
      }
    } catch (err) {
      setError("Failed to load places");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();

    // Listen for place creation/editing events
    const handlePlaceCreated = (event: CustomEvent) => {
      fetchPlaces(event.detail?.placeId);
    };

    const handlePlaceUpdated = (event: CustomEvent) => {
      fetchPlaces(event.detail?.placeId);
    };

    window.addEventListener('placeCreated', handlePlaceCreated as EventListener);
    window.addEventListener('placeUpdated', handlePlaceUpdated as EventListener);

    return () => {
      window.removeEventListener('placeCreated', handlePlaceCreated as EventListener);
      window.removeEventListener('placeUpdated', handlePlaceUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlaces();
    }, 10000); // refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Category Tiles */}
      <div className="pt-20">
        <CategoryTiles />
      </div>

      {/* Search Bar Section */}
      <div className="py-8 animate-slide-up">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-3xl shadow-elevated p-4 flex flex-col md:flex-row gap-0 md:gap-0 items-stretch">
              {/* Where */}
              <Popover open={showGovernorates} onOpenChange={setShowGovernorates}>
                <PopoverTrigger asChild>
                  <button className="flex-1 text-left p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                    <div className="text-xs font-semibold text-foreground mb-1">Where</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedGovernorate ? GOVERNORATES.find(g => g.id === selectedGovernorate)?.name : "Select governorate"}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-6 bg-card" align="start">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground">Select governorate</h3>
                    {GOVERNORATES.map((gov) => {
                      const Icon = gov.icon;
                      return (
                        <button
                          key={gov.id}
                          onClick={() => {
                            setSelectedGovernorate(gov.id);
                            setShowGovernorates(false);
                          }}
                          className="w-full flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors"
                        >
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-foreground">{gov.name}</div>
                            <div className="text-sm text-muted-foreground">{gov.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="hidden md:block w-px bg-border my-2" />

              {/* Check in */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 text-left p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="text-xs font-semibold text-foreground mb-1">Check in</div>
                    <div className="text-sm text-muted-foreground">
                      {checkIn ? format(checkIn, "MMM dd") : "Add dates"}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      if (date && date < new Date()) {
                        // Don't allow past dates
                        return;
                      }
                      setCheckIn(date);
                      // Clear check-out if it's before the new check-in
                      if (checkOut && date && checkOut <= date) {
                        setCheckOut(undefined);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div className="hidden md:block w-px bg-border my-2" />

              {/* Check out */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex-1 text-left p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="text-xs font-semibold text-foreground mb-1">Check out</div>
                    <div className="text-sm text-muted-foreground">
                      {checkOut ? format(checkOut, "MMM dd") : "Add dates"}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => {
                      if (date && checkIn && date <= checkIn) {
                        // Don't allow check-out before or on check-in
                        return;
                      }
                      setCheckOut(date);
                    }}
                    disabled={(date) => {
                      if (!checkIn) return date < new Date();
                      return date <= checkIn;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div className="hidden md:block w-px bg-border my-2" />

              {/* Who */}
              <Popover open={showGuestPicker} onOpenChange={setShowGuestPicker}>
                <PopoverTrigger asChild>
                  <button className="flex-1 text-left p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className="text-xs font-semibold text-foreground mb-1">Who</div>
                    <div className="text-sm text-muted-foreground">
                      {totalGuests > 0 ? `${totalGuests} guest${totalGuests > 1 ? 's' : ''}` : "Add guests"}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[380px] p-6 bg-card" align="end">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">Adults</div>
                        <div className="text-sm text-muted-foreground">Ages 13 or above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => setAdults(Math.max(0, adults - 1))}
                          disabled={adults === 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{adults}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => setAdults(adults + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">Children</div>
                        <div className="text-sm text-muted-foreground">Ages 2–12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          disabled={children === 0}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium">{children}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full h-8 w-8"
                          onClick={() => setChildren(children + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <Button
                size="lg"
                className="rounded-full md:rounded-2xl ml-2 bg-primary hover:bg-primary/90 h-auto px-8"
                onClick={handleSearch}
                disabled={!selectedGovernorate}
              >
                <Search className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12 animate-scale-in">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {hasSearched && selectedGovernorate
              ? `Places in ${GOVERNORATES.find(g => g.id === selectedGovernorate)?.name}`
              : "Places in Luxor & Aswan"
            }
          </h2>
          <p className="text-muted-foreground">
            {hasSearched ? `Found ${properties.length} places` : `Over ${properties.length} places`}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading places...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <Link
                key={property.id}
                to={`/booking/${property.id}`}
                state={{
                  checkIn,
                  checkOut,
                  adults,
                  children,
                  selectedGovernorate
                }}
              >
                <Card className={cn(
                  "overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-elevated transition-all duration-300 hover:scale-[1.02]",
                  newPlaceIds.has(property.id) && "animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
                )} style={{ animationDelay: newPlaceIds.has(property.id) ? '0ms' : `${index * 100}ms` }}>
                  <div className="relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    {/* <button className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors backdrop-blur-sm">
                      <Heart className="w-5 h-5 text-foreground hover:fill-primary hover:text-primary transition-colors" />
                    </button> */}
                    {property.isGuestFavorite && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-foreground">Guest favorite</span>
                      </div>
                    )}
                    {property.ownerId && property.ownerId !== authHelpers.getCurrentUserId() && (
                      <div className="absolute top-3 right-3" onClick={(e) => e.preventDefault()}>
                        <ChatButton
                          ownerId={property.ownerId}
                          propertyTitle={property.title}
                          className="h-8 w-8 p-0 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm border-0"
                          iconOnly
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{property.rating.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {property.placeType === "guest_house" ? "Guest House" : "Restaurant"}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-1">{property.location}</p>
                    {property.placeType === "guest_house" ? (
                      <p className="text-sm text-muted-foreground mb-1">
                        {property.guests} guests · {property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''} · {property.beds} bed{property.beds > 1 ? 's' : ''} · {property.baths} bath{property.baths > 1 ? 's' : ''}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-1">
                        Restaurant · {property.guests} table{property.guests > 1 ? 's' : ''}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold text-foreground">${formatPrice(property.price)}</span>
                        <span className="text-sm text-muted-foreground">per {property.priceType}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Booking;