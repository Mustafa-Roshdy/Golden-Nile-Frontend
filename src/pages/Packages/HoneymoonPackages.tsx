import { PackageCard, Package } from "@/components/PackageCard";
import nileCruise from "@/assets/nile.jpg";
import luxuryHotel from "@/assets/hotel2.jpg";
import abuSimbel from "@/assets/abu-simbel.jpg";
import luxorTemple from "@/assets/luxor-temple.jpg";
import heroHoneymoon from "@/assets/hero-honeymoon.jpg";
import { ArrowLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const honeymoonPackages: Package[] = [
  {
    id: "honeymoon-1",
    title: "Ultimate Honeymoon Experience",
    destination: "Luxor & Aswan",
    duration: "8 Days / 7 Nights",
    travelers: "Newlyweds",
    image: nileCruise,
    price: "$3,999",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, presidential suite check-in, champagne welcome, couples massage" },
      { day: "Day 2", activities: "Hot air balloon at sunrise, private temple tours, romantic rooftop dinner" },
      { day: "Day 3", activities: "Valley of the Kings VIP tour, wine tasting, starlit dinner" },
      { day: "Day 4", activities: "Luxury Nile cruise embarkation, honeymoon suite, sunset sailing" },
      { day: "Day 5", activities: "Temple visits with private guide, onboard spa treatments" },
      { day: "Day 6", activities: "Aswan arrival, Abu Simbel helicopter tour, fine dining" },
      { day: "Day 7", activities: "Private island picnic, felucca sunset, gala farewell dinner" },
      { day: "Day 8", activities: "Leisure breakfast, couple photoshoot, departure" },
    ],
    inclusions: [
      "Presidential suites and honeymoon cruise suite",
      "All gourmet meals with wine pairings",
      "Private hot air balloon and helicopter tours",
      "Daily couples spa treatments",
      "Professional honeymoon photoshoot",
      "Romantic turndown service with rose petals",
      "Personal butler service",
      "Complimentary upgrades and amenities",
    ],
  },
  {
    id: "honeymoon-2",
    title: "Eternal Love Journey",
    destination: "Luxor & Aswan",
    duration: "7 Days / 6 Nights",
    travelers: "Honeymooners",
    image: luxuryHotel,
    price: "$3,499",
    itinerary: [
      { day: "Day 1", activities: "Arrival, luxury hotel honeymoon suite, romantic dinner cruise" },
      { day: "Day 2", activities: "Private temple tours, sunset felucca with champagne" },
      { day: "Day 3", activities: "Desert spa experience at luxury resort, couples treatments" },
      { day: "Day 4", activities: "5-star Nile cruise, suite with private balcony, gourmet dining" },
      { day: "Day 5", activities: "Abu Simbel private excursion, onboard romantic dinner" },
      { day: "Day 6", activities: "Nubian village visit, couples cooking class, farewell celebration" },
      { day: "Day 7", activities: "Morning leisure, couples photoshoot, departure" },
    ],
    inclusions: [
      "Luxury honeymoon suites with special amenities",
      "All romantic dining experiences",
      "Desert spa resort day experience",
      "Private guides and VIP treatment",
      "Couples activities and experiences",
      "Professional photography session",
      "Honeymoon gifts and surprises",
      "24/7 concierge service",
    ],
  },
  {
    id: "honeymoon-3",
    title: "Pharaoh's Romance",
    destination: "Luxor",
    duration: "6 Days / 5 Nights",
    travelers: "Just Married",
    image: luxorTemple,
    price: "$2,799",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, boutique hotel suite, welcome spa ritual" },
      { day: "Day 2", activities: "Sunrise hot air balloon, Karnak Temple private tour, rooftop dinner" },
      { day: "Day 3", activities: "Valley of the Kings, Hatshepsut Temple, sunset cocktails" },
      { day: "Day 4", activities: "Couples spa day, poolside relaxation, traditional dinner show" },
      { day: "Day 5", activities: "Luxor Temple at night, felucca sailing, romantic beach dinner" },
      { day: "Day 6", activities: "Leisure morning, souvenir shopping, farewell dinner, departure" },
    ],
    inclusions: [
      "Boutique hotel honeymoon suite",
      "Hot air balloon private flight",
      "Full-day couples spa experience",
      "All romantic meals and surprises",
      "Private temple tours and guides",
      "Sunset sailing and beach dinner",
      "Complimentary room upgrades",
      "Honeymoon amenities package",
    ],
  },
  {
    id: "honeymoon-4",
    title: "Aswan Moonlight Romance",
    destination: "Aswan",
    duration: "5 Days / 4 Nights",
    travelers: "Newlyweds",
    image: abuSimbel,
    price: "$2,299",
    itinerary: [
      { day: "Day 1", activities: "Aswan arrival, riverside suite, sunset dinner on private terrace" },
      { day: "Day 2", activities: "Abu Simbel sunrise tour, romantic lunch by the lake" },
      { day: "Day 3", activities: "Philae Temple boat trip, couples spa treatment, dinner under stars" },
      { day: "Day 4", activities: "Private Nubian village experience, traditional celebration, farewell dinner" },
      { day: "Day 5", activities: "Botanical gardens stroll, couples photoshoot, departure" },
    ],
    inclusions: [
      "Luxury riverside honeymoon suite",
      "All romantic dining with private setups",
      "Sunrise Abu Simbel private tour",
      "Spa treatments for couples",
      "Cultural experiences and entertainment",
      "Professional photography session",
      "Honeymoon celebration surprises",
      "VIP transfers and service",
    ],
  },
];

const HoneymoonPackages = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroHoneymoon})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        <div className="container mx-auto relative z-10">
          <Link to="/packages">
            <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Packages
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Honeymoon Dreams
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Begin your forever journey in the land of ancient romance. Our exclusive honeymoon
            packages feature luxury accommodations, private experiences, spa treatments, and
            unforgettable moments crafted to celebrate your love story.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {honeymoonPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HoneymoonPackages;
