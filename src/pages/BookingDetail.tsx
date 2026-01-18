import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import CategoryTiles from "@/components/CategoryTiles";
import ChatButton from "@/components/ChatButton";
import UserAvatar from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Star, Heart, Share2, ChevronLeft, ChevronRight, Grid3x3,
  Users, Home, Bed, Bath, Wifi, Car, Tv, AirVent, Waves,
  Shield, Clock, X, MapPin, Medal, Languages, CheckCircle2, XCircle,
  ThumbsUp, ThumbsDown, Send
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { format, isBefore, isEqual, startOfDay } from "date-fns";
import { placeApi, bookingApi, Place } from "@/services/api";
import { authHelpers } from "@/services/api";
import api from "@/interceptor/api";

interface PropertyData {
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
  rating: number;
  reviews: number;
  images: string[];
  isGuestFavorite: boolean;
  description: string;
  highlights: string[];
  amenities: { icon: any; name: string }[];
  host: {
    id: string;
    name: string;
    avatar: string;
    superhost: boolean;
    reviewsCount: number;
    yearsHosting: number;
    responseTime: string;
    responseRate: string;
    languages: string[];
  };
  houseRules: string[];
  latitude?: number;
  longitude?: number;
  likes: string[];
  dislikes: string[];
  isAvailable: boolean;
  governorate: string;
}

interface ReviewData {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
}

const BookingDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchState = location.state as {
    checkIn?: Date;
    checkOut?: Date;
    adults?: number;
    children?: number;
    selectedGovernorate?: string;
  } | null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | undefined>(searchState?.checkIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(searchState?.checkOut);
  const [guests, setGuests] = useState(1);
  const [tables, setTables] = useState(1);
  const [reservationDate, setReservationDate] = useState<Date | undefined>(
    searchState?.checkIn // For restaurants, use check-in date as reservation date
  );
  const [reservationTime, setReservationTime] = useState("");

  // New guest house fields
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [adults, setAdults] = useState(searchState?.adults || 1);
  const [children, setChildren] = useState(searchState?.children || 0);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [liking, setLiking] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: ""
  });

  const currentUserId = authHelpers.getCurrentUserId();
  const currentUserRole = authHelpers.getCurrentUserRole();
  const isLoggedIn = !!currentUserId;

  const showAlert = (title: string, message: string) => {
    setAlertModal({ open: true, title, message });
  };

  useEffect(() => {
    const fetchPlaceAndReviews = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const resolvePlace = async (targetId: string) => {
          try {
            const placeResponse = await placeApi.getPlace(targetId);
            return { place: placeResponse.data as Place, booking: null, placeId: targetId };
          } catch (initialError) {
            console.warn("Place lookup failed, attempting booking fallback", initialError);
            try {
              const bookingResponse = await bookingApi.getBooking(targetId);
              const bookingPayload = (bookingResponse as any)?.data ?? (bookingResponse as any)?.booking ?? null;
              if (!bookingPayload?.place?._id) {
                throw new Error("Booking found but missing place information");
              }
              const placeResponse = await placeApi.getPlace(bookingPayload.place._id);
              return { place: placeResponse.data as Place, booking: bookingPayload, placeId: bookingPayload.place._id };
            } catch (bookingError) {
              console.error("Unable to resolve booking data", bookingError);
              throw new Error(bookingError?.message || initialError?.message || "Failed to load booking details");
            }
          }
        };

        const { place, placeId } = await resolvePlace(id);

        const resolveHost = (createdBy: any) => {
          const fallbackName = "Host";
          const fallback = {
            id: "",
            name: fallbackName,
            avatar: "/placeholder.svg",
          };

          if (!createdBy) return fallback;

          if (typeof createdBy === "string") {
            return { ...fallback, id: createdBy };
          }

          const derivedName =
            createdBy.name ||
            [createdBy.firstName, createdBy.lastName].filter(Boolean).join(" ") ||
            fallbackName;

          const photoPath = createdBy.photo ? (createdBy.photo.startsWith('http') ? createdBy.photo : `${api.defaults.baseURL}${createdBy.photo}`) : fallback.avatar;

          return {
            id: createdBy._id || createdBy.id || fallback.id,
            name: derivedName,
            avatar: photoPath || fallback.avatar,
          };
        };

        const hostDetails = resolveHost(place.createdBy);

        // Fetch reviews separately
        const reviewsResponse = await placeApi.getReviews(placeId);
        const reviewsData = reviewsResponse as { success: boolean; count: number; data: any[] };

        // Map to PropertyData
        const mappedProperty: PropertyData = {
          id: place._id,
          title: place.name,
          location: place.address,
          type: `Entire ${place.type?.replace('_', ' ') || "place"} hosted by ${hostDetails.name}`,
          placeType: place.type,
          guests: place.rooms ? place.rooms * 2 : 2,
          bedrooms: place.rooms || 1,
          beds: place.rooms ? place.rooms * 2 : 2,
          baths: place.rooms || 1,
          price: place.pricePerNight || place.pricePerTable || 0,
          rating: place.rating || 0,
          reviews: reviewsData.count || 0,
          images: Array.isArray(place.images) && place.images.length > 0 ? place.images : ["/placeholder.svg"],
          isGuestFavorite: (place.rating || 0) > 4.5,
          description: place.description || "No description available.",
          highlights: [
            "Great check-in experience",
            "Sparkling clean",
            "Highly rated host",
          ],
          amenities: [
            ...(place.wifi ? [{ icon: Wifi, name: "Wifi" }] : []),
            ...(place.airConditioning ? [{ icon: AirVent, name: "Air conditioning" }] : []),
            ...(place.breakfast ? [{ icon: Home, name: "Breakfast included" }] : []),
          ],
          host: {
            id: hostDetails.id,
            name: hostDetails.name,
            avatar: hostDetails.avatar,
            superhost: false, // Assuming not
            reviewsCount: 0, // Need to calculate or fetch
            yearsHosting: 1, // Assuming
            responseTime: "within an hour",
            responseRate: "100%",
            languages: ["English", "Arabic"],
          },
          houseRules: [
            `Check-in: 2:00 PM – 11:00 PM`,
            `Checkout before 11:00 AM`,
            `${place.rooms ? place.rooms * 2 : 2} guests maximum`,
          ],
          latitude: place.latitude,
          longitude: place.longitude,
          likes: place.likes,
          dislikes: place.dislikes,
          isAvailable: place.isAvailable,
          governorate: place.governorate,
        };

        // Map reviews
        const mappedReviews: ReviewData[] = reviewsData.data.map((review: any, index: number) => ({
          id: review._id,
          author: review.user.firstName + " " + review.user.lastName,
          avatar: (review.user.photo && review.user.photo.startsWith('http')) ? review.user.photo : `${api.defaults.baseURL}${review.user.photo || ""}` || "/placeholder.svg",
          date: format(new Date(review.createdAt), "MMMM yyyy"),
          rating: 5, // Assuming all reviews are 5 stars or calculate
          text: review.message,
        }));

        setProperty(mappedProperty);
        setReviews(mappedReviews);
      } catch (err: any) {
        const message = err?.message || "Failed to load booking details";
        setError(message);
        console.error("Booking detail load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceAndReviews();
  }, [id]);

  const handleLike = async () => {
    if (!isLoggedIn || !property || liking) return;
    try {
      setLiking(true);
      const response = await placeApi.likePlace(property.id);
      // Update the property with new data
      const updatedPlace: Place = response.data;
      // Update property
      const updatedProperty: PropertyData = {
        ...property,
        rating: updatedPlace.rating,
        likes: updatedPlace.likes,
        dislikes: updatedPlace.dislikes,
      };
      setProperty(updatedProperty);
    } catch (err) {
      console.error("Failed to like place", err);
    } finally {
      setLiking(false);
    }
  };

  const handleDislike = async () => {
    if (!isLoggedIn || !property || liking) return;
    try {
      setLiking(true);
      const response = await placeApi.dislikePlace(property.id);
      const updatedPlace: Place = response.data;
      const updatedProperty: PropertyData = {
        ...property,
        rating: updatedPlace.rating,
        likes: updatedPlace.likes,
        dislikes: updatedPlace.dislikes,
      };
      setProperty(updatedProperty);
    } catch (err) {
      console.error("Failed to dislike place", err);
    } finally {
      setLiking(false);
    }
  };

  const handleAddReview = async () => {
    if (!isLoggedIn || !property || !newComment.trim() || submittingReview) return;
    try {
      setSubmittingReview(true);
      await placeApi.addReview(property.id, newComment.trim());

      // Refresh reviews list
      const reviewsResponse = await placeApi.getReviews(property.id);
      const reviewsData = reviewsResponse as { success: boolean; count: number; data: any[] };

      // Update property review count
      const updatedProperty: PropertyData = {
        ...property,
        reviews: reviewsData.count || 0,
      };
      setProperty(updatedProperty);

      // Update reviews list
      const updatedReviews: ReviewData[] = reviewsData.data.map((review: any) => ({
        id: review._id,
        author: review.user.firstName + " " + review.user.lastName,
        avatar: review.user.photo || "/placeholder.svg",
        date: format(new Date(review.createdAt), "MMMM yyyy"),
        rating: 5,
        text: review.message,
      }));
      setReviews(updatedReviews);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const userHasLiked = property && currentUserId && property.likes?.includes(currentUserId);
  const userHasDisliked = property && currentUserId && property.dislikes?.includes(currentUserId);

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!property) return 0;

    if (property.placeType === "guest_house") {
      if (!checkIn || !checkOut) return 0;
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return nights * property.price * numberOfRooms;
    } else {
      // Restaurant
      return tables * property.price;
    }
  };

  const totalPrice = calculateTotalPrice();
  const guesthouseName =
    property?.placeType === "guest_house" ? property?.title : "No guesthouse selected";
  const restaurantName =
    property?.placeType === "restaurant" ? property?.title : "No restaurant selected";
  const ownerName = property?.host?.name ?? "Owner not specified";

  // Format time for display (convert 24h to 12h format)
  const formatTimeForDisplay = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleReserve = () => {
    if (!isLoggedIn) {
      showAlert("Login Required", "Please login to make a reservation");
      return;
    }

    // Validate required fields before showing confirmation
    if (property?.placeType === "guest_house") {
      if (!checkIn || !checkOut) {
        showAlert("Missing Dates", "Please select check-in and check-out dates");
        return;
      }
      if (checkIn >= checkOut) {
        showAlert("Invalid Dates", "Check-out date must be after check-in date");
        return;
      }
      if (adults < 1) {
        showAlert("Invalid Guests", "At least 1 adult is required");
        return;
      }
    } else {
      // Restaurant validation
      if (!reservationDate) {
        showAlert("Missing Date", "Please select a reservation date");
        return;
      }
      if (!reservationTime) {
        showAlert("Missing Time", "Please select a reservation time");
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const handleConfirmBookingModal = () => {
    setShowConfirmModal(false);
    handleConfirmBooking();
  };

  const handleConfirmBooking = async () => {
    if (!property || !isLoggedIn) return;

    try {
      setBookingLoading(true);

      let bookingData: any = {
        place: property.id,
        bookingType: property.placeType,
        governorate: property.governorate,
      };

      if (property.placeType === "guest_house") {
        bookingData.arrivalDate = checkIn?.toISOString();
        bookingData.leavingDate = checkOut?.toISOString();
        bookingData.numberOfRooms = numberOfRooms;
        bookingData.guestTypes = {
          adults: adults,
          children: children
        };
        bookingData.memberNumber = adults + children; // Total guests
        bookingData.roomNumber = 1; // Default room number
        bookingData.totalPrice = totalPrice;
      } else {
        // For restaurants
        bookingData.bookingDay = reservationDate?.toISOString();
        bookingData.bookingTime = reservationTime;
        bookingData.memberNumber = adults + children;
        bookingData.totalPrice = totalPrice;
      }
   
      const response = await bookingApi.createBooking(bookingData);


      // Reset form
      setCheckIn(undefined);
      setCheckOut(undefined);
      setGuests(1);
      setTables(1);
      setReservationDate(undefined);
      setReservationTime("");
      setNumberOfRooms(1);
      setAdults(1);
      setChildren(0);

      // Show success message
      showAlert("Booking Confirmed", "Your booking has been confirmed successfully!");

      // Navigate to payment page
      if (response && response.data && response.data._id) {
        navigate(`/payment/${response.data._id}`);
      }
    } catch (err) {
      console.error("Failed to create booking", err);
      showAlert("Booking Failed", "Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Loading place details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <p className="text-red-500">{error || "Place not found"}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Image Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="mb-8 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Close photos</span>
            </button>
            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
              {property.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Property ${idx + 1}`}
                  className="w-full rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pt-20">
        {/* Category Tiles */}
        {/* <CategoryTiles /> */}

        {/* Header */}
        <div className="container mx-auto px-4 mb-6 mt-8 animate-fade-in">
          <Link to="/booking" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to search
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">{property.title}</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">{property.rating.toFixed(2)}</span>
              <span className="text-muted-foreground">({property.reviews} reviews)</span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{property.location}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Hosted by {property.host.name}</span>
            {isLoggedIn && (
              <>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={userHasLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    disabled={liking}
                    className="gap-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {property.likes.length}
                  </Button>
                  <Button
                    variant={userHasDisliked ? "default" : "outline"}
                    size="sm"
                    onClick={handleDislike}
                    disabled={liking}
                    className="gap-1"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {property.dislikes.length}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Images Carousel */}
        <div className="container mx-auto px-4 mb-12 animate-slide-up">
          <div className="relative h-[500px] rounded-xl overflow-hidden">
            <img
              src={property.images[currentImageIndex]}
              alt="Property"
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            {property.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {property.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      idx === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Show All Photos Button */}
            <Button
              variant="outline"
              className="absolute bottom-6 right-8 gap-2 bg-white/90 hover:bg-white"
              onClick={() => setShowAllPhotos(true)}
            >
              <Grid3x3 className="w-4 h-4" />
              Show all photos
            </Button>
          </div>

          {/* Thumbnail Strip */}
          {property.images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                    idx === currentImageIndex ? "border-primary" : "border-transparent"
                  )}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 animate-scale-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Info */}
              <div className="pb-8 border-b border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  {property.type}
                </h2>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{property.guests} guests</span>
                  <span>·</span>
                  <span>{property.bedrooms} bedrooms</span>
                  <span>·</span>
                  <span>{property.beds} beds</span>
                  <span>·</span>
                  <span>{property.baths} baths</span>
                </div>
              </div>

              {/* Guest Favorite Badge */}
              {property.isGuestFavorite && (
                <div className="pb-8 border-b border-border">
                  <div className="flex items-start gap-4">
                    <Medal className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Guest favorite</h3>
                      <p className="text-muted-foreground">
                        One of the most loved homes on our platform based on ratings, reviews, and reliability
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div className="pb-8 border-b border-border space-y-6">
                {property.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">{highlight}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="pb-8 border-b border-border">
                <p className="text-foreground leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="pb-8 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, idx) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <Icon className="w-6 h-6 text-foreground" />
                        <span className="text-foreground">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews */}
              <div className="pb-8 border-b border-border">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-6 h-6 fill-current" />
                  <h2 className="text-xl font-semibold text-foreground">
                    {property.rating.toFixed(2)} · {property.reviews} reviews
                  </h2>
                </div>

                {/* Add Review Form */}
                {isLoggedIn && (
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Write a review..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                        rows={3}
                      />
                      <Button
                        onClick={handleAddReview}
                        disabled={!newComment.trim() || submittingReview}
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                      <Card key={review.id} className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <UserAvatar
                              src={review.avatar}
                              name={review.author}
                              alt={review.author}
                              className="w-10 h-10"
                            />
                            <div>
                              <div className="font-semibold text-foreground">{review.author}</div>
                              <div className="text-sm text-muted-foreground">{review.date}</div>
                            </div>
                          </div>
                          <p className="text-foreground text-sm leading-relaxed">{review.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="pb-8 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Where you'll be</h2>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{property.location}</span>
                </div>
                <div className="w-full h-[400px] bg-muted rounded-xl overflow-hidden">
                  {property.latitude && property.longitude ? (
                    <iframe
                      src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted-foreground">Map View</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Host Info */}
              <div className="pb-8 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Meet your host</h2>
                <Card className="border-0 shadow-elevated">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex flex-col items-center text-center">
                        <UserAvatar
                          src={property.host.avatar}
                          name={property.host.name}
                          alt={property.host.name}
                          className="w-24 h-24 mb-4"
                        />
                        <h3 className="text-2xl font-bold text-foreground mb-1">{property.host.name}</h3>
                        {property.host.superhost && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Medal className="w-4 h-4" />
                            <span>Superhost</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-foreground">{property.host.reviewsCount}</div>
                            <div className="text-sm text-muted-foreground">Reviews</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-foreground">{property.rating}</div>
                            <div className="text-sm text-muted-foreground">Rating</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-foreground">{property.host.yearsHosting}</div>
                            <div className="text-sm text-muted-foreground">Years hosting</div>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <span className="text-foreground">Responds {property.host.responseTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                            <span className="text-foreground">{property.host.responseRate} response rate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Languages className="w-5 h-5 text-muted-foreground" />
                            <span className="text-foreground">Speaks {property.host.languages.join(", ")}</span>
                          </div>
                        </div>

                        {/* Role-based Contact Information */}
                        {(currentUserRole === 'admin' || currentUserRole === 'supervisor') && (
                          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Priority Support Contact
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Emergency Support:</span>
                                <span className="text-primary">+20 123 456 7890</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>
                                <span className="text-primary">support@goldennile.com</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Priority Response:</span>
                                <span className="text-green-600">Within 15 minutes</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {(() => {
                          return (
                            <ChatButton
                              ownerId={property.host.id}
                              propertyTitle={property.title}
                              placeType={property.placeType}
                              className="w-full mt-4"
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Things to Know */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Things to know</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">House rules</h3>
                    <ul className="space-y-2">
                      {property.houseRules.map((rule, idx) => (
                        <li key={idx} className="text-foreground text-sm">{rule}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Safety & property</h3>
                    <ul className="space-y-2">
                      <li className="text-foreground text-sm">Carbon monoxide alarm</li>
                      <li className="text-foreground text-sm">Smoke alarm</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Cancellation policy</h3>
                    <p className="text-foreground text-sm">
                      Free cancellation before check-in
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 border-0 shadow-elevated">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold text-foreground">${formatPrice(property.price)}</span>
                    <span className="text-muted-foreground">
                      {property.placeType === "guest_house" ? "night" : "per table"}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guesthouse</p>
                      <p className="text-sm font-semibold text-foreground">{guesthouseName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Owner: {ownerName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Restaurant</p>
                      <p className="text-sm font-semibold text-foreground">{restaurantName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Owner: {ownerName}</p>
                    </div>
                  </div>

                  {property.placeType === "guest_house" ? (
                    // Guest House Booking Form
                    <>
                      <div className="grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden mb-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="bg-card p-4 text-left hover:bg-muted transition-colors">
                              <div className="text-xs font-semibold text-foreground mb-1">CHECK-IN</div>
                              <div className="text-sm text-muted-foreground">
                                {checkIn ? format(checkIn, "MM/dd/yyyy") : "Add date"}
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card" align="start">
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={setCheckIn}
                              initialFocus
                              className="pointer-events-auto"
                              disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                            />
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="bg-card p-4 text-left hover:bg-muted transition-colors">
                              <div className="text-xs font-semibold text-foreground mb-1">CHECKOUT</div>
                              <div className="text-sm text-muted-foreground">
                                {checkOut ? format(checkOut, "MM/dd/yyyy") : "Add date"}
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card" align="start">
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={setCheckOut}
                              initialFocus
                              className="pointer-events-auto"
                              disabled={(date) => {
                                const today = startOfDay(new Date());
                                const checkInDay = checkIn ? startOfDay(checkIn) : null;
                                return isBefore(startOfDay(date), today) ||
                                  (checkInDay && (isBefore(startOfDay(date), checkInDay) || isEqual(startOfDay(date), checkInDay)));
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Number of Rooms */}
                      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl mb-4">
                        <span className="text-foreground">Rooms</span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setNumberOfRooms(Math.max(1, numberOfRooms - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">{numberOfRooms}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setNumberOfRooms(Math.min(10, numberOfRooms + 1))}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Adults */}
                      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl mb-4">
                        <span className="text-foreground">Adults</span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setAdults(Math.min(20, adults + 1))}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl mb-4">
                        <span className="text-foreground">Children</span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-8 w-8"
                            onClick={() => setChildren(Math.min(20, children + 1))}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Restaurant Booking Form
                    <>
                      <div className="space-y-4">
                        {/* Date Input */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full bg-card border border-border p-4 rounded-xl text-left hover:bg-muted transition-colors">
                              <div className="text-sm text-muted-foreground">
                                {reservationDate ? format(reservationDate, "MM/dd/yyyy") : "Select date"}
                              </div>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card" align="start">
                            <Calendar
                              mode="single"
                              selected={reservationDate}
                              onSelect={setReservationDate}
                              initialFocus
                              className="pointer-events-auto"
                              disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                            />
                          </PopoverContent>
                        </Popover>

                        {/* Time Input */}
                        <select
                          value={reservationTime}
                          onChange={(e) => setReservationTime(e.target.value)}
                          className="w-full p-4 border border-border rounded-xl bg-card"
                          required
                        >
                          <option value="">Select time</option>
                          <option value="06:00">6:00 AM</option>
                          <option value="06:30">6:30 AM</option>
                          <option value="07:00">7:00 AM</option>
                          <option value="07:30">7:30 AM</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="08:30">8:30 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="09:30">9:30 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="10:30">10:30 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="11:30">11:30 AM</option>
                          <option value="12:00">12:00 PM (Noon)</option>
                          <option value="12:30">12:30 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="13:30">1:30 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="14:30">2:30 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="15:30">3:30 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="16:30">4:30 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="17:30">5:30 PM</option>
                          <option value="18:00">6:00 PM</option>
                          <option value="18:30">6:30 PM</option>
                          <option value="19:00">7:00 PM</option>
                          <option value="19:30">7:30 PM</option>
                          <option value="20:00">8:00 PM</option>
                          <option value="20:30">8:30 PM</option>
                          <option value="21:00">9:00 PM</option>
                          <option value="21:30">9:30 PM</option>
                          <option value="22:00">10:00 PM</option>
                          <option value="22:30">10:30 PM</option>
                          <option value="23:00">11:00 PM</option>
                          <option value="23:30">11:30 PM</option>
                        </select>

                        {/* Tables Input */}
                        <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl">
                          <span className="text-foreground">Tables</span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full h-8 w-8"
                              onClick={() => setTables(Math.max(1, tables - 1))}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium">{tables}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full h-8 w-8"
                              onClick={() => setTables(Math.min(10, tables + 1))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button
                    className={cn("w-full mb-4 mt-2", !property?.isAvailable && "bg-red-500 hover:bg-red-600 text-white")}
                    size="lg"
                    onClick={handleReserve}
                    disabled={
                      !isLoggedIn ||
                      (property?.placeType === "guest_house" && (!checkIn || !checkOut || adults < 1)) ||
                      (property?.placeType === "restaurant" && (!reservationDate || !reservationTime)) ||
                      !property?.isAvailable
                    }
                  >
                    {!property?.isAvailable ? "Not Available" : (isLoggedIn ? "Reserve" : "Login to Reserve")}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mb-4">
                    You won't be charged yet
                  </p>

                  {totalPrice > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      {property.placeType === "guest_house" ? (
                        <>
                          <div className="flex justify-between text-foreground">
                            <span className="underline">
                              ${property.price} × {checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0} nights
                            </span>
                            <span>${formatPrice(property.price * (checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0))}</span>
                          </div>
                          <div className="flex justify-between text-foreground">
                            <span className="underline">Cleaning fee</span>
                            <span>${formatPrice(50)}</span>
                          </div>
                          <div className="flex justify-between text-foreground">
                            <span className="underline">Service fee</span>
                            <span>${formatPrice(85)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-foreground pt-3 border-t border-border">
                            <span>Total</span>
                            <span>${formatPrice(totalPrice + 50 + 85)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between font-semibold text-foreground pt-3 border-t border-border">
                          <span>Total</span>
                          <span>${formatPrice(totalPrice)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Your Reservation</DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Place Details</h4>
              <p><strong>Place:</strong> {property?.title}</p>
              <p><strong>Location:</strong> {property?.location}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Booking Details</h4>
              {property?.placeType === "guest_house" ? (
                <>
                  <p><strong>Check-in:</strong> {checkIn ? format(checkIn, "MMM dd, yyyy") : "Not selected"}</p>
                  <p><strong>Check-out:</strong> {checkOut ? format(checkOut, "MMM dd, yyyy") : "Not selected"}</p>
                  <p><strong>Rooms:</strong> {numberOfRooms}</p>
                  <p><strong>Adults:</strong> {adults}</p>
                  <p><strong>Children:</strong> {children}</p>
                  <p><strong>Total Guests:</strong> {adults + children}</p>
                </>
              ) : (
                <>
                  <p><strong>Date:</strong> {reservationDate ? format(reservationDate, "MMM dd, yyyy") : "Not selected"}</p>
                  <p><strong>Time:</strong> {reservationTime ? formatTimeForDisplay(reservationTime) : "Not selected"}</p>
                  <p><strong>Tables:</strong> {tables}</p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Total Price</h4>
              <p className="text-lg font-bold">${formatPrice(totalPrice)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBookingModal} disabled={bookingLoading}>
              {bookingLoading ? "Confirming..." : "Confirm Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Modal */}
      <Dialog open={alertModal.open} onOpenChange={() => setAlertModal({ ...alertModal, open: false })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{alertModal.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">{alertModal.message}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setAlertModal({ ...alertModal, open: false })}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default BookingDetail;
