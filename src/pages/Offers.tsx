import { useEffect, useState } from "react";
import { Ship, Tent, CircleDot, Landmark, Clock, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import heroImage from "@/assets/aswan-sunset.jpg";
import { useLocation } from "react-router-dom";

const TRIPS = [
  { 
    id: 't1', 
    title: 'Luxury Nile Cruise', 
    location: 'Aswan → Luxor', 
    type: 'Nile Cruise', 
    short: '5-day luxury cruise with guided temple visits.', 
    price: 799, 
    duration: 5, 
    image: 'nile-cruise.jpg', 
    details: 'Full-board cruise, guided tours, sunset by the Nile.' 
  },
  { 
    id: 't2', 
    title: 'Desert Safari Adventure', 
    location: 'Luxor', 
    type: 'Safari', 
    short: 'Thrilling desert safari across the Luxor dunes.', 
    price: 320, 
    duration: 1, 
    image: 'aswan-sunset.jpg', 
    details: '4x4 desert ride, camel experience, dinner under the stars.' 
  },
  { 
    id: 't3', 
    title: 'Balloon Sunrise Ride', 
    location: 'Luxor', 
    type: 'Balloon', 
    short: 'Experience sunrise over the Valley of the Kings.', 
    price: 420, 
    duration: 1, 
    image: 'balloons-luxor.jpg', 
    details: 'Early pickup, balloon flight, breakfast after landing.' 
  },
  { 
    id: 't4', 
    title: 'Ancient Temples Tour', 
    location: 'Luxor & Aswan', 
    type: 'Temple', 
    short: 'Explore the magnificent temples of ancient Egypt.', 
    price: 550, 
    duration: 3, 
    image: 'abu-simbel.jpg', 
    details: 'Guided tours of Karnak, Luxor, Philae, and Abu Simbel temples.' 
  },
  { 
    id: 't5', 
    title: 'Nubian Village Experience', 
    location: 'Aswan', 
    type: 'Cultural', 
    short: 'Immerse yourself in authentic Nubian culture.', 
    price: 180, 
    duration: 1, 
    image: 'nubian-village.jpg', 
    details: 'Village tour, traditional lunch, henna painting, local crafts.' 
  },
  { 
    id: 't6', 
    title: 'Premium Nile Cruise Deluxe', 
    location: 'Luxor → Aswan', 
    type: 'Nile Cruise', 
    short: '7-day ultimate luxury Nile experience.', 
    price: 1299, 
    duration: 7, 
    image: 'nile-cruise.jpg', 
    details: 'Premium suite, gourmet dining, spa, all excursions included.' 
  },
];

const Offers = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>("");

  const getImagePath = (imageName: string) => {
    const imageMap: { [key: string]: string } = {
      'nile-cruise.jpg': '/src/assets/nile-cruise.jpg',
      'safari.jpg': '/src/assets/aswan-sunset.jpg',
      'balloon.jpg': '/src/assets/balloons-luxor.jpg',
      'aswan-sunset.jpg': '/src/assets/aswan-sunset.jpg',
      'balloons-luxor.jpg': '/src/assets/balloons-luxor.jpg',
      'abu-simbel.jpg': '/src/assets/abu-simbel.jpg',
      'nubian-village.jpg': '/src/assets/nubian-village.jpg',
    };
    return imageMap[imageName] || '/src/assets/nile-cruise.jpg';
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDurationToggle = (duration: string) => {
    setSelectedDurations(prev =>
      prev.includes(duration) ? prev.filter(d => d !== duration) : [...prev, duration]
    );
  };

  const filteredTrips = TRIPS.filter(trip => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(trip.type);
    const durationMatch = selectedDurations.length === 0 || selectedDurations.some(d => {
      if (d === '1-day') return trip.duration === 1;
      if (d === '3-5-days') return trip.duration >= 3 && trip.duration <= 5;
      if (d === '7-days') return trip.duration >= 7;
      return true;
    });
    const priceMatch = !priceRange || 
      (priceRange === 'budget' && trip.price < 300) ||
      (priceRange === 'mid' && trip.price >= 300 && trip.price < 700) ||
      (priceRange === 'luxury' && trip.price >= 700);
    
    return typeMatch && durationMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <div className="relative z-10 text-center px-4 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Explore Luxor & Aswan
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Discover timeless wonders with our exclusive travel packages
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-muted/30 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Type Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <Ship className="w-5 h-5" />
                  Type
                  {selectedTypes.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {selectedTypes.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Trip Type</h4>
                  {[
                    { value: 'Nile Cruise', label: 'Nile Cruise', icon: Ship },
                    { value: 'Safari', label: 'Desert Safari', icon: Tent },
                    { value: 'Balloon', label: 'Hot Air Balloon', icon: CircleDot },
                    { value: 'Temple', label: 'Temple Tours', icon: Landmark },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={selectedTypes.includes(value)}
                        onCheckedChange={() => handleTypeToggle(value)}
                      />
                      <label
                        htmlFor={value}
                        className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-primary" />
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Duration Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <Clock className="w-5 h-5" />
                  Duration
                  {selectedDurations.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      {selectedDurations.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Trip Duration</h4>
                  {[
                    { value: '1-day', label: '1 Day Trip' },
                    { value: '3-5-days', label: '3-5 Days' },
                    { value: '7-days', label: '7+ Days' },
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={selectedDurations.includes(value)}
                        onCheckedChange={() => handleDurationToggle(value)}
                      />
                      <label
                        htmlFor={value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Other Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Other Filters
                  {priceRange && (
                    <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                      1
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Price Range</h4>
                  {[
                    { value: 'budget', label: 'Budget (Under $300)' },
                    { value: 'mid', label: 'Mid-Range ($300-$700)' },
                    { value: 'luxury', label: 'Luxury ($700+)' },
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={value}
                        checked={priceRange === value}
                        onCheckedChange={(checked) => setPriceRange(checked ? value : '')}
                      />
                      <label
                        htmlFor={value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(selectedTypes.length > 0 || selectedDurations.length > 0 || priceRange) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedDurations([]);
                  setPriceRange('');
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No trips match your filters. Try adjusting your selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrips.map((trip, index) => (
                <Card
                  key={trip.id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={getImagePath(trip.image)}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white text-sm">{trip.details}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                        {trip.type}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{trip.title}</h3>
                    <p className="text-muted-foreground mb-4 flex items-center gap-2">
                      <Landmark className="w-4 h-4" />
                      {trip.location}
                    </p>
                    <p className="text-muted-foreground mb-4">{trip.short}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {trip.duration} {trip.duration === 1 ? 'Day' : 'Days'}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        ${trip.price}
                      </span>
                    </div>
                    <Button className="w-full">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Offers;
