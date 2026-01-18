import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MapPin, Check, ArrowLeft, Clock, ShieldCheck, Star, Info } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import ChatButton from "@/components/ChatButton";
import { authHelpers } from "@/services/api";

const PackageDetails = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // The data can be a Package or a Booking (Trip)
    const rawData = state?.packageData || null;

    const pkg = useMemo(() => {
        if (!rawData) return null;

        // Check if it's a Booking (Trip) from Profile
        if (rawData.place || rawData.bookingType || rawData.status) {
            // If it's a booking, it might have nested packageDetails
            if (rawData.packageDetails) {
                return {
                    ...rawData.packageDetails,
                    isBooking: true,
                    bookingStatus: rawData.status,
                    bookingId: rawData._id,
                    totalPrice: rawData.totalPrice,
                    ownerId: typeof rawData.place?.createdBy === 'object'
                        ? (rawData.place.createdBy._id || rawData.place.createdBy.id)
                        : rawData.place?.createdBy
                };
            }

            // Otherwise, construct a package view from the booking/place data
            return {
                id: rawData._id,
                title: rawData.place?.name || "Booking Details",
                destination: rawData.destination || rawData.place?.address || "Location N/A",
                duration: rawData.duration ? `${rawData.duration} Days` : (rawData.arrivalDate ? "Duration N/A" : ""),
                travelers: rawData.memberNumber ? `${rawData.memberNumber} ${rawData.place?.type === 'restaurant' ? 'Guests' : 'Travelers'}` : "",
                image: rawData.image || "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop",
                price: rawData.totalPrice ? `$${rawData.totalPrice}` : "",
                itinerary: [], // No itinerary for non-package bookings
                inclusions: [
                    rawData.place?.type ? `Type: ${rawData.place.type.replace('_', ' ')}` : null,
                    rawData.arrivalDate ? `Check-in: ${new Date(rawData.arrivalDate).toLocaleDateString()}` : null,
                    rawData.bookingTime ? `Time: ${rawData.bookingTime}` : null,
                ].filter(Boolean),
                isBooking: true,
                bookingStatus: rawData.status,
                bookingId: rawData._id
            };
        }

        // It's a standard Package from category pages
        return {
            ...rawData,
            isBooking: false,
            // For standard packages, we might want a default owner (Admin)
            // If rawData has it, use it
            ownerId: rawData.ownerId || rawData.createdBy
        };
    }, [rawData]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id, pkg]);

    const handleBookNow = () => {
        if (pkg?.isBooking) return;
        navigate("/payment/fake-booking", {
            state: {
                packageData: pkg,
                fromPackage: true
            }
        });
    };

    if (!pkg) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-4">Package/Booking Not Found</h2>
                <Button onClick={() => navigate("/packages")}>Back to Packages</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute inset-0 bg-black/30" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="container mx-auto">
                        <Button
                            variant="ghost"
                            className="mb-6 text-white hover:bg-white/10"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-secondary text-foreground px-3 py-1 text-sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                {pkg.destination}
                            </Badge>
                            {pkg.isBooking && (
                                <Badge className={`px-3 py-1 text-sm capitalize ${pkg.bookingStatus === 'confirmed' ? 'bg-green-500' :
                                    pkg.bookingStatus === 'pending' ? 'bg-amber-500' : 'bg-gray-500'
                                    } text-white`}>
                                    {pkg.bookingStatus}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                            {pkg.title}
                        </h1>

                        <div className="flex flex-wrap gap-6 text-white/90">
                            {pkg.duration && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-secondary" />
                                    <span className="font-medium">{pkg.duration}</span>
                                </div>
                            )}
                            {pkg.travelers && (
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-secondary" />
                                    <span className="font-medium">{pkg.travelers}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-secondary" />
                                <span className="font-medium">{pkg.isBooking ? "Verified Booking" : "Secure Booking"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-12 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-0 shadow-luxury overflow-hidden">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-bold mb-6 text-primary border-b pb-4">
                                    {pkg.isBooking ? "Booking Overview" : "Trip Overview"}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">
                                    {pkg.isBooking
                                        ? `This is a summary of your experience in ${pkg.destination}. All your reservations details are secured and managed by Golden Nile.`
                                        : `Embark on an unforgettable journey through ${pkg.destination}. This carefully curated experience offers the perfect blend of adventure, culture, and relaxation.`
                                    }
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                    <div className="bg-muted/30 p-4 rounded-xl text-center">
                                        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Rating</p>
                                        <p className="font-bold">4.9/5</p>
                                    </div>
                                    {pkg.duration && (
                                        <div className="bg-muted/30 p-4 rounded-xl text-center">
                                            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Duration</p>
                                            <p className="font-bold">{pkg.duration.split(' ')[0]} Days</p>
                                        </div>
                                    )}
                                    {pkg.travelers && (
                                        <div className="bg-muted/30 p-4 rounded-xl text-center">
                                            <Users className="w-6 h-6 text-secondary mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground uppercase font-bold">Group Size</p>
                                            <p className="font-bold">{pkg.travelers.split(' ')[0]}</p>
                                        </div>
                                    )}
                                    <div className="bg-muted/30 p-4 rounded-xl text-center">
                                        <ShieldCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground uppercase font-bold">Status</p>
                                        <p className="font-bold">{pkg.isBooking ? "Reserved" : "Available"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {pkg.itinerary && pkg.itinerary.length > 0 && (
                            <section>
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="bg-primary w-2 h-8 rounded-full"></span>
                                    Day-by-Day Itinerary
                                </h3>
                                <div className="space-y-6">
                                    {pkg.itinerary.map((item: any, idx: number) => (
                                        <div key={idx} className="relative pl-10 pb-6 border-l-2 border-primary/20 last:pb-0">
                                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-smooth">
                                                <span className="text-primary font-bold text-sm uppercase tracking-wider mb-1 block">
                                                    {item.day}
                                                </span>
                                                <h4 className="text-xl font-bold mb-2">Daily Adventures</h4>
                                                <p className="text-muted-foreground">{item.activities}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {pkg.isBooking && !pkg.itinerary?.length && (
                            <Card className="border-0 shadow-sm bg-primary/5">
                                <CardContent className="p-6 flex gap-4 items-center">
                                    <Info className="w-8 h-8 text-primary" />
                                    <div>
                                        <h4 className="font-bold">Reservation Note</h4>
                                        <p className="text-sm text-muted-foreground">
                                            This booking does not include a fixed itinerary. Please check your contact email for specific arrangements or visit our office.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card className="border-2 border-primary/10 shadow-luxury overflow-hidden">
                                <div className="bg-primary p-6 text-white text-center">
                                    <p className="text-sm opacity-80 uppercase font-bold tracking-widest mb-1">
                                        {pkg.isBooking ? "Total Amount" : "Starting from"}
                                    </p>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-4xl font-extrabold">{pkg.price}</span>
                                        <span className="text-sm opacity-80">{pkg.isBooking ? "" : "/ person"}</span>
                                    </div>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <h4 className="font-bold mb-4 text-lg">
                                            {pkg.isBooking ? "Booking Summary" : "What's Included"}
                                        </h4>
                                        <ul className="space-y-3">
                                            {pkg.inclusions.map((item: string, idx: number) => (
                                                <li key={idx} className="flex gap-3 items-start">
                                                    <div className="bg-green-100 p-1 rounded-full mt-0.5">
                                                        <Check className="w-3 h-3 text-green-600" />
                                                    </div>
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {!pkg.isBooking ? (
                                        <RequireAuth>
                                            <Button
                                                className="w-full h-14 text-lg font-bold rounded-xl"
                                                onClick={handleBookNow}
                                            >
                                                Book Your Experience
                                            </Button>
                                        </RequireAuth>
                                    ) : (
                                        <Badge className="w-full h-12 flex items-center justify-center text-lg bg-primary/10 text-primary border-primary rounded-xl">
                                            Already Booked
                                        </Badge>
                                    )}

                                    {pkg.ownerId && pkg.ownerId !== authHelpers.getCurrentUserId() && (
                                        <ChatButton
                                            ownerId={pkg.ownerId}
                                            propertyTitle={pkg.title}
                                            className="w-full h-12 text-md font-bold rounded-xl"
                                        />
                                    )}

                                    <p className="text-xs text-center text-muted-foreground">
                                        {pkg.isBooking ? `Booking ID: ${pkg.bookingId}` : "* Prices may vary based on group size and season"}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-muted/30 border-0">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="bg-white p-3 rounded-full shadow-sm">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Peace of Mind</p>
                                        <p className="text-xs text-muted-foreground">Flexible cancellation & 24/7 support</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PackageDetails;
