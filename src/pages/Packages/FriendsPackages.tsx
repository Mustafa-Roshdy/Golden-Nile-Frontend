import { PackageCard, Package } from "@/components/PackageCard";
import luxorTemple from "@/assets/luxor-temple.jpg";
import nileCruise from "@/assets/nile.jpg";
import desertSafari from "@/assets/desert-safari.jpg";
import abuSimbel from "@/assets/abu-simbel.jpg";
import heroFriends from "@/assets/hero-friends.jpg";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const friendsPackages: Package[] = [
  {
    id: "friends-1",
    title: "Ancient Wonders Adventure",
    destination: "Luxor & Aswan",
    duration: "5 Days / 4 Nights",
    travelers: "4-8 Friends",
    image: luxorTemple,
    price: "$899",
    itinerary: [
      { day: "Day 1", activities: "Arrival in Luxor, check-in at hotel, evening Nile dinner cruise" },
      { day: "Day 2", activities: "Karnak Temple & Luxor Temple exploration, Valley of the Kings tour" },
      { day: "Day 3", activities: "Travel to Aswan, Philae Temple visit, evening at Nubian village" },
      { day: "Day 4", activities: "Abu Simbel temples day trip, Nile felucca sailing at sunset" },
      { day: "Day 5", activities: "Aswan High Dam, departure" },
    ],
    inclusions: [
      "Airport transfers and transportation in luxury AC vehicles",
      "4-star hotel accommodation with breakfast",
      "All temple entrance fees and guided tours",
      "Nile dinner cruise with entertainment",
      "Professional English-speaking Egyptologist guide",
      "Nubian village cultural experience",
    ],
  },
  {
    id: "friends-2",
    title: "Nile Cruise & Desert Safari",
    destination: "Luxor & Aswan",
    duration: "6 Days / 5 Nights",
    travelers: "6-10 Friends",
    image: nileCruise,
    price: "$1,299",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, luxury Nile cruise check-in, welcome dinner onboard" },
      { day: "Day 2", activities: "Cruise sailing with temple visits, poolside relaxation" },
      { day: "Day 3", activities: "Edfu and Kom Ombo temples, evening entertainment onboard" },
      { day: "Day 4", activities: "Aswan arrival, Abu Simbel excursion" },
      { day: "Day 5", activities: "Desert safari adventure, quad biking, Bedouin camp dinner" },
      { day: "Day 6", activities: "Morning at leisure, departure" },
    ],
    inclusions: [
      "5-star Nile cruise with full board (all meals)",
      "Private desert safari with 4x4 vehicles",
      "Quad biking experience in the Sahara",
      "All temple visits with expert guides",
      "Evening entertainment and shows onboard",
      "Airport and pier transfers",
    ],
  },
  {
    id: "friends-3",
    title: "Temple Explorer's Journey",
    destination: "Luxor",
    duration: "4 Days / 3 Nights",
    travelers: "4-6 Friends",
    image: abuSimbel,
    price: "$699",
    itinerary: [
      { day: "Day 1", activities: "Luxor arrival, hotel check-in, evening market visit" },
      { day: "Day 2", activities: "Full day East Bank temples - Karnak & Luxor Temple" },
      { day: "Day 3", activities: "West Bank exploration - Valley of the Kings, Hatshepsut Temple, Colossi of Memnon" },
      { day: "Day 4", activities: "Hot air balloon ride over Luxor (optional), departure" },
    ],
    inclusions: [
      "Boutique hotel accommodation with rooftop views",
      "Daily breakfast and one traditional dinner",
      "All temple entrance tickets",
      "Expert archaeological guide",
      "Transportation in modern air-conditioned vehicles",
      "Traditional Egyptian market tour",
    ],
  },
  {
    id: "friends-4",
    title: "Adventure & Culture Mix",
    destination: "Aswan",
    duration: "4 Days / 3 Nights",
    travelers: "5-8 Friends",
    image: desertSafari,
    price: "$799",
    itinerary: [
      { day: "Day 1", activities: "Aswan arrival, hotel check-in, sunset felucca ride" },
      { day: "Day 2", activities: "Abu Simbel temples, Nubian museum visit" },
      { day: "Day 3", activities: "Desert safari with camel riding, stargazing experience, Bedouin dinner" },
      { day: "Day 4", activities: "Philae Temple visit, souvenir shopping, departure" },
    ],
    inclusions: [
      "Comfortable hotel with Nile views",
      "All meals included",
      "Private felucca sailing experience",
      "Desert safari with camel rides",
      "Stargazing session with astronomy guide",
      "Cultural Nubian dinner and entertainment",
    ],
  },
];

const FriendsPackages = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroFriends})` }}
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
            Friends Adventures
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Create unforgettable memories with your friends exploring Egypt's ancient wonders,
            cruising the Nile, and experiencing thrilling desert safaris together.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {friendsPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FriendsPackages;
