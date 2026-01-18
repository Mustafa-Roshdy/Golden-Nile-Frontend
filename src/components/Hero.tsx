import { Search, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/hero-luxor.jpg";

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxor Temple at Sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
          Discover the Timeless Beauty
          <br />
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            of Luxor & Aswan
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto animate-slide-up">
          Experience the magic of ancient Egypt with luxury tours, Nile cruises, and unforgettable cultural adventures
        </p>

        {/* Search Bar */}
        {/* <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-4 md:p-6 animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Destination"
                className="pl-10 h-12 border-border"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Hotels, Tours, Attractions"
                className="pl-10 h-12 border-border"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10 h-12 border-border"
              />
            </div>
            <Button className="h-12 text-base font-semibold">
              Search
            </Button>
          </div>
        </div> */}

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
            Luxury Hotels
          </span>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
            Nile Cruises
          </span>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
            Hot Air Balloons
          </span>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
            Ancient Temples
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
