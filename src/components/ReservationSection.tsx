import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Hotel, Ship, Landmark, Map } from "lucide-react";
import hotelImage from "@/assets/hotel3.webp";
import { useNavigate } from "react-router-dom";
import { placeApi, Place, authHelpers } from "@/services/api";
import ChatButton from "@/components/ChatButton";
const ReservationSection = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await placeApi.getAllPlaces();
        setPlaces(response.data);
      } catch (error) {
        console.error('Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'guest_house':
        return Hotel;
      case 'restaurant':
        return Ship;
      default:
        return Landmark;
    }
  };

  const handleSeeMoreClick = () => {
    navigate('/booking');
  };

  const handleBookNowClick = (placeId: string) => {
    navigate(`/booking/${placeId}`);
  }

  const getPriceDisplay = (place: Place) => {
    if (place.type === 'guest_house' && place.pricePerNight) {
      return `From $${place.pricePerNight}/night`;
    }
    if (place.type === 'restaurant' && place.pricePerTable) {
      return `From $${place.pricePerTable}/table`;
    }
    return 'Price on request';
  };

  const reservations = places.slice(0, 4).map((place) => ({
    icon: getIconForType(place.type),
    title: place.name,
    description: place.description || 'Experience the best of Egyptian hospitality',
    image: place.images?.[0] || hotelImage,
    price: getPriceDisplay(place),
    id: place._id,
    ownerId: typeof place.createdBy === 'object' ? (place.createdBy._id || place.createdBy.id) : place.createdBy,
  }));

  if (loading) {
    return (
      <section id="booking" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p>Loading places...</p>
        </div>
      </section>
    );
  }
  return (
    <section id="booking" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Book Your <span className="text-primary">Egyptian Adventure</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our curated selection of accommodations, cruises, and experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reservations.map((item, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-up border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {item.price}
                  </span>

                  <Button onClick={() => handleBookNowClick(item.id)}>Book Now</Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">

          <Button onClick={handleSeeMoreClick} variant="outline" size="lg">See More</Button>

        </div>
      </div>
    </section>
  );
};

export default ReservationSection;