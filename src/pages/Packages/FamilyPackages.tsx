import { PackageCard, Package } from "@/components/PackageCard";
import luxorTemple from "@/assets/luxor-temple.jpg";
import nileCruise from "@/assets/nile cruise.jpg";
import valleyOfKings from "@/assets/valley-of-kings.jpg";
import luxuryHotel from "@/assets/hotel.jpg";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroFamily from "@/assets/hero-family.jpg";

const familyPackages: Package[] = [
  {
    id: "family-1",
    title: "Family Discovery Tour",
    destination: "Luxor & Aswan",
    duration: "6 Days / 5 Nights",
    travelers: "2 Adults + 2 Children",
    image: luxorTemple,
    price: "$2,199",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, family-friendly hotel check-in, welcome dinner" },
      { day: "Day 2", activities: "Karnak Temple with kid-friendly guide, interactive hieroglyphics workshop" },
      { day: "Day 3", activities: "Valley of the Kings treasure hunt, hot air balloon ride" },
      { day: "Day 4", activities: "Nile cruise to Aswan, family activities onboard, swimming pool" },
      { day: "Day 5", activities: "Abu Simbel visit, Nubian village cultural experience" },
      { day: "Day 6", activities: "Aswan botanical garden, departure" },
    ],
    inclusions: [
      "Family suites in 5-star hotels",
      "All meals with children's menu options",
      "Kid-friendly Egyptologist guides",
      "Interactive educational activities for children",
      "Family-sized transportation vehicles",
      "Complimentary bottled water and snacks",
    ],
  },
  {
    id: "family-2",
    title: "Nile Family Cruise",
    destination: "Luxor & Aswan",
    duration: "7 Days / 6 Nights",
    travelers: "Family of 4-6",
    image: nileCruise,
    price: "$2,899",
    itinerary: [
      { day: "Day 1", activities: "Luxor embarkation, cruise orientation, family welcome party" },
      { day: "Day 2", activities: "Temple tours with engaging storytelling, onboard pool time" },
      { day: "Day 3", activities: "Edfu Temple horse carriage ride, kids' activities program" },
      { day: "Day 4", activities: "Kom Ombo Temple, crocodile museum visit" },
      { day: "Day 5", activities: "Aswan arrival, family felucca sailing, island picnic" },
      { day: "Day 6", activities: "Abu Simbel day trip, relaxation onboard" },
      { day: "Day 7", activities: "Disembarkation, souvenir shopping, departure" },
    ],
    inclusions: [
      "Luxury Nile cruise with connecting family cabins",
      "Full board with kid-friendly dining",
      "Children's entertainment program",
      "Family shore excursions",
      "Pool and sun deck access",
      "Educational pharaoh costume experience",
    ],
  },
  {
    id: "family-3",
    title: "Educational Heritage Tour",
    destination: "Luxor",
    duration: "5 Days / 4 Nights",
    travelers: "Families with teens",
    image: valleyOfKings,
    price: "$1,799",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, hotel check-in, Egyptian museum visit" },
      { day: "Day 2", activities: "Karnak Temple complex with archaeological explanations" },
      { day: "Day 3", activities: "Valley of the Kings, Hatshepsut Temple, tombs exploration" },
      { day: "Day 4", activities: "Luxor Temple at night, light & sound show, traditional dinner" },
      { day: "Day 5", activities: "Papyrus and alabaster workshops, market visit, departure" },
    ],
    inclusions: [
      "Comfortable hotel with family rooms",
      "Daily breakfast and selected dinners",
      "Educational guided tours",
      "Hands-on craft workshops",
      "Museum entrance fees",
      "All transportation and transfers",
    ],
  },
  {
    id: "family-4",
    title: "Comfort Family Escape",
    destination: "Aswan",
    duration: "5 Days / 4 Nights",
    travelers: "Family of 4",
    image: luxuryHotel,
    price: "$1,999",
    itinerary: [
      { day: "Day 1", activities: "Aswan arrival, resort check-in, pool relaxation" },
      { day: "Day 2", activities: "Abu Simbel excursion with family guide" },
      { day: "Day 3", activities: "Philae Temple boat trip, botanical gardens visit" },
      { day: "Day 4", activities: "Nubian village experience, henna painting, local cuisine tasting" },
      { day: "Day 5", activities: "Hotel leisure time, shopping, departure" },
    ],
    inclusions: [
      "Family resort with kids' club and pool",
      "All-inclusive meal plan",
      "Cultural activities for all ages",
      "Boat trips and temple visits",
      "Children's entertainment facilities",
      "Babysitting services available",
    ],
  },
];

const FamilyPackages = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroFamily})` }}
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
            Family Adventures
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Create magical family memories exploring ancient Egypt together. Our family-friendly
            packages feature kid-approved activities, educational experiences, and comfortable
            accommodations perfect for all ages.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {familyPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FamilyPackages;
