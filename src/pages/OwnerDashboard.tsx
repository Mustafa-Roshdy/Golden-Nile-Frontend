import React, { useEffect, useState, useMemo, useCallback } from "react";
import { deleteGuestHouse, getGuestHousesByCreator, updatePlace } from "@/Redux/Slices/guestHouseSlice";
import { getRestaurantsByCreator } from "@/Redux/Slices/restaurantSlice";
import {
  Building2,
  Utensils,
  Edit,
  Trash2,
  Grid,
  Table as TableIcon,
  Plus,
  Menu,
  Calendar,
  Lock,
  Unlock,
  Clock,
  Images,
  Star,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  DollarSign,
  MapPin,
  CheckCircle,
  XCircle,
  Award,
  ShieldCheck,
  TrendingUp,
  Activity,
  LogOut,
  LayoutDashboard,
  Settings
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate, Link, useLocation } from "react-router-dom";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/ui/UserAvatar";
import Cookies from "js-cookie";
import api from "@/interceptor/api";

type BizType = "guesthouse" | "restaurant";
type BizItem = {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  image?: string;
  images?: string | string[] | null;
  type: string;
  description?: string;
  rooms?: number;
  rating?: number;
  cuisine?: string | string[];
  isAvailable?: boolean;
  breakfast?: boolean;
  wifi?: boolean;
  airConditioning?: boolean;
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

const OwnerDashboard: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [guestHousesList, setGuestHousesList] = useState<BizItem[]>([]);
  const [restaurantsList, setRestaurantsList] = useState<BizItem[]>([]);

  const [userData, setUserData] = useState<any>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Editable profile fields
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [userInfo, setUserInfo] = useState<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    photo?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "guesthouses" | "restaurants" | "settings" | "reservations"
  >("overview");
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Booking Modal
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [deleteBookingDialog, setDeleteBookingDialog] = useState<{
    open: boolean;
    bookingId: string | null;
  }>({
    open: false,
    bookingId: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    type: BizType | null;
  }>({
    open: false,
    id: null,
    type: null,
  });

  const [imageCarousel, setImageCarousel] = useState<{
    placeId: string | null;
    currentIndex: number;
    images: string[];
  }>({
    placeId: null,
    currentIndex: 0,
    images: [],
  });

  const [alertModal, setAlertModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "",
    message: ""
  });

  const showAlert = (title: string, message: string) => {
    setAlertModal({ open: true, title, message });
  };

  // Decode token
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

  const fetchAndSaveUserData = async (id: string) => {
    try {
      const res = await api.get(`/api/user/${id}`);
      const data = res?.data || null;
      if (data) {
        if (data.photo) {
          data.photo = data.photo.startsWith('http') ? data.photo : `${api.defaults.baseURL}${data.photo}`;
        }
        setUserData(data);
        try {
          localStorage.setItem("goldenNileUserData", JSON.stringify(data));
        } catch { }
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      return null;
    }
  };

  useEffect(() => {
    const handleBookingCreated = () => {
      if (userInfo?.id) {
        fetchReservations(userInfo.id);
      }
    };

    const handleBookingDeleted = () => {
      if (userInfo?.id) {
        fetchReservations(userInfo.id);
      }
    };

    window.addEventListener('bookingCreated', handleBookingCreated);
    window.addEventListener('bookingDeleted', handleBookingDeleted);

    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
      window.removeEventListener('bookingDeleted', handleBookingDeleted);
    };
  }, [userInfo?.id]);

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

      const data = await fetchAndSaveUserData(payload.id);
      setUserInfo({
        id: payload.id,
        email: payload.email,
        firstName: data?.firstName || payload.firstName || "firstname",
        lastName: data?.lastName || payload.lastName || "lastname",
        gender: data?.gender || payload.gender || "male",
        photo: data?.photo || "",
      });

      try {
        const ghResult = await dispatch(getGuestHousesByCreator(payload.id));
        if (getGuestHousesByCreator.fulfilled.match(ghResult)) {
          setGuestHousesList(ghResult.payload);
        } else {
          setGuestHousesList([]);
        }
      } catch (e) {
        console.error(e);
        setGuestHousesList([]);
      }

      try {
        const rResult = await dispatch(getRestaurantsByCreator(payload.id));
        if (getRestaurantsByCreator.fulfilled.match(rResult)) {
          setRestaurantsList(rResult.payload);
        } else {
          setRestaurantsList([]);
        }
      } catch (e) {
        console.error(e);
        setRestaurantsList([]);
      }

      fetchReservations(payload.id);
    })();
  }, [dispatch, navigate]);

  // Populate edit states when userData loads
  useEffect(() => {
    if (userData) {
      setEditFirstName(userData.firstName || "");
      setEditLastName(userData.lastName || "");
      setEditEmail(userData.email || "");
      setEditPhone(userData.phone || "");
    }
  }, [userData]);

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
        setUserData(res.data.data);
        localStorage.setItem("goldenNileUserData", JSON.stringify(res.data.data));
        setUserInfo(prev => prev ? {
          ...prev,
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
          email: res.data.data.email,
        } : null);
        if (res.data.data.email !== userInfo?.email) {
          Cookies.set("goldenNileUserEmail", res.data.data.email);
        }
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
    }
  };

  const getBookingStatus = (arrivalDate: string, leavingDate: string, placeType: string, bookingTime?: string) => {
    const now = new Date();
    const arrival = new Date(arrivalDate);
    const leaving = leavingDate ? new Date(leavingDate) : null;

    if (placeType === "restaurant") {
      if (bookingTime) {
        const [hours, minutes] = bookingTime.split(':').map(Number);
        arrival.setHours(hours, minutes, 0, 0);
      }
      if (now < arrival) return "Waiting";
      if (now >= arrival) return "Finished";
      return "Waiting";
    }
    if (!leaving) return "Waiting";
    if (now < arrival) return "Waiting";
    if (now >= arrival && now <= leaving) return "Running";
    if (now > leaving) return "Finished";
    return "Waiting";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Running": return "text-green-600 bg-green-50 border-green-200";
      case "Finished": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Waiting": return <Clock className="h-5 w-5" />;
      case "Running": return <Star className="h-5 w-5" />;
      case "Finished": return <Calendar className="h-5 w-5" />;
      default: return null;
    }
  };

  const activeReservationsCount = useCountUp(reservations.length);
  const totalBusinessesCount = useCountUp(guestHousesList.length + restaurantsList.length);
  const pendingReservationsCount = useCountUp(reservations.filter(r => {
    const status = getBookingStatus(r.arrivalDate, r.leavingDate, r.place?.type || 'guest_house', r.bookingTime);
    return status === "Waiting";
  }).length);

  const stats = [
    { title: "Total Businesses", value: totalBusinessesCount, icon: Building2, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Bookings", value: activeReservationsCount, icon: Calendar, color: "text-green-500", bg: "bg-green-50" },
    { title: "Pending", value: pendingReservationsCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const fetchReservations = async (userId: string) => {
    setReservationsLoading(true);
    try {
      const res = await api.get(`/api/booking/admin/${userId}`);
      if (res) {
        const d: any = res;
        if (d.success) {
          const data = res.data;
          const sortedData = (data || []).sort((a: any, b: any) =>
            new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
          );
          setReservations(sortedData);
        } else {
          setReservations([]);
        }
      } else {
        setReservations([]);
      }
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
      setReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };



  const handleDeleteBooking = async () => {
    const { bookingId } = deleteBookingDialog;
    if (!bookingId) return;
    try {
      await api.delete(`/api/booking/${bookingId}`);
      setReservations(prev => prev.filter(booking => booking._id !== bookingId));
      window.dispatchEvent(new CustomEvent('bookingDeleted', { detail: { bookingId } }));
    } catch (err) {
      console.error("Failed to delete booking:", err);
      showAlert("Delete Failed", "Failed to delete booking. Please try again.");
    } finally {
      setDeleteBookingDialog({ open: false, bookingId: null });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (!file.type.startsWith('image/')) {
        setPhotoUploadError("Please select a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoUploadError("Image file is too large. Please choose an image under 5MB.");
        return;
      }
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
        const photoUrl = (res as any).photo;
        const fullPhotoUrl = photoUrl.startsWith('http') ? photoUrl : `${api.defaults.baseURL}${photoUrl}`;
        setUserData((prev: any) => {
          const updatedData = { ...prev, photo: fullPhotoUrl || prev.photo || "" };
          try { localStorage.setItem("goldenNileUserData", JSON.stringify(updatedData)); } catch { }
          return updatedData;
        });
        // Update navbar cookie
        Cookies.set("goldenNileUserPhoto", fullPhotoUrl);
        setSelectedPhoto(null);
        setPhotoPreview(null);
        const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error("No photo URL returned from server");
      }
    } catch (err: any) {
      let errorMessage = "Failed to upload photo. Please try again.";
      setPhotoUploadError(errorMessage);
    } finally {
      setPhotoUploadLoading(false);
    }
  };

  const filteredItems = (): BizItem[] => {
    if (activeTab === "guesthouses")
      return guestHousesList.map((g) => ({ ...g, type: "guesthouse" }));
    if (activeTab === "restaurants")
      return restaurantsList.map((r) => ({ ...r, type: "restaurant" }));
    return [
      ...guestHousesList.map((g) => ({ ...g, type: "guesthouse" })),
      ...restaurantsList.map((r) => ({ ...r, type: "restaurant" })),
    ];
  };

  const confirmDelete = async () => {
    const { id, type } = deleteDialog;
    if (!id) return;
    try {
      await dispatch(deleteGuestHouse(id)).unwrap();
      if (type === "guesthouse") {
        setGuestHousesList(prev => prev.filter(item => item._id !== id));
      } else if (type === "restaurant") {
        setRestaurantsList(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error("Error deleting:", err);
      showAlert("Delete Failed", "Failed to delete place.");
    } finally {
      setDeleteDialog({ open: false, id: null, type: null });
    }
  };

  const handleEdit = (id: string, type: BizType) => {
    const item = [...guestHousesList, ...restaurantsList].find(item => item._id === id);
    if (item) {
      navigate("/add-business", {
        state: { editMode: true, businessData: item, editId: id, businessType: type }
      });
    }
  };

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const item = [...guestHousesList, ...restaurantsList].find(item => item._id === id);
      if (item?.type === "guesthouse" && item.rooms === 0 && !currentStatus) {
        showAlert("Cannot Open", "Cannot open a guest house with 0 rooms. Please add rooms first.");
        return;
      }
      await dispatch(updatePlace({ id, data: { isAvailable: !currentStatus } })).unwrap();
      setGuestHousesList(prev => prev.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
      setRestaurantsList(prev => prev.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
    } catch (err) {
      showAlert("Update Failed", "Failed to update availability");
    }
  };

  const handleScheduleClick = (id: string) => {
    showAlert("Coming Soon", "Schedule feature coming soon!");
  };

  const openImageCarousel = (placeId: string, images: string[]) => {
    setImageCarousel({ placeId, currentIndex: 0, images });
  };
  const closeImageCarousel = () => {
    setImageCarousel({ placeId: null, currentIndex: 0, images: [] });
  };
  const nextImage = () => {
    setImageCarousel(prev => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.images.length }));
  };
  const prevImage = () => {
    setImageCarousel(prev => ({ ...prev, currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1 }));
  };

  useEffect(() => {
    if (imageCarousel.placeId && imageCarousel.images.length > 1) {
      const interval = setInterval(() => nextImage(), 3000);
      return () => clearInterval(interval);
    }
  }, [imageCarousel.placeId, imageCarousel.currentIndex]);

  const renderTable = () => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Rooms/Cuisine</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems().map((item) => (
            <TableRow key={`${item.type}-${item._id}`}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {item.rating || 0}
                </div>
              </TableCell>
              <TableCell>
                {item.type === "guesthouse" ? (
                  <div>
                    <div>{item.rooms} rooms</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.breakfast && <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">Breakfast</span>}
                      {item.wifi && <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">WiFi</span>}
                      {item.airConditioning && <span className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded">AC</span>}
                    </div>
                  </div>
                ) : (
                  Array.isArray(item.cuisine) ? item.cuisine.join(", ") : item.cuisine || "N/A"
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${item.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {item.isAvailable ? "Available" : "Unavailable"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item._id, item.type as BizType)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleAvailability(item._id, item.isAvailable)}>
                    {item.isAvailable ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleScheduleClick(item._id)}>
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({ open: true, id: item._id, type: item.type as BizType })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  const renderCards = () => {
    const getImageUrl = (item: BizItem): string | null => {
      if (item.images) {
        if (Array.isArray(item.images) && item.images.length > 0) return item.images[0];
        if (typeof item.images === 'string') return item.images;
      }
      return item.image || null;
    };
    const getAllImages = (item: BizItem): string[] => {
      if (item.images) {
        if (Array.isArray(item.images)) return item.images;
        if (typeof item.images === 'string') return [item.images];
      }
      return item.image ? [item.image] : [];
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems().map((item) => {
          const imageUrl = getImageUrl(item);
          const allImages = getAllImages(item);
          return (
            <Card key={`${item.type}-${item._id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-muted group cursor-pointer">
                {imageUrl ? (
                  <>
                    <img
                      src={allImages[imageCarousel.placeId === item._id ? imageCarousel.currentIndex : 0] || imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {allImages.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); openImageCarousel(item._id, allImages); prevImage(); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openImageCarousel(item._id, allImages); nextImage(); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    {item.type === "guesthouse" ? <Building2 className="w-10 h-10" /> : <Utensils className="w-10 h-10" />}
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {item.type}
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.address}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Star fill="#FFD700" strokeWidth={0} /> {item.rating || 0}
                  <span className={`px-2 py-1 rounded-full text-xs ${item.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                {item.type === "guesthouse" && item.rooms && (
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p><Building2 className="w-4 h-4 inline mr-1" />{item.rooms} rooms</p>
                  </div>
                )}
                <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" onClick={() => handleEdit(item._id, item.type as BizType)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleAvailability(item._id, item.isAvailable)}>
                    {item.isAvailable ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({ open: true, id: item._id, type: item.type as BizType })}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
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
                      name={userData ? `${userData.firstName} ${userData.lastName}` : "Owner"}
                      alt="Owner"
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
                      <ShieldCheck className="w-3 h-3 mr-1" /> Owner Account
                    </Badge>
                  </div>

                  <div className="mb-6 text-left">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Profile Completion</span>
                      <span className="font-bold text-primary">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
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
                      <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
                    </button>
                    <button
                      onClick={() => setActiveTab("guesthouses")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "guesthouses"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <Building2 className="w-4 h-4" /> My Guesthouses
                    </button>
                    <button
                      onClick={() => setActiveTab("restaurants")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "restaurants"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <Utensils className="w-4 h-4" /> My Restaurants
                    </button>
                    <button
                      onClick={() => setActiveTab("reservations")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "reservations"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <Calendar className="w-4 h-4" /> Reservations
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className={`px-6 py-4 text-left transition-all border-l-4 flex items-center gap-3 ${activeTab === "settings"
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-transparent hover:bg-gray-50 text-gray-600"
                        }`}
                    >
                      <Settings className="w-4 h-4" /> Settings
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
                      <LogOut className="w-4 h-4" /> Log Out
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
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <Button onClick={() => navigate("/add-business")}>
                      <Plus className="w-4 h-4 mr-2" /> Add Business
                    </Button>
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
                          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Type</label>
                          <p className="font-medium text-gray-700 text-lg">Owner</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {(activeTab === "guesthouses" || activeTab === "restaurants") && (
                <div className="animate-fade-in space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {activeTab === "guesthouses" ? "My Guesthouses" : "My Restaurants"}
                    </h1>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === "cards" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("cards")}
                      >
                        <Grid className="w-4 h-4 mr-2" />
                        Cards
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                      >
                        <TableIcon className="w-4 h-4 mr-2" />
                        Table
                      </Button>
                      <Button onClick={() => navigate("/add-business")}>
                        <Plus className="w-4 h-4 mr-2" /> Add {activeTab === "guesthouses" ? "Guesthouse" : "Restaurant"}
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  {viewMode === "cards" ? renderCards() : renderTable()}
                </div>
              )}

              {activeTab === "reservations" && (
                <div className="animate-fade-in space-y-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Reservations</h1>
                  {reservationsLoading ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading reservations...</p>
                      </CardContent>
                    </Card>
                  ) : reservations.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No reservations yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Reservations will appear here once customers make bookings for your places.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {reservations.map((booking, index) => (
                        <Card
                          key={booking._id}
                          className="overflow-hidden hover:shadow-lg transition-shadow animate-slide-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold mb-2">{booking.place?.name || "Booking"}</h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getBookingStatus(booking.arrivalDate || "", booking.leavingDate || "", booking.place?.type || "guest_house", booking.bookingTime))}`}>
                                  {getStatusIcon(getBookingStatus(booking.arrivalDate || "", booking.leavingDate || "", booking.place?.type || "guest_house", booking.bookingTime))}
                                  <span>{getBookingStatus(booking.arrivalDate || "", booking.leavingDate || "", booking.place?.type || "guest_house", booking.bookingTime)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border">
                                    Payment: {booking.paymentStatus || "unpaid"}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setBookingModalOpen(true);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0">
                                <span className="text-2xl font-bold text-primary">${booking.totalPrice || "N/A"}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">{booking.memberNumber || "N/A"}</div>
                                  <div className="text-xs">{booking.place?.type === "restaurant" ? "Tables" : "Guests"}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium text-foreground">
                                    {booking.place?.type === "restaurant" && booking.bookingDay
                                      ? new Date(booking.bookingDay).toLocaleDateString()
                                      : booking.arrivalDate
                                        ? new Date(booking.arrivalDate).toLocaleDateString()
                                        : "N/A"}
                                  </div>
                                  <div className="text-xs">{booking.place?.type === "restaurant" ? "Reservation Date" : "Check-in"}</div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setDeleteBookingDialog({
                                    open: true,
                                    bookingId: booking._id,
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Booking
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="animate-fade-in space-y-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
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
              Complete information about this booking
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
                    <div className="mt-4 md:mt-0">
                      <span className="text-2xl font-bold text-primary">${selectedBooking.totalPrice || "N/A"}</span>
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
                            ? new Date(selectedBooking.bookingDay).toLocaleDateString()
                            : selectedBooking.arrivalDate
                              ? new Date(selectedBooking.arrivalDate).toLocaleDateString()
                              : "N/A"}
                        </div>
                        <div className="text-xs">{selectedBooking.place?.type === "restaurant" ? "Reservation Date" : "Check-in"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation for places */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, id: null, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this place and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation for bookings */}
      <AlertDialog
        open={deleteBookingDialog.open}
        onOpenChange={(open) => setDeleteBookingDialog({ open, bookingId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertModal.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertModal.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertModal((prev) => ({ ...prev, open: false }))}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </>
  );
};

export default OwnerDashboard;
