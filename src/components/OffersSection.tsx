import { Percent, Users, Ship, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import RequireAuth from "@/components/RequireAuth";

const offers = [
  {
    icon: Percent,
    title: "Early Bird Special",
    discount: "25% OFF",
    description: "Book 3 months in advance and save big on all packages",
    validUntil: "Valid until Dec 2025",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Group Discount",
    discount: "30% OFF",
    description: "Groups of 6+ travelers get exclusive pricing",
    validUntil: "Year-round offer",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Ship,
    title: "Cruise Package",
    discount: "Save $500",
    description: "4-night Nile cruise with hotel stays included",
    validUntil: "Limited availability",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Sparkles,
    title: "Honeymoon Deal",
    discount: "Up to 40% OFF",
    description: "Romance package with premium upgrades",
    validUntil: "Book by March 2026",
    color: "from-green-500 to-teal-500",
  },
];

const OffersSection = () => {
  return (
    <section id="offers" className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Special <span className="text-primary">Travel Offers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exclusive deals and packages to make your Egyptian adventure more affordable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer, index) => (
            <Card
              key={index}
              className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 animate-slide-up border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${offer.color}`} />
              <CardContent className="p-6 pt-8">
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${offer.color} mb-4`}>
                  <offer.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                <div className={`text-3xl font-black mb-3 bg-gradient-to-r ${offer.color} bg-clip-text text-transparent`}>
                  {offer.discount}
                </div>
                <p className="text-muted-foreground mb-4">
                  {offer.description}
                </p>
                <p className="text-sm text-muted-foreground/70 mb-4">
                  {offer.validUntil}
                </p>
                <RequireAuth>
                  <Button className="w-full">
                    Get Offer
                  </Button>
                </RequireAuth>
              </CardContent>
            </Card>
          ))}
        </div>
        
      </div>
          <div className="text-center mt-10">
          <RequireAuth>
            <Button variant="outline" size="lg">
              See More
            </Button>
          </RequireAuth>
        </div>
  
    </section>
  );
};

export default OffersSection;
