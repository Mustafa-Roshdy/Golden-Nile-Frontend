import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Baby, PartyPopper } from "lucide-react";
import luxorTemple from "@/assets/luxor-temple.jpg";
import nileCruise from "@/assets/nile cruise.jpg";
import heroPackages from "@/assets/hero-packages.jpg";
import Friends from "@/assets/friends.jpg";
import Family from "@/assets/family.jpg";
import Couple from "@/assets/couple.jpg";
import heroHoneymoon from "@/assets/hero-honeymoon.jpg";
const packageCategories = [
  {
    id: "friends",
    title: "Friends Adventures",
    description: "Explore ancient Egypt with your best friends. Adventure, culture, and unforgettable experiences await.",
    icon: PartyPopper,
    path: "/packages/friends",
    image: Friends,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "family",
    title: "Family Journeys",
    description: "Create magical memories with your loved ones. Kid-friendly tours and comfortable accommodations.",
    icon: Baby,
    path: "/packages/family",
    image: Family,
    color: "from-green-500 to-green-600",
  },
  {
    id: "couples",
    title: "Romantic Escapes",
    description: "Intimate experiences designed for two. Private tours, candlelit dinners, and magical moments.",
    icon: Users,
    path: "/packages/couples",
    image: Couple,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "honeymoon",
    title: "Honeymoon Dreams",
    description: "Begin your forever in paradise. Luxury suites, spa treatments, and exclusive experiences.",
    icon: Heart,
    path: "/packages/honeymoon",
    image: heroHoneymoon,
    color: "from-pink-500 to-rose-600",
  },
];

const Packages = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative py-24 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroPackages})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Discover Your Perfect Journey
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Explore Luxor & Aswan with tailored packages designed for every type of traveler.
            From family adventures to romantic honeymoons, your Egyptian dream awaits.
          </p>
        </div>
      </section>

      {/* Package Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {packageCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className="overflow-hidden group hover:shadow-luxury transition-smooth cursor-pointer"
                >
                  <Link to={category.path}>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-3 rounded-full bg-gradient-to-br ${category.color}`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-6 text-lg">
                        {category.description}
                      </p>
                      <Button className="w-full" size="lg">
                        View Packages
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="gradient-warm py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Need Help Choosing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our travel experts are here to help you find the perfect package for your needs.
            Contact us for personalized recommendations.
          </p>

        </div>
      </section>
    </div>
  );
};

export default Packages;
