import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { User, MapPin, Calendar, DollarSign, Clock, CheckCircle, XCircle, Loader, Award, ShieldCheck, Zap, TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';
import Cookies from "js-cookie";
import api from "@/interceptor/api";
import { programApi } from "@/services/api";
import ProgramDetailsModal from "@/components/ProgramDetailsModal";
import UserAvatar from "@/components/ui/UserAvatar";
import ChatButton from "@/components/ChatButton";
import { authHelpers } from "@/services/api";

type Booking = {
  _id: string;
  place?: { name?: string; address?: string; type?: string; latitude?: number; longitude?: number };
  arrivalDate?: string;
  leavingDate?: string;
  memberNumber?: number;
  roomNumber?: number;
  destination?: string;
  budget?: number;
  duration?: number;
  interesting?: string;
  date?: string | Date;
  status?: "confirmed" | "pending" | "canceled";
  totalPrice?: number;
  bookingTime?: string;
  bookingDay?: string;
  bookingType?: string;
  guestTypes?: any;
  createdAt?: Date;
  paymentStatus?: "paid" | "pending" | "failed" | "unpaid";
  paymentMethod?: string;
  platform?: string;
  admin?: { _id: string; firstName: string; lastName: string; photo?: string };
};

const getBookingStatus = (arrivalDate: string, leavingDate: string, placeType: string, bookingTime?: string) => {
  const now = new Date();
  const arrival = new Date(arrivalDate);
  const leaving = leavingDate ? new Date(leavingDate) : null;

  if (placeType === "restaurant") {
    // For restaurants, check if the reservation date/time has passed
    if (bookingTime) {
      // Combine date and time for restaurants
      const [hours, minutes] = bookingTime.split(':').map(Number);
      arrival.setHours(hours, minutes, 0, 0);
    }

    if (now < arrival) return "Waiting";
    if (now >= arrival) return "Finished";
    return "Waiting";
  }

  // For guest houses
  if (!leaving) return "Waiting";

  if (now < arrival) return "Waiting";
  if (now >= arrival && now <= leaving) return "Running";
  if (now > leaving) return "Finished";

  return "Waiting";
};

type ProfileData = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
};


// Simple hook for counting up numbers
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

const Profile = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Open program modal when navigated here with a programId in location.state
  useEffect(() => {
    const state = (location as any).state;
    const programId = state?.programId;
    if (programId) {
      (async () => {
        try {
          const res = await programApi.getProgram(programId);
          const programData = (res as any).data?.data || (res as any).data || res;
          setSelectedProgram(programData);
          setSelectedActivityIndex(0);
          setProgramModalOpen(true);
        } catch (err) {
          console.error('Failed to load program from location state', err);
        }
      })();
    }
  }, [location]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userPrograms, setUserPrograms] = useState<any[]>([]);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number>(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [programToConfirmDelete, setProgramToConfirmDelete] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState<any>({});

  // Photo upload states
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Booking modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Editable profile fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // User info from token
  const [userInfo, setUserInfo] = useState<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    photo?: string;
  } | null>(null);

  const token = Cookies.get("goldenNileToken");

  // Decode token to get user info
  const decodeToken = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  };

  const payload = useMemo(() => {
    if (!token) return null;
    return decodeToken(token);
  }, [token]);
  const { toast } = useToast();

  const defaultAvatar = useMemo(() => {
    const seed = profile?.email || profile?.firstName || "User";
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  }, [profile]);

  // fetch user data and save to state - always runs on page refresh (mount)
  const fetchAndSaveUserData = async (id: string) => {
    try {
      const res = await api.get(`/api/user/${id}`);
      const data = res?.data || null;
      if (data) {
        // Construct full photo URL if photo exists
        if (data.photo) {
          data.photo = data.photo.startsWith('http') ? data.photo : `${api.defaults.baseURL}${data.photo}`;
        }
        setUserData(data);
        return data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  };

  // Fetch user places on mount and ensure userData is fetched & used
  useEffect(() => {
    const token = Cookies.get("goldenNileToken");
    if (!token) {
      navigate("/auth");
      return;
    }

    const payload = decodeToken(token);
    if (!payload?.id) {
      navigate("/auth");
      return;
    }

    (async () => {
      // Load from localStorage first for immediate display
      try {
        const storedData = localStorage.getItem("goldenNileUserData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          setUserInfo({
            id: payload.id,
            email: payload.email,
            firstName: parsedData?.firstName || payload.firstName || "firstname",
            lastName: parsedData?.lastName || payload.lastName || "lastname",
            gender: parsedData?.gender || payload.gender || "male",
            photo: parsedData?.photo || "",
          });
        }
      } catch (e) {
        console.error("Error loading from localStorage:", e);
      }

      // Always fetch latest user data on refresh/mount
      const data = await fetchAndSaveUserData(payload.id);
      // Update userInfo with fresh data
      setUserInfo({
        id: payload.id,
        email: payload.email,
        firstName: data?.firstName || payload.firstName || "firstname",
        lastName: data?.lastName || payload.lastName || "lastname",
        gender: data?.gender || payload.gender || "male",
        photo: data?.photo || "",
      });

      // Fetch bookings
      try {
        const userId = payload?.id;
        if (userId) {
          const resBookings = await api.get(`/api/booking/user/${userId}`);
          const d = (resBookings as any).data || resBookings;

          // Load fake bookings from localStorage
          const localFakeBookings = JSON.parse(localStorage.getItem("fakeBookings") || "[]");
          const apiBookings = Array.isArray(d.data || d) ? (d.data || d) : [];

          // Merge and sort newest first
          const allBookings = [...localFakeBookings, ...apiBookings].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setBookings(allBookings);
        }
      } catch (e) {
        // silently ignore; Guard handles redirects for unauthenticated
      }

      // Fetch saved programs
      try {
        const userId = payload?.id;
        if (userId) {
          const resPrograms = await programApi.getProgramsByUser(userId);
          const programs = (resPrograms as any).data || resPrograms;
          const programsData = programs.data || programs;
          // Sort by createdAt descending (newest first)
          const sortedPrograms = programsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setUserPrograms(sortedPrograms);
        }
      } catch (e) {
        console.error("Failed to fetch user programs:", e);
      }

    })();

  }, [navigate]);


  // Refresh bookings when a new booking is made
  const refreshBookings = useCallback(async () => {
    const userId = payload?.id;
    if (userId) {
      try {
        const resBookings = await api.get(`/api/booking/user/${userId}`);
        const d = (resBookings as any).data || resBookings;

        // Load fake bookings from localStorage
        const localFakeBookings = JSON.parse(localStorage.getItem("fakeBookings") || "[]");
        const apiBookings = Array.isArray(d.data || d) ? (d.data || d) : [];

        // Merge and sort newest first
        const allBookings = [...localFakeBookings, ...apiBookings].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setBookings(allBookings);
      } catch (e) {
        console.error("Failed to refresh bookings:", e);
      }
    }
  }, [payload?.id]);

  // Refresh user's saved programs
  const refreshPrograms = useCallback(async () => {
    const userId = payload?.id;
    if (!userId) return;
    try {
      const resPrograms = await programApi.getProgramsByUser(userId);
      const programs = (resPrograms as any).data || resPrograms;
      const programsData = programs.data || programs;
      // Sort by createdAt descending (newest first)
      const sortedPrograms = programsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserPrograms(sortedPrograms);
    } catch (e) {
      console.error('Failed to refresh programs', e);
    }
  }, [payload?.id]);



  // Listen for booking creation and deletion events
  useEffect(() => {
    const handleBookingCreated = () => {
      refreshBookings();
      setActiveTab("bookings");
    };

    const handleBookingDeleted = () => {
      refreshBookings();
    };

    const handleProgramCreated = () => {
      refreshPrograms();
    };

    const handleProgramDeleted = () => {
      refreshPrograms();
    };

    window.addEventListener('bookingCreated', handleBookingCreated);
    window.addEventListener('bookingDeleted', handleBookingDeleted);
    window.addEventListener('programCreated', handleProgramCreated);
    window.addEventListener('programDeleted', handleProgramDeleted);

    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
      window.removeEventListener('bookingDeleted', handleBookingDeleted);
      window.removeEventListener('programCreated', handleProgramCreated);
      window.removeEventListener('programDeleted', handleProgramDeleted);
    };
  }, [payload?.id, refreshBookings, refreshPrograms]);

  // Refresh programs when Programs tab becomes active or when user changes
  useEffect(() => {
    if (activeTab !== "programs") return;
    (async () => {
      try {
        const userId = payload?.id;
        if (!userId) return;
        const resPrograms = await programApi.getProgramsByUser(userId);
        const programs = (resPrograms as any).data || resPrograms;
        const programsData = programs.data || programs;
        // Sort by createdAt descending (newest first)
        const sortedPrograms = programsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserPrograms(sortedPrograms);
      } catch (err) {
        console.error("Failed to refresh programs:", err);
      }
    })();
  }, [activeTab, payload?.id]);

  // Populate edit states when userData loads
  useEffect(() => {
    if (userData) {
      setEditFirstName(userData.firstName || "");
      setEditLastName(userData.lastName || "");
      setEditEmail(userData.email || "");
      setEditPhone(userData.phone || "");
    }
  }, [userData]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setPhotoUploadError("Please select a valid image file.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setPhotoUploadError("Image file is too large. Please choose an image under 5MB.");
        return;
      }

      // Clear any previous errors
      setPhotoUploadError(null);

      setSelectedPhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    } catch (error) {
      console.error("Error handling photo upload:", error);
      setPhotoUploadError("Error selecting photo. Please try again.");
    }
  };

  const uploadPhoto = async () => {
    if (!selectedPhoto) return;

    setPhotoUploadLoading(true);
    setPhotoUploadError(null);

    const formData = new FormData();
    formData.append("photo", selectedPhoto);

    try {

      const res = await api.post("/api/user/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if ((res as any).photo) {
        // Construct full URL for the uploaded photo
        const photoUrl = (res as any).photo;
        const fullPhotoUrl = photoUrl.startsWith('http') ? photoUrl : `${api.defaults.baseURL}${photoUrl}`;
        setUserData((prev: any) => {
          const updatedData = {
            ...prev,
            photo: fullPhotoUrl || prev.photo || "",
          };
          // Update localStorage with new photo
          try {
            localStorage.setItem("goldenNileUserData", JSON.stringify(updatedData));
          } catch (e) {
            console.error("Error updating localStorage:", e);
          }
          return updatedData;
        });
        setSelectedPhoto(null);
        setPhotoPreview(null);
        // Update navbar cookie
        Cookies.set("goldenNileUserPhoto", fullPhotoUrl);
        // Clear the file input
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        console.error("No photo in response:", res);
        throw new Error("No photo URL returned from server");
      }
    } catch (err: any) {
      console.error("Error uploading photo:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));

      let errorMessage = "Failed to upload photo. Please try again.";

      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;
        console.error("Response status:", status);
        console.error("Response data:", data);

        switch (status) {
          case 400:
            errorMessage = data?.message || "Invalid file format or size.";
            break;
          case 401:
            errorMessage = "You are not authorized. Please log in again.";
            break;
          case 413:
            errorMessage = "File is too large. Please choose a smaller image.";
            break;
          case 415:
            errorMessage = "Unsupported file type. Please choose a valid image file.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || err.message || errorMessage;
        }
      } else if (err?.request) {
        console.error("Request error - no response received");
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        console.error("Other error:", err.message);
        errorMessage = err.message || errorMessage;
      }

      setPhotoUploadError(errorMessage);
    } finally {
      setPhotoUploadLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updatedData = {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
      };
      const res = await api.put(`/api/user/${userInfo?.id}`, updatedData);
      if (res.data.success) {
        // Update userData
        setUserData(res.data.data);
        // Update localStorage
        localStorage.setItem("goldenNileUserData", JSON.stringify(res.data.data));
        // Update userInfo
        setUserInfo(prev => prev ? {
          ...prev,
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
          email: res.data.data.email,
        } : null);
        // Update navbar cookie if email changed
        if (res.data.data.email !== userInfo?.email) {
          Cookies.set("goldenNileUserEmail", res.data.data.email);
        }
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      // Optionally show error message
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Running":
        return "text-green-600 bg-green-50 border-green-200";
      case "Finished":
        return "text-red-600 bg-red-50 border-red-200";
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "canceled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Waiting":
        return <Clock className="h-5 w-5" />;
      case "Running":
        return <CheckCircle className="h-5 w-5" />;
      case "Finished":
        return <XCircle className="h-5 w-5" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5" />;
      case "pending":
        return <Loader className="h-5 w-5" />;
      case "canceled":
        return <XCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const completionPercentage = useMemo(() => {
    if (!userData) return 0;
    let score = 0;
    if (userData.firstName) score += 10;
    if (userData.lastName) score += 10;
    if (userData.email) score += 10;
    if (userData.phone) score += 20;
    if (userData.photo) score += 20;
    return Math.min(score + 30, 100);
  }, [userData]);

  const totalTripsCount = bookings.length;
  const confirmedTripsCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingTripsCount = bookings.filter((b) => b.status === "pending").length;

  const animatedTotalTrips = useCountUp(totalTripsCount);
  const animatedConfirmed = useCountUp(confirmedTripsCount);
  const animatedPending = useCountUp(pendingTripsCount);

  const stats = [
    { title: "Total Trips", value: animatedTotalTrips, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Confirmed", value: animatedConfirmed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { title: "Pending", value: animatedPending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const recentActivities = [
    { id: 1, action: "Logged in successfully", date: "Today, 10:23 AM", icon: CheckCircle },
    { id: 2, action: "Viewed trip details", date: "Yesterday, 2:15 PM", icon: Activity },
    { id: 3, action: "Updated profile info", date: "Dec 12, 2024", icon: User },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-muted/20 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="overflow-hidden shadow-lg border-0 rounded-xl">
                <div className="relative h-32 bg-gradient-to-r from-primary to-secondary">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <UserAvatar
                      src={userData?.photo}
                      name={userData ? `${userData.firstName} ${userData.lastName}` : "User"}
                      alt={userData ? `${userData.firstName} ${userData.lastName}` : "User"}
                      className="w-24 h-24 border-4 border-white shadow-md rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-14 pb-6 px-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : "Loading..."}
                  </h2>
                  <p className="text-gray-500 text-sm mb-4">{userInfo?.email || "Loading..."}</p>

                  <div className="flex justify-center gap-2 mb-6">
                    <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                      <Award className="w-3 h-3 mr-1" /> New Member
                    </Badge>
                  </div>

                  <div className="mb-6 text-left">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Profile Completion</span>
                      <span className="font-bold text-primary">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    {completionPercentage < 100 && (
                      <Button
                        variant="outline"
                        className="w-full mt-4 text-xs h-8 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setActiveTab("settings")}
                      >
                        Complete Your Profile
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-0 border-t">
                  <nav className="flex flex-col">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "overview"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <User className="w-4 h-4" /> Profile Overview
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "bookings"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <MapPin className="w-4 h-4" /> My Bookings
                    </button>
                    <button
                      onClick={() => setActiveTab("programs")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "programs"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <Calendar className="w-4 h-4" /> Programs
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "settings"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <User className="w-4 h-4" /> Settings
                    </button>
                    <button
                      onClick={() => {
                        Cookies.remove("goldenNileToken");
                        Cookies.remove("goldenNileUserPhoto");
                        navigate("/");
                        window.location.reload();
                      }}
                      className="px-6 py-4 text-left border-l-4 border-transparent hover:bg-red-50 text-red-600 w-full flex items-center gap-3"
                    >
                      <XCircle className="w-4 h-4" /> Log Out
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {activeTab === "overview" && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">Profile Overview</h1>
                    <p className="text-sm text-gray-500">Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "-"}</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                      <Card
                        key={index}
                        className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-6 flex items-center justify-between relative z-10">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300 origin-left">
                              {stat.value}
                            </h3>
                          </div>
                          <div className={`p-3 rounded-full ${stat.bg} ${stat.color} bg-opacity-50`}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Personal Info Summary */}
                  <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                          <p className="font-medium text-gray-700 text-lg">{userData ? `${userData.firstName} ${userData.lastName}` : "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                          <p className="font-medium text-gray-700 text-lg">{userData?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                          <p className="font-medium text-gray-700 text-lg">{userData?.phone || "Not provided"}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</label>
                          <p className="font-medium text-gray-700 text-lg">Cairo, Egypt <span className="text-xs text-muted-foreground ml-2">(Default)</span></p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity Placeholder */}
                  <Card className="border-0 shadow-sm animate-slide-up overflow-hidden" style={{ animationDelay: '400ms' }}>
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="space-y-6">
                        {recentActivities.map((activity, idx) => (
                          <div
                            key={idx}
                            className="flex gap-4 items-start group animate-slide-up"
                            style={{ animationDelay: `${500 + (idx * 100)}ms`, animationFillMode: 'both' }}
                          >
                            <div className="mt-1">
                              <div className="p-2 rounded-full bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <activity.icon className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="flex-1 pb-4 border-b last:border-0 border-gray-100">
                              <p className="font-medium text-gray-800">{activity.action}</p>
                              <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "programs" && (
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-bold mb-6">My Saved Programs</h1>
                  {userPrograms.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No saved programs yet</h3>
                        <p className="text-muted-foreground mb-6">Generate a travel program and save it from the Trip Planner.</p>
                        <Link to="/trip">
                          <Button>Open Trip Planner</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {userPrograms.map((prog: any, idx: number) => (
                        <Card key={prog._id || idx} className="hover:shadow-lg overflow-hidden">
                          <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4 items-center">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold">{prog.name}</h3>
                              <p className="text-sm text-muted-foreground">{prog.destination} • {prog.activities?.length || 0} activities</p>
                              <p className="text-sm mt-2 text-muted-foreground">{prog.checkInDate} to {prog.checkOutDate}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={async () => {
                                try {
                                  const res = await programApi.getProgram(prog._id);
                                  const programData = (res as any).data?.data || (res as any).data || res;
                                  setSelectedProgram(programData);
                                  setSelectedActivityIndex(0);
                                  setProgramModalOpen(true);
                                } catch (err) {
                                  console.error('Failed to fetch program', err);
                                  toast({ title: 'Error', description: 'Failed to load program details.' });
                                }
                              }}>View</Button>
                              <Button onClick={async () => {
                                await api.delete(`/api/program/${prog._id}`)
                                setProgramToConfirmDelete(prog);
                                setConfirmDeleteOpen(true);
                              }} variant="destructive">Delete</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="animate-fade-in">
                  <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
                  {bookings.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
                        <p className="text-muted-foreground mb-6">
                          You haven't booked any trips yet. Explore more adventures!
                        </p>
                        <Link to="/booking">
                          <Button>Browse Trips</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {bookings.map((trip, index) => (
                        <Card
                          key={(trip as any)._id || index}
                          className="overflow-hidden hover:shadow-lg transition-shadow animate-slide-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold mb-2">{trip.place?.name || trip.destination || "Trip"}</h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getBookingStatus(trip.arrivalDate || "", trip.leavingDate || "", trip.place?.type || "guest_house", (trip as any).bookingTime))}`}>
                                  {getStatusIcon(getBookingStatus(trip.arrivalDate || "", trip.leavingDate || "", trip.place?.type || "guest_house", (trip as any).bookingTime))}
                                  <span>{getBookingStatus(trip.arrivalDate || "", trip.leavingDate || "", trip.place?.type || "guest_house", (trip as any).bookingTime)}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${trip.paymentStatus === "paid" ? "bg-green-100 text-green-700 border-green-200" :
                                      trip.paymentStatus === "failed" ? "bg-red-100 text-red-700 border-red-200" :
                                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                                      }`}>
                                      Payment: {trip.paymentStatus ? trip.paymentStatus.charAt(0).toUpperCase() + trip.paymentStatus.slice(1) : "Pending"}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border">
                                      Method: {trip.paymentMethod ? trip.paymentMethod.charAt(0).toUpperCase() + trip.paymentMethod.slice(1) : "—"}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    {trip.paymentStatus === "pending" && (
                                      <Button
                                        variant="default"
                                        className="w-full sm:w-auto"
                                        onClick={() => navigate(`/payment/fake-booking`, {
                                          state: {
                                            packageData: {
                                              title: trip.place?.name,
                                              destination: trip.destination || trip.place?.address,
                                              price: trip.totalPrice?.toString()
                                            },
                                            fromPackage: true, // Reuse package flow for simplicity
                                            fromBooking: true, // Flag to indicate re-payment
                                            existingBookingId: trip._id
                                          }
                                        })}
                                      >
                                        Pay Now
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedBooking(trip);
                                        setBookingModalOpen(true);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                    {trip.admin?._id && trip.admin._id !== authHelpers.getCurrentUserId() && (
                                      <ChatButton
                                        ownerId={trip.admin._id}
                                        propertyTitle={trip.place?.name || "Trip"}
                                        className="h-9 px-3 text-xs font-semibold"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                <span className="text-2xl font-bold text-primary">${trip.totalPrice || "N/A"}</span>
                                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(trip.status || "pending")}`}>
                                  {trip.status ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1) : "Pending"}
                                </span>
                              </div>
                            </div>

                            {/* Booking Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">{trip.place?.address || "N/A"}</div>
                                  <div className="text-xs">Location</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">{trip.memberNumber || "N/A"}</div>
                                  <div className="text-xs">{trip.place?.type === "restaurant" ? "Tables" : "Guests"}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">
                                    {trip.place?.type === "restaurant" && trip.bookingDay
                                      ? new Date(trip.bookingDay).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                      : trip.arrivalDate
                                        ? new Date(trip.arrivalDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                        : (trip.date ? new Date(trip.date).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        }) : "N/A")}
                                  </div>
                                  <div className="text-xs">{trip.place?.type === "restaurant" ? "Reservation Date" : "Check-in"}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">
                                    {trip.place?.type === "restaurant" && trip.bookingTime
                                      ? trip.bookingTime
                                      : trip.leavingDate
                                        ? new Date(trip.leavingDate).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                        : "N/A"}
                                  </div>
                                  <div className="text-xs">{trip.place?.type === "restaurant" ? "Time" : "Check-out"}</div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Info for Guest Houses */}
                            {/* Pending Payment Action */}


                            {/* {trip.place?.type === "guest_house" && trip.roomNumber && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/package/${trip._id}`, { state: { packageData: trip } })}
                                >
                                  View Details
                                </Button>
                              </div>
                            )} */}

                            {/* Additional Info for Restaurants */}
                            {/* {trip.place?.type === "restaurant" && (
                              <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex justify-start mb-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => navigate(`/package/${trip._id}`, { state: { packageData: trip } })}
                                  >
                                    View Details
                                  </Button>
                                </div>

                              </div>
                            )} */}

                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Settings</h1>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <UserAvatar
                                src={photoPreview || userData?.photo}
                                name={userInfo ? `${userInfo.firstName}${userInfo.lastName}` : "User"}
                                alt="Profile"
                                className="w-24 h-24 border-4 border-white shadow-lg"
                              />
                              <label
                                htmlFor="photo-upload"
                                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                              >
                                <User className="w-4 h-4" />
                              </label>
                              <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Change Profile Picture</h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                Upload a new profile picture. Recommended size: 400x400px
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => document.getElementById('photo-upload')?.click()}
                                >
                                  Choose File
                                </Button>
                                {selectedPhoto && (
                                  <Button onClick={uploadPhoto} disabled={photoUploadLoading}>
                                    {photoUploadLoading ? "Uploading..." : "Upload Photo"}
                                  </Button>
                                )}
                              </div>
                              {selectedPhoto && (
                                <p className="text-sm text-green-600 mt-2">
                                  Selected: {selectedPhoto.name}
                                </p>
                              )}
                              {photoUploadError && (
                                <p className="text-sm text-red-600 mt-2">
                                  Error: {photoUploadError}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-6">
                          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">First Name</label>
                              <Input
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                                placeholder="First Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Last Name</label>
                              <Input
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                                placeholder="Last Name"
                              />
                            </div>
                            {/* <div>
                              <label className="block text-sm font-medium mb-2">Email</label>
                              // <Input
                               value={editEmail}
                               onChange={(e) => setEditEmail(e.target.value)}
                                placeholder="Email"
                               type="email"
                              />
                            </div> */}
                            {/* <div>
                              <label className="block text-sm font-medium mb-2">Phone Number</label>
                              <Input
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                placeholder="Phone Number"
                              />
                            </div> */}
                          </div>
                          <div className="mt-6">
                            <Button variant="outline" onClick={handleUpdateProfile}>
                              Update Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about your booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{selectedBooking.place?.name || "Booking"}</h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getBookingStatus(selectedBooking.arrivalDate || "", selectedBooking.leavingDate || "", selectedBooking.place?.type || "guest_house", (selectedBooking as any).bookingTime))}`}>
                        {getStatusIcon(getBookingStatus(selectedBooking.arrivalDate || "", selectedBooking.leavingDate || "", selectedBooking.place?.type || "guest_house", (selectedBooking as any).bookingTime))}
                        <span>{getBookingStatus(selectedBooking.arrivalDate || "", selectedBooking.leavingDate || "", selectedBooking.place?.type || "guest_house", (selectedBooking as any).bookingTime)}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
                      <span className="text-2xl font-bold text-primary">${selectedBooking.totalPrice || "N/A"}</span>
                      {selectedBooking.admin?._id && selectedBooking.admin._id !== authHelpers.getCurrentUserId() && (
                        <ChatButton
                          ownerId={selectedBooking.admin._id}
                          propertyTitle={selectedBooking.place?.name || "Booking"}
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>

                  {/* Booking Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">{selectedBooking.place?.address || "N/A"}</div>
                        <div className="text-xs">Location</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">{selectedBooking.memberNumber || "N/A"}</div>
                        <div className="text-xs">{selectedBooking.place?.type === "restaurant" ? "Tables" : "Guests"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">
                          {selectedBooking.place?.type === "restaurant" && selectedBooking.bookingDay
                            ? new Date(selectedBooking.bookingDay).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                            : selectedBooking.arrivalDate
                              ? new Date(selectedBooking.arrivalDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                              : (selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) : "N/A")}
                        </div>
                        <div className="text-xs">{selectedBooking.place?.type === "restaurant" ? "Reservation Date" : "Check-in"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">
                          {selectedBooking.leavingDate
                            ? new Date(selectedBooking.leavingDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                            : selectedBooking.place?.type === "restaurant" && (selectedBooking as any).bookingTime
                              ? selectedBooking.bookingTime
                              : "N/A"}
                        </div>
                        <div className="text-xs">{selectedBooking.place?.type === "restaurant" ? "Time" : "Check-out"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info for Guest Houses */}
                  {selectedBooking.place?.type === "guest_house" && selectedBooking.roomNumber && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Room Number: </span>
                        {selectedBooking.roomNumber}
                      </p>
                    </div>
                  )}

                  {/* Additional Info for Restaurants */}
                  {selectedBooking.place?.type === "restaurant" && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Reservation Time: </span>
                        {selectedBooking.createdAt
                          ? new Date(selectedBooking.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : selectedBooking.bookingTime || "N/A"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Section */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Location</h4>
                  <div className="w-full h-[400px] bg-muted rounded-xl overflow-hidden">
                    {selectedBooking.place?.latitude && selectedBooking.place?.longitude ? (
                      <iframe
                        src={`https://maps.google.com/maps?q=${selectedBooking.place.latitude},${selectedBooking.place.longitude}&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Location Map"
                      ></iframe>
                    ) : selectedBooking.place?.address ? (
                      <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedBooking.place.address)}&output=embed`}
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
                </CardContent>
              </Card>

              {/* Place Information */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Place Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Place Type</label>
                      <p className="font-medium capitalize">{selectedBooking.place?.type?.replace('_', ' ') || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Booking ID</label>
                      <p className="font-medium">{selectedBooking._id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Total Price</label>
                      <p className="font-medium">${selectedBooking.totalPrice || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Booked On</label>
                      <p className="font-medium">
                        {selectedBooking.createdAt
                          ? new Date(selectedBooking.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                          : "N/A"}
                      </p>
                    </div>
                    {selectedBooking.place?.type === "restaurant" && (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Reservation Date</label>
                          <p className="font-medium">
                            {selectedBooking.bookingDay
                              ? new Date(selectedBooking.bookingDay).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Reservation Time</label>
                          <p className="font-medium">{selectedBooking.bookingTime || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Number of Tables</label>
                          <p className="font-medium">{selectedBooking.memberNumber || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Booking Type</label>
                          <p className="font-medium">{selectedBooking.bookingType || "N/A"}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Program Details Modal */}
      <ProgramDetailsModal
        program={selectedProgram}
        isOpen={programModalOpen}
        onClose={() => setProgramModalOpen(false)}
        selectedActivityIndex={selectedActivityIndex}
        setSelectedActivityIndex={setSelectedActivityIndex}
        showDeleteButton={true}
        onDelete={async () => {
          await api.delete(`/api/program/${selectedProgram._id}`)
          if (!selectedProgram) return;
          setProgramToConfirmDelete(selectedProgram);
          setConfirmDeleteOpen(true);
        }}
      />

      {/* Confirm Delete Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the program <strong>{programToConfirmDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (!programToConfirmDelete) return;
              try {
                const res = await programApi.deleteProgram(programToConfirmDelete._id);
                const result = (res as any).data || res;
                const ok = (res as any).success === true || result?.success === true || Boolean((res as any).success);
                if (!ok && (res as any).success === false) {
                  throw new Error((res as any).message || 'Failed to delete program.');
                }
                setUserPrograms((prev) => prev.filter(p => p._id !== programToConfirmDelete._id));
                // Close program modal if it's the same program
                if (selectedProgram && selectedProgram._id === programToConfirmDelete._id) {
                  setProgramModalOpen(false);
                  setSelectedProgram(null);
                }
                setConfirmDeleteOpen(false);
                setProgramToConfirmDelete(null);
                try { window.dispatchEvent(new Event('programDeleted')); } catch (e) { }
                toast({ title: 'Deleted', description: 'Program deleted successfully.' });
              } catch (err: any) {
                console.error('Failed to delete program', err);
                toast({ title: 'Error', description: err?.message || 'Failed to delete program.' });
              }
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Profile;