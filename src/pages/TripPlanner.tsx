import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Clock,
  GripVertical,
  Image as ImageIcon,
  Pencil,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useLocation, useNavigate } from "react-router-dom";
import { tripApi, programApi, bookingApi, placeApi, authHelpers } from "@/services/api";
import { useToast } from '@/hooks/use-toast';

interface Activity {
  name: string;
  type: "attraction" | "guest_house" | "place";
  image?: string;
  latitude?: string;
  longitude?: string;
  startTime: string;
  endTime: string;
  id?: string;
}

interface ProgramDay {
  day: number;
  date: string;
  activities: Activity[];
}

interface GeneratedProgram {
  days: Array<{
    date: string;
    schedule: Array<{
      time: string;
      type: "attraction" | "restaurant";
      id: string;
      name: string;
      description: string;
      image: string;
      latitude: string;
      longitude: string;
      price?: number;
    }>;
  }>;
  suggest: {
    guestHouses: Array<{
      id: string;
      name: string;
      price: number;
      latitude: number;
      longitude: number;
      image?: string;
    }>;
  };
}

interface Program {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  text: string;
  image?: string;
  type?: "attraction" | "guest_house" | "restaurant";
  placeId?: string;
  latitude?: string;
  longitude?: string;
}

const TripPlanner = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Load generated program from sessionStorage on mount
  useEffect(() => {
    const savedProgram = sessionStorage.getItem('generatedTripProgram');
    if (savedProgram) {
      try {
        const parsed = JSON.parse(savedProgram);
        setGeneratedProgram(parsed);
      } catch (error) {
        console.error('Failed to parse saved program from sessionStorage:', error);
        sessionStorage.removeItem('generatedTripProgram');
      }
    }
  }, []);
  const interestOptions = [
    "Adventure",
    "Cultural",
    "Education",
    "Relaxation",
    "Food & Cuisine",
    "Photography",
  ];

  const sampleImages: Record<string, string> = {
    "Visit Temple and Local Tour":
      "https://www.youregypttours.com/storage/564/1675519604.jpg",
    "Sunset Nile Cruise and Dinner":
      "https://media.tacdn.com/media/attractions-splice-spp-720x480/13/c5/87/57.jpg",
    "Cultural Museum Exploration":
      "https://betamedia.experienceegypt.eg/media/experienceegypt/img/Original/2025/1/19/2025_1_19_12_6_2_58.jpg",
    "Shopping in Local Markets":
      "https://blog.onevasco.com/wp-content/uploads/hero-image-flea-market-in-egypt.png",
    "Photography and Relaxing Day":
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  };

  const [destination, setDestination] = useState("Aswan");
  const [budget, setBudget] = useState(1000);
  const [checkIn, setCheckIn] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [checkOut, setCheckOut] = useState<string>("");
  const [interests, setInterests] = useState<string[]>(["Cultural"]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dialogImage, setDialogImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);
  const [savedProgramName, setSavedProgramName] = useState<string>("");
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showJson, setShowJson] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>({});
  const { toast } = useToast();

  const todayStr = new Date().toISOString().split("T")[0];

  const toggleInterest = (i: string) => {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const openBookingModal = async (placeId: string, type: 'guest_house' | 'restaurant', date?: string, time?: string, data?: any) => {
    try {
      const placeResponse = await placeApi.getPlace(placeId);
      const place = placeResponse.data;

      setSelectedPlace({ id: placeId, type, ...place });

      const initialData: any = {
        place: placeId,
        bookingType: type,
        governorate: place.governorate,
        memberNumber: adults + children,
      };

      if (type === 'guest_house') {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        initialData.arrivalDate = checkIn;
        initialData.leavingDate = checkOut;
        initialData.numberOfRooms = data?.rooms || 1;
        initialData.totalPrice = (place.pricePerNight || 0) * initialData.numberOfRooms * nights;
      } else if (type === 'restaurant') {
        initialData.bookingDay = date || new Date().toISOString().split('T')[0];
        initialData.bookingTime = time || '19:00';
        initialData.numberOfTables = data?.tables || 1;
        initialData.totalPrice = (place.pricePerTable || 0) * initialData.numberOfTables;
      }

      setBookingData(initialData);
      setShowBookingModal(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load place details' });
    }
  };

  const handleConfirmBooking = async () => {
    try {
      let payload: any = {
        place: bookingData.place,
        bookingType: selectedPlace.type,
        governorate: bookingData.governorate,
        memberNumber: adults + children,
        totalPrice: Number(bookingData.totalPrice),
      };

      if (selectedPlace.type === "guest_house") {
        payload.arrivalDate = new Date(bookingData.arrivalDate).toISOString();
        payload.leavingDate = new Date(bookingData.leavingDate).toISOString();
        payload.numberOfRooms = Number(bookingData.numberOfRooms || 1);
        payload.guestTypes = {
          adults: Number(bookingData.adults || adults),
          children: Number(bookingData.children || children),
        };
        // roomNumber is optional
        payload.roomNumber = Number(bookingData.numberOfRooms || 1);
      } else {
        // Restaurant
        payload.bookingDay = new Date(bookingData.bookingDay).toISOString();
        payload.bookingTime = bookingData.bookingTime; // e.g., "19:00"
      }

      await bookingApi.createBooking(payload);

      toast({
        title: "Booking Successful!",
        description: `Your ${selectedPlace.type === "guest_house" ? "stay" : "table"} has been booked.`,
      });

      // Reset
      setShowBookingModal(false);
      setShowConfirmModal(false);
      setBookingData({});
      setSelectedPlace(null);
    } catch (err: any) {
      console.error("Booking failed:", err.response?.data || err);
      toast({
        title: "Booking Failed",
        description: err.response?.data?.error || "Invalid data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Generate programs using AI API
  const generatePrograms = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    const checkInDateObj = new Date(checkIn);
    const checkOutDateObj = new Date(checkOut);

    if (isNaN(checkInDateObj.getTime()) || isNaN(checkOutDateObj.getTime())) {
      setError("Invalid date format");
      return;
    }

    if (checkOutDateObj <= checkInDateObj) {
      setError("Check-out date must be after check-in date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await tripApi.generateProgram({
        destination: destination.toLowerCase(),
        budget: budget > 0 ? budget : undefined,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        interests: interests.length > 0 ? interests : undefined,
        adults,
        children,
      });

      // The backend returns { success: true, data: GeneratedProgram }
      const apiResult = response as any; // { success: boolean; data: GeneratedProgram }

      // Debug logging

      if (!apiResult || typeof apiResult !== 'object') {
        throw new Error('No response received from server or invalid response format');
      }

      if (apiResult.success !== true) {
        const errorMsg = apiResult.message || apiResult.error || 'Unknown error';
        console.error('Backend returned error:', { fullResponse: apiResult });
        throw new Error(`API request failed: ${errorMsg}`);
      }

      if (!apiResult.data) {
        throw new Error('No data received from API');
      }

      if (!Array.isArray(apiResult.data.days)) {
        throw new Error('Invalid data structure - missing or invalid days array');
      }

      if (!apiResult.data.suggest || !Array.isArray(apiResult.data.suggest.guestHouses)) {
        throw new Error('Invalid data structure - missing guest house suggestions');
      }

      const generated: GeneratedProgram = apiResult.data;

      // Convert API response to Program format for display
      const programsList: Program[] = [];

      generated.days.forEach((day) => {
        day.schedule.forEach((activity, index) => {
          // Parse time range (e.g., "08:00 - 10:00")
          const times = (activity.time || '').split(' - ');
          const startTime = (times[0] || '08:00').trim();
          const endTime = (times[1] || '10:00').trim();

          programsList.push({
            id: `${day.date}-${index}`,
            date: day.date,
            startTime,
            endTime,
            text: activity.name,
            image: activity.image || sampleImages[activity.name] || '',
            type: activity.type,
            placeId: activity.id,
            latitude: activity.latitude,
            longitude: activity.longitude,
          });
        });
      });

      setPrograms(programsList);
      setGeneratedProgram(generated);
      sessionStorage.setItem('generatedTripProgram', JSON.stringify(generated));
    } catch (err: any) {
      console.error("Failed to generate program:", err);
      setError(err.message || "Failed to generate travel program. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop reorder and reschedule automatically
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(programs);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const newList = items.map((p, i) => {
      const newDate = new Date(checkIn);
      newDate.setDate(newDate.getDate() + i);
      const startHour = 8 + (i % 4) * 2;
      return {
        ...p,
        date: newDate.toISOString().split("T")[0],
        startTime: `${String(startHour).padStart(2, "0")}:00`,
        endTime: `${String(startHour + 2).padStart(2, "0")}:00`,
      };
    });

    setPrograms(newList);
  };

  // Handle drag end for generated program - reorder and recalculate times
  const handleGeneratedDragEnd = (result: any) => {
    if (!result.destination || !generatedProgram) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Create a flat array of all activities
    const allActivities = generatedProgram.days.flatMap(day => day.schedule);

    // Reorder the activities
    const [reordered] = allActivities.splice(sourceIndex, 1);
    allActivities.splice(destIndex, 0, reordered);

    // Recalculate times for all activities based on their new positions
    const updatedActivities = allActivities.map((activity, globalIndex) => {
      const startHour = 8 + (globalIndex % 4) * 2; // Start at 8:00, add 2 hours per activity, reset pattern every 4
      return {
        ...activity,
        time: `${String(startHour).padStart(2, "0")}:00 - ${String(startHour + 2).padStart(2, "0")}:00`,
      };
    });

    // Rebuild the program structure by day
    const newDays = JSON.parse(JSON.stringify(generatedProgram.days));
    let activityIndex = 0;

    generatedProgram.days.forEach((originalDay, dayIndex) => {
      const activitiesForDay = [];
      const originalDayActivityCount = originalDay.schedule.length;

      for (let i = 0; i < originalDayActivityCount && activityIndex < updatedActivities.length; i++) {
        activitiesForDay.push(updatedActivities[activityIndex]);
        activityIndex++;
      }

      newDays[dayIndex].schedule = activitiesForDay;
    });

    // Update the generated program state
    setGeneratedProgram({
      ...generatedProgram,
      days: newDays
    });
  };

  // Save program to user's account
  const saveProgram = async () => {
    if (!generatedProgram || !savedProgramName.trim()) {
      alert("Please enter a program name");
      return;
    }

    try {
      setSaving(true);

      // Flatten all activities from the generated program
      const allActivities = generatedProgram.days.flatMap(day =>
        day.schedule.map(activity => ({
          name: activity.name,
          image: activity.image,
          latitude: activity.latitude,
          longitude: activity.longitude,
          startTime: activity.time.split(' - ')[0], // Extract start time from "08:00 - 10:00"
          endTime: activity.time.split(' - ')[1], // Extract end time
          type: activity.type,
          placeId: activity.id,
        }))
      );

      const programData = {
        name: savedProgramName.trim(),
        destination: destination,
        budget: budget,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        interests: interests,
        adults: adults,
        children: children,
        activities: allActivities,
        user: authHelpers.getCurrentUserId(),
        estimatedBudget: { accommodation: 0, food: 0, attractions: 0, total: 0 }, // Default since not provided by backend
        suggestedGuestHouses: generatedProgram.suggest?.guestHouses.map(house => ({
          id: house.id,
          name: house.name,
          price: house.price,
          latitude: house.latitude,
          longitude: house.longitude,
        })) || [],
      };

      await programApi.createProgram(programData);
      toast({ title: 'Saved', description: 'Program saved successfully!' });
      // Remove from sessionStorage after successful save
      sessionStorage.removeItem('generatedTripProgram');
      // Notify other parts of the app (e.g., Profile) to refresh saved programs
      try {
        window.dispatchEvent(new Event('programCreated'));
      } catch (e) {
        // ignore
      }
      setShowSaveDialog(false);
      setSavedProgramName("");

    } catch (error) {
      console.error("Failed to save program:", error);
      toast({ title: 'Error', description: 'Failed to save program. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    let newDate = new Date().toISOString().split("T")[0];
    let newStartTime = "09:00";
    let newEndTime = "11:00";

    if (programs.length > 0) {
      const lastProgram = programs[programs.length - 1];
      const lastEndHour = parseInt(lastProgram.endTime.split(":")[0]);

      // If last program ends before 20:00, add to same day
      if (lastEndHour < 20) {
        newDate = lastProgram.date;
        newStartTime = `${String(lastEndHour).padStart(2, "0")}:00`;
        newEndTime = `${String(lastEndHour + 2).padStart(2, "0")}:00`;
      } else {
        // Otherwise, add to next day starting at 08:00
        const nextDay = new Date(lastProgram.date);
        nextDay.setDate(nextDay.getDate() + 1);
        newDate = nextDay.toISOString().split("T")[0];
        newStartTime = "08:00";
        newEndTime = "10:00";
      }
    }

    setPrograms([
      ...programs,
      {
        id: `${Date.now()}`,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        text: "New program activity...",
        image: "",
      },
    ]);
  };

  const deleteItem = (id: string) =>
    setPrograms(programs.filter((p) => p.id !== id));

  const updateProgram = (id: string, field: keyof Program, value: string) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        updateProgram(id, "image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Automatically sort programs when any date/time change
  useEffect(() => {
    const sorted = [...programs].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
    setPrograms(sorted);
  }, [programs.map((p) => `${p.date}-${p.startTime}`).join(",")]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/20 pt-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 animate-fade-in">Trip Planner</h1>

          {/* FORM SECTION */}
          <Card className="mb-8 animate-slide-up">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground">Destination</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full mt-1 border rounded-lg p-2"
                  >
                    <option>Aswan</option>
                    <option>Luxor</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Budget (USD)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Check In</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      setCheckOut("");
                    }}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Check Out</label>
                  <input
                    type="date"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={children}
                    onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-sm text-muted-foreground">Interests</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-1">
                  {interestOptions.map((it) => (
                    <button
                      key={it}
                      type="button"
                      onClick={() => toggleInterest(it)}
                      className={`px-3 py-1 rounded-md text-sm border transition-colors ${interests.includes(it)
                        ? "bg-primary text-white border-primary"
                        : "hover:bg-muted border-gray-300"
                        }`}
                    >
                      {it}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button onClick={generatePrograms} disabled={loading}>
                  {loading ? "Generating..." : "Generate Plan"}
                </Button>
                <Button variant="outline" onClick={() => {
                  setPrograms([]);
                  setGeneratedProgram(null);
                  setError(null);
                  sessionStorage.removeItem('generatedTripProgram');
                }}>
                  Reset
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PROGRAM SECTION */}
          <h2 className="text-2xl font-semibold mb-4 animate-scale-in">
            {generatedProgram ? "Your Generated Trip Program" : "Daily Programs"}
          </h2>
          {generatedProgram ? (
            <>

              <DragDropContext onDragEnd={handleGeneratedDragEnd}>
                <Droppable droppableId="generated-programs">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-6"
                    >
                      {generatedProgram.days.map((day, dayIndex) => (
                        <div key={day.date} className="space-y-4">
                          <h3 className="text-xl font-semibold mb-3 text-primary flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {day.date}
                          </h3>
                          <div className="space-y-4">
                            {day.schedule.map((activity, index) => {
                              const programId = `generated-${dayIndex + 1}-${index}`;
                              const globalIndex = generatedProgram.days
                                .slice(0, dayIndex)
                                .reduce((acc, d) => acc + d.schedule.length, 0) + index;

                              return (
                                <Draggable key={programId} draggableId={programId} index={globalIndex}>
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`shadow-luxury hover:shadow-gold transition-all duration-300 border-0 bg-white hover:bg-primary/10 animate-fade-in ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-1' : ''
                                        }`}
                                      style={{
                                        animationDelay: `${globalIndex * 150}ms`,
                                        ...provided.draggableProps.style
                                      }}
                                    >
                                      <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1 space-y-4">
                                          {/* Title and image */}
                                          <div className="flex items-center gap-4 mb-3">
                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                            {activity.image && (
                                              <img
                                                src={activity.image}
                                                alt="program"
                                                className="h-16 w-20 object-cover rounded-lg border-2 border-primary/20 shadow-elegant hover:scale-105 transition-transform duration-200"
                                              />
                                            )}
                                            <div className="flex-1">
                                              <input
                                                type="text"
                                                value={activity.name}
                                                readOnly
                                                className="font-semibold text-lg border-0 bg-transparent cursor-default text-card-foreground w-full focus:outline-none"
                                              />
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'attraction' ? 'bg-primary/10 text-primary' :
                                                  activity.type === 'restaurant' ? 'bg-secondary/10 text-secondary' :
                                                    'bg-accent/10 text-accent'
                                                  }`}>
                                                  {activity.type === 'restaurant' ? 'Restaurant' : 'Attraction'}
                                                </span>
                                              </div>
                                              {activity.description && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                  {activity.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Date + time */}
                                          <div className="flex flex-wrap items-center gap-4 text-sm bg-card/50 rounded-lg p-3 border border-border/50">
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-4 w-4 text-secondary" />
                                              <span className="font-medium">{activity.time}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                          {activity.type === "restaurant" && activity.id && (
                                            <Button
                                              onClick={() => openBookingModal(activity.id, 'restaurant', day.date, activity.time.split(' - ')[0], activity)}
                                              size="sm"
                                              className="w-full md:w-auto"
                                            >
                                              Book Now
                                            </Button>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext></>
          ) : programs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p>No program created yet. Choose preferences and click Generate Plan.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="programs">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {programs.map((p, index) => (
                        <Draggable key={p.id} draggableId={p.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="shadow-luxury hover:shadow-gold transition-all duration-300 border-0 bg-white hover:bg-primary/10 card-entrance-animation"
                            >
                              <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  {/* Title and image */}
                                  <div className="flex items-center gap-3 mb-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    {p.image && (
                                      <img
                                        src={p.image}
                                        alt="program"
                                        onClick={() => setDialogImage(p.image!)}
                                        className="h-12 w-16 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
                                      />
                                    )}
                                    <input
                                      type="text"
                                      value={p.text}
                                      onChange={(e) =>
                                        updateProgram(p.id, "text", e.target.value)
                                      }
                                      className="font-semibold text-base sm:text-lg border rounded-md px-2 py-1 flex-1 min-w-[150px]"
                                    />
                                  </div>

                                  {/* Date + time */}
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <input
                                      type="date"
                                      value={p.date}
                                      onChange={(e) =>
                                        updateProgram(p.id, "date", e.target.value)
                                      }
                                      className="border rounded-md p-1"
                                    />

                                    <Clock className="h-4 w-4 text-primary ml-2" />
                                    <select
                                      value={p.startTime}
                                      onChange={(e) =>
                                        updateProgram(p.id, "startTime", e.target.value)
                                      }
                                      className="border rounded-md p-1"
                                    >
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = String(i).padStart(2, "0");
                                        return (
                                          <option key={hour} value={`${hour}:00`}>
                                            {`${hour}:00`}
                                          </option>
                                        );
                                      })}
                                    </select>
                                    <span>to</span>
                                    <select
                                      value={p.endTime}
                                      onChange={(e) =>
                                        updateProgram(p.id, "endTime", e.target.value)
                                      }
                                      className="border rounded-md p-1"
                                    >
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = String(i).padStart(2, "0");
                                        return (
                                          <option key={hour} value={`${hour}:00`}>
                                            {`${hour}:00`}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>

                                  {/* Image upload */}
                                  <div className="flex items-center gap-3">
                                    <label className="cursor-pointer flex items-center gap-2 text-sm text-primary">
                                      <ImageIcon className="h-4 w-4" />
                                      Change Image
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, p.id)}
                                      />
                                    </label>
                                  </div>
                                </div>

                                <div className="flex items-start gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteItem(p.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button onClick={addItem} className="mt-6 flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add New Activity
              </Button>
            </>
          )}
          {/* <Card className="mt-8 mb-3">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">AI Generated Program Summary</div>
                <div className="font-semibold text-lg">
                  {generatedProgram.days.length} day{generatedProgram.days.length > 1 ? 's' : ''} • {generatedProgram.days.reduce((acc, d) => acc + d.schedule.length, 0)} activities
                </div>

              </div>


            </CardContent>

          </Card> */}
          {/* Suggested Places */}
          {generatedProgram?.suggest?.guestHouses && generatedProgram.suggest.guestHouses.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-secondary flex items-center gap-2 animate-fade-in">
                <Building2 className="h-5 w-5" />
                Suggested Guest Houses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedProgram.suggest.guestHouses.map((house, index) => (

                  <Card
                    key={house.id || index}
                    className="shadow-elegant hover:shadow-luxury transition-all duration-300 border-0 bg-white hover:bg-primary/10 animate-fade-in"
                    style={{ animationDelay: `${(generatedProgram.days.reduce((acc, day) => acc + day.schedule.length, 0) + index) * 150}ms` }}
                  >
                    <CardContent className="p-6 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg text-card-foreground">
                              {house.name}
                            </h4>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                              Guest House
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-card/50 rounded-lg p-3 border border-border/50">
                          <span className="font-medium text-secondary">${house.price}</span>
                          <span className="text-muted-foreground">per night</span>
                        </div>
                        {(house.latitude && house.longitude) && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/30 rounded-lg p-2 border border-border/30">
                            <MapPin className="h-3 w-3" />
                            <span>{Number(house.latitude).toFixed(4)}, {Number(house.longitude).toFixed(4)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={() => openBookingModal(house.id, 'guest_house', undefined, undefined, house)}
                          size="sm"
                          className="gradient-gold hover:shadow-gold transition-all duration-200 text-white border-0"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}


          {/* Save Program Button */}
          {generatedProgram && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => setShowSaveDialog(true)}
                className="gradient-luxury hover:shadow-luxury transition-all duration-200 text-white border-0 px-8 py-3"
              >
                Save Program
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Save Program Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Trip Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Program Name</label>
              <input
                type="text"
                value={savedProgramName}
                onChange={(e) => setSavedProgramName(e.target.value)}
                placeholder="Enter program name..."
                className="w-full mt-1 border rounded-lg p-2"
                disabled={saving}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={saveProgram}
                disabled={saving || !savedProgramName.trim()}
                className="gradient-luxury hover:shadow-luxury transition-all duration-200 text-white border-0"
              >
                {saving ? "Saving..." : "Save Program"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Image Preview */}
      <Dialog open={!!dialogImage} onOpenChange={() => setDialogImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Program Image</DialogTitle>
          </DialogHeader>
          {dialogImage && (
            <img
              src={dialogImage}
              alt="Preview"
              className="rounded-lg w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedPlace?.type === 'guest_house' ? 'Guest House' : 'Restaurant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlace?.type === 'guest_house' && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground">Check In</label>
                  <input
                    type="date"
                    value={bookingData.arrivalDate || ''}
                    onChange={(e) => setBookingData({ ...bookingData, arrivalDate: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Check Out</label>
                  <input
                    type="date"
                    value={bookingData.leavingDate || ''}
                    onChange={(e) => setBookingData({ ...bookingData, leavingDate: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Number of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedPlace?.rooms || 10}
                    value={bookingData.numberOfRooms || 1}
                    onChange={(e) => {
                      const numRooms = Number(e.target.value);
                      const checkInDate = new Date(bookingData.arrivalDate);
                      const checkOutDate = new Date(bookingData.leavingDate);
                      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                      const totalPrice = (selectedPlace?.pricePerNight || 0) * numRooms * nights;
                      setBookingData({ ...bookingData, numberOfRooms: numRooms, totalPrice });
                    }}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Number of Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.adults || adults}
                    onChange={(e) => setBookingData({ ...bookingData, adults: Number(e.target.value) })}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Number of Children</label>
                  <input
                    type="number"
                    min="0"
                    value={bookingData.children || children}
                    onChange={(e) => setBookingData({ ...bookingData, children: Number(e.target.value) })}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Price: ${bookingData.totalPrice || 0}
                </div>
              </>
            )}
            {selectedPlace?.type === 'restaurant' && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground">Booking Date</label>
                  <input
                    type="date"
                    value={bookingData.bookingDay || ''}
                    onChange={(e) => setBookingData({ ...bookingData, bookingDay: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Booking Time</label>
                  <input
                    type="time"
                    value={bookingData.bookingTime || ''}
                    onChange={(e) => setBookingData({ ...bookingData, bookingTime: e.target.value })}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Number of Tables</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedPlace?.tables || 10}
                    value={bookingData.numberOfTables || 1}
                    onChange={(e) => {
                      const numTables = Number(e.target.value);
                      const totalPrice = (selectedPlace?.pricePerTable || 0) * numTables;
                      setBookingData({ ...bookingData, numberOfTables: numTables, totalPrice });
                    }}
                    className="w-full mt-1 border rounded-lg p-2"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Price: ${bookingData.totalPrice || 0}
                </div>
              </>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/booking/${selectedPlace?.id}`)}
              >
                View
              </Button>
              <Button
                onClick={() => setShowConfirmModal(true)}
                className="gradient-luxury hover:shadow-luxury transition-all duration-200 text-white border-0"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to book this {selectedPlace?.type === 'guest_house' ? 'guest house' : 'restaurant'}?</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="gradient-luxury hover:shadow-luxury transition-all duration-200 text-white border-0"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default TripPlanner;