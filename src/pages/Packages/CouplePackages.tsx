import { PackageCard, Package } from "@/components/PackageCard";
import nileCruise from "@/assets/nile cruise.jpg";
import luxuryHotel from "@/assets/hotel2.jpg";
import abuSimbel from "@/assets/abu-simbel.jpg";
import desertSafari from "@/assets/desert-safari.jpg";
import heroCouple from "@/assets/hero-couple.jpg";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const couplePackages: Package[] = [
  {
    id: "couple-1",
    title: "Romantic Nile Journey",
    destination: "Luxor & Aswan",
    duration: "5 Days / 4 Nights",
    travelers: "2 Adults",
    image: nileCruise,
    price: "$1,599",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, boutique hotel check-in, romantic dinner with Nile views" },
      { day: "Day 2", activities: "Private temple tours, sunset felucca sailing, candlelit dinner" },
      { day: "Day 3", activities: "Luxury Nile cruise embarkation, couples spa treatment" },
      { day: "Day 4", activities: "Temple visits, onboard fine dining, stargazing on deck" },
      { day: "Day 5", activities: "Aswan arrival, private breakfast, departure" },
    ],
    inclusions: [
      "Deluxe accommodation with Nile views",
      "Private guided tours",
      "Couples spa treatment",
      "Romantic dinners with special arrangements",
      "Private felucca sunset sailing",
      "Champagne welcome and turndown service",
    ],
  },
  {
    id: "couple-2",
    title: "Luxury Desert Romance",
    destination: "Luxor & Aswan",
    duration: "6 Days / 5 Nights",
    travelers: "Couple",
    image: desertSafari,
    price: "$2,199",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, 5-star hotel check-in, welcome spa session" },
      { day: "Day 2", activities: "Private hot air balloon ride, temple tours, romantic dinner" },
      { day: "Day 3", activities: "Desert safari to luxury camp, camel ride, private dinner under stars" },
      { day: "Day 4", activities: "Return to civilization, Nile cruise to Aswan" },
      { day: "Day 5", activities: "Abu Simbel private tour, couples' sunset felucca" },
      { day: "Day 6", activities: "Leisure morning, departure" },
    ],
    inclusions: [
      "5-star hotels and luxury desert camp",
      "Private hot air balloon experience",
      "Exclusive desert dinner for two",
      "All romantic dining experiences",
      "Spa treatments for couples",
      "Private tours and guides",
    ],
  },
  {
    id: "couple-3",
    title: "Temple & Tradition",
    destination: "Aswan",
    duration: "4 Days / 3 Nights",
    travelers: "2 Adults",
    image: abuSimbel,
    price: "$1,299",
    itinerary: [
      { day: "Day 1", activities: "Aswan arrival, riverside hotel check-in, sunset cocktails" },
      { day: "Day 2", activities: "Abu Simbel temples, romantic lunch overlooking Lake Nasser" },
      { day: "Day 3", activities: "Philae Temple boat trip, Nubian village visit, private dinner" },
      { day: "Day 4", activities: "Botanical gardens stroll, shopping, farewell dinner, departure" },
    ],
    inclusions: [
      "Boutique hotel with river views",
      "All romantic meals and drinks",
      "Private temple tours",
      "Cultural experiences",
      "Transportation in luxury vehicles",
      "Personalized service throughout",
    ],
  },
  {
    id: "couple-4",
    title: "Elegant Nile Escape",
    destination: "Luxor & Aswan",
    duration: "7 Days / 6 Nights",
    travelers: "Couple",
    image: luxuryHotel,
    price: "$2,799",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, luxury hotel suite, couples spa welcome" },
      { day: "Day 2", activities: "Private temple explorations, gourmet dinner" },
      { day: "Day 3", activities: "Hot air balloon at dawn, Valley of the Kings private tour" },
      { day: "Day 4", activities: "5-star Nile cruise embarkation, fine dining onboard" },
      { day: "Day 5", activities: "Cruise sailing with temple stops, sunset drinks on deck" },
      { day: "Day 6", activities: "Aswan arrival, Abu Simbel excursion, farewell gala dinner" },
      { day: "Day 7", activities: "Leisure breakfast, departure with memories" },
    ],
    inclusions: [
      "Luxury hotels and premium Nile cruise suite",
      "All gourmet meals and beverages",
      "Private hot air balloon experience",
      "Exclusive guided tours",
      "Daily spa treatments",
      "VIP transfers and concierge service",
    ],
  },
];

const CouplePackages = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroCouple})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        <div className="container mx-auto relative z-10">
          <Link to="/packages">
            <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Packages
            </Button>
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Romantic Escapes
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Experience the romance of ancient Egypt together. Our couple packages feature
            intimate accommodations, private tours, candlelit dinners, and unforgettable
            moments designed just for two.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {couplePackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CouplePackages;
