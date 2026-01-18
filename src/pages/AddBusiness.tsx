import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Upload, X, Edit3, CheckCircle, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/store";
import { addGuestHouse, updatePlace } from "@/Redux/Slices/guestHouseSlice";
import { addRestaurant, updateRestaurant } from "@/Redux/Slices/restaurantSlice";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const LocationSelector: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number] | null;
  onError?: (message: string) => void;
}> = ({ onLocationSelect, initialPosition, onError }) => {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLng, setManualLng] = useState<string>('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation([lat, lng]);
          if (!position && !initialPosition) {
            setPosition([lat, lng]);
            onLocationSelect(lat, lng);
          }
        },
        (error) => console.error('Error getting current location:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (position) {
      setManualLat(position[0].toString());
      setManualLng(position[1].toString());
    }
  }, [position]);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      },
    });
    return null;
  };

  const MapController = () => {
    const map = useMap();

    useEffect(() => {
      // Enable scroll wheel zoom
      map.scrollWheelZoom.enable();
    }, [map]);

    return null;
  };

  const handleManualLatChange = (value: string) => {
    setManualLat(value);
    const lat = parseFloat(value);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    }
  };

  const handleManualLngChange = (value: string) => {
    setManualLng(value);
    const lat = parseFloat(manualLat);
    const lng = parseFloat(value);
    if (!isNaN(lat) && !isNaN(lng)) {
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      // Show loading state or feedback
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          onLocationSelect(lat, lng);
          // Update manual inputs
          setManualLat(lat.toString());
          setManualLng(lng.toString());
        },
        (error) => {
          console.error('Error getting current location:', error);
          // Could show user-friendly error message
          onError?.('Unable to get your current location. Please check your browser permissions and try again.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      onError?.('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <label className="block text-sm font-medium">Select Location on Map</label>

      {/* Manual Coordinate Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
          <input
            type="number"
            step="0.00000000000000000001"
            value={manualLat}
            onChange={(e) => handleManualLatChange(e.target.value)}
            placeholder="Enter latitude"
            className="w-full border-2 border-[#b0892f]/30 rounded-xl p-2 text-sm focus:ring-2 focus:ring-[#b0892f]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
          <input
            type="number"
            step="0.00000000000000000001"
            value={manualLng}
            onChange={(e) => handleManualLngChange(e.target.value)}
            placeholder="Enter longitude"
            className="w-full border-2 border-[#b0892f]/30 rounded-xl p-2 text-sm focus:ring-2 focus:ring-[#b0892f]"
          />
        </div>
      </div>

      {/* Current Location Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={getCurrentLocation}
        className="border-[#b0892f]/30 text-[#b0892f] hover:bg-[#b0892f] hover:text-white"
      >
        Use Current Location
      </Button>

      {/* Map */}
      <div className="relative">
        <MapContainer
          center={position || currentLocation || [30.0444, 31.2357]}
          zoom={position || currentLocation ? 15 : 6}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
          <MapController />
          {position && <Marker position={position} />}
        </MapContainer>

        {/* Map Instructions */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-gray-600 max-w-xs">
          <p className="font-medium mb-1">How to select location:</p>
          <ul className="space-y-1">
            <li>• Click on the map</li>
            <li>• Use scroll wheel to zoom</li>
            <li>• Drag to move around</li>
            <li>• Or enter coordinates above</li>
          </ul>
        </div>
      </div>

      {position && (
        <div className="bg-[#f8f4ec] rounded-xl p-3 border border-[#b0892f]/20">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Selected Location:</span> Lat {position[0].toFixed(6)}, Lng {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

const AddBusiness: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading: guestHouseLoading, error: guestHouseError } = useSelector((state: RootState) => state.guestHouse);
  const { loading: restaurantLoading, error: restaurantError } = useSelector((state: RootState) => state.restaurant);

  const state = location.state as { editMode?: boolean; businessData?: any; editId?: string; businessType?: "guesthouse" | "restaurant" } | undefined;

  const editMode = state?.editMode ?? false;
  const editId = state?.editId ?? null;
  const businessData = state?.businessData;
  const initialType = state?.businessType ?? "guesthouse";
  const [businessType, setBusinessType] = useState<"guesthouse" | "restaurant">(initialType);

  const loading = businessType === "guesthouse" ? guestHouseLoading : restaurantLoading;
  const error = businessType === "guesthouse" ? guestHouseError : restaurantError;
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  const [locationError, setLocationError] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const showLocationError = (message: string) => {
    setLocationError({ open: true, message });
  };

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    governorate: "",
    rooms: "",
    cuisine: [] as string[],
    description: "",
    images: [] as File[],
    breakfast: false,
    wifi: false,
    airConditioning: false,
    latitude: 0,
    longitude: 0,
    pricePerNight: "",
    pricePerTable: "",
    chairsPerTable: "",
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  // Populate form data if in edit mode
  useEffect(() => {
    try {
      if (editMode && businessData) {
        setFormData({
          name: businessData.name || "",
          address: businessData.address || "",
          governorate: businessData.governorate || "",
          rooms: businessData.rooms?.toString() || "",
          cuisine: Array.isArray(businessData.cuisine) ? businessData.cuisine : businessData.cuisine ? [businessData.cuisine] : [],
          description: businessData.description || "",
          images: [], // Don't populate files in edit mode, backend handles existing images
          breakfast: businessData.breakfast || false,
          wifi: businessData.wifi || false,
          airConditioning: businessData.airConditioning || false,
          latitude: businessData.latitude || 0,
          longitude: businessData.longitude || 0,
          pricePerNight: businessData.pricePerNight?.toString() || "",
          pricePerTable: businessData.pricePerTable?.toString() || "",
          chairsPerTable: businessData.chairsPerTable?.toString() || "",
        });
        setImagePreviews(Array.isArray(businessData.images) ? businessData.images : businessData.images ? [businessData.images] : []);
        setBusinessType(businessData.type === "guest_house" ? "guesthouse" : "restaurant");
        if (businessData.latitude && businessData.longitude) {
          setSelectedPosition([businessData.latitude, businessData.longitude]);
        }
      }
    } catch (error) {
      console.error("Error populating form data:", error);
      setDialog({
        open: true,
        type: "error",
        message: "Error loading existing data. Please refresh the page and try again.",
      });
    }
  }, [editMode, businessData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    try {
      const { name, value } = e.target;

      // Trim value for string fields except description, address, and name
      let processedValue = value;
      if (typeof value === 'string' && name !== 'description' && name !== 'address' && name !== 'name') {
        processedValue = value.trim();
      }

      // Validate input length
      if (processedValue.length > 1000) {
        setDialog({
          open: true,
          type: "error",
          message: "Input text is too long. Please keep it under 1000 characters.",
        });
        return;
      }

      // Validate phone number format
      // if (name === 'phone' && processedValue && !/^[0-9]{7,15}$/.test(processedValue)) {
      //   setDialog({
      //     open: true,
      //     type: "error",
      //     message: "Phone number must contain only digits (7–15 digits)",
      //   });
      //   return;
      // }

      // Validate rooms is a positive number
      if (name === 'rooms' && processedValue && (isNaN(Number(processedValue)) || Number(processedValue) < 1)) {
        setDialog({
          open: true,
          type: "error",
          message: "Number of rooms must be a positive number.",
        });
        return;
      }

      setFormData({ ...formData, [name]: processedValue });
    } catch (error) {
      console.error("Error in handleChange:", error);
      setDialog({
        open: true,
        type: "error",
        message: "An error occurred while updating the form. Please try again.",
      });
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      const currentImageCount = formData.images.length + imagePreviews.length;

      if (currentImageCount + files.length > 10) {
        setDialog({
          open: true,
          type: "error",
          message: `You can only upload up to 10 images. You currently have ${currentImageCount} images.`,
        });
        return;
      }

      if (currentImageCount + files.length < 1) {
        setDialog({
          open: true,
          type: "error",
          message: "You must upload at least 1 image.",
        });
        return;
      }

      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      let hasError = false;

      files.forEach((file, index) => {
        try {
          // Validate file type
          if (!file.type.startsWith('image/')) {
            setDialog({
              open: true,
              type: "error",
              message: `File "${file.name}" is not an image. Please select only image files.`,
            });
            hasError = true;
            return;
          }

          // Validate file size (5MB max per image)
          if (file.size > 5 * 1024 * 1024) {
            setDialog({
              open: true,
              type: "error",
              message: `File "${file.name}" is too large. Each image must be less than 5MB.`,
            });
            hasError = true;
            return;
          }

          // Validate file name and basic properties
          if (!file.name || file.size === 0) {
            setDialog({
              open: true,
              type: "error",
              message: `File "${file.name || 'Unknown file'}" appears to be corrupted or empty.`,
            });
            hasError = true;
            return;
          }

          newFiles.push(file);
          const reader = new FileReader();

          reader.onerror = () => {
            setDialog({
              open: true,
              type: "error",
              message: `Failed to read file "${file.name}". Please try again.`,
            });
            hasError = true;
          };

          reader.onload = (event) => {
            try {
              if (event.target?.result) {
                newPreviews.push(event.target.result as string);
                if (newPreviews.length === newFiles.length && !hasError) {
                  setImagePreviews(prev => [...prev, ...newPreviews]);
                }
              } else {
                setDialog({
                  open: true,
                  type: "error",
                  message: `Failed to process file "${file.name}". Please try again.`,
                });
                hasError = true;
              }
            } catch (error) {
              console.error("Error processing file:", error);
              setDialog({
                open: true,
                type: "error",
                message: `Error processing file "${file.name}". Please try again.`,
              });
              hasError = true;
            }
          };

          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Error handling file:", error);
          setDialog({
            open: true,
            type: "error",
            message: `Error processing file "${file.name || 'Unknown file'}". Please try again.`,
          });
          hasError = true;
        }
      });

      if (!hasError && newFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newFiles],
        }));
      }
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      setDialog({
        open: true,
        type: "error",
        message: "An unexpected error occurred while uploading images. Please try again.",
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    try {
      if (index < 0 || index >= formData.images.length) {
        setDialog({
          open: true,
          type: "error",
          message: "Invalid image index. Please try again.",
        });
        return;
      }

      const updatedImages = [...formData.images];
      const updatedPreviews = [...imagePreviews];
      updatedImages.splice(index, 1);
      updatedPreviews.splice(index, 1);
      setFormData({ ...formData, images: updatedImages });
      setImagePreviews(updatedPreviews);
    } catch (error) {
      console.error("Error removing image:", error);
      setDialog({
        open: true,
        type: "error",
        message: "Failed to remove image. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        setDialog({
          open: true,
          type: "error",
          message: "Please enter a valid name.",
        });
        return;
      }

      if (!formData.address?.trim()) {
        setDialog({
          open: true,
          type: "error",
          message: "Please enter a valid address.",
        });
        return;
      }

      if (!formData.governorate) {
        setDialog({
          open: true,
          type: "error",
          message: "Please select a governorate.",
        });
        return;
      }

      if (formData.latitude === 0 || formData.longitude === 0) {
        setDialog({
          open: true,
          type: "error",
          message: "Please select a location on the map.",
        });
        return;
      }


      if (businessType === "guesthouse") {
        if (!formData.rooms || Number(formData.rooms) < 1) {
          setDialog({
            open: true,
            type: "error",
            message: "Please specify a valid number of rooms (minimum 1).",
          });
          return;
        }
      }

      if (businessType === "restaurant") {
        if (!formData.cuisine || formData.cuisine.length === 0) {
          setDialog({
            open: true,
            type: "error",
            message: "Please specify at least one cuisine type for restaurants.",
          });
          return;
        }

        if (!formData.chairsPerTable || Number(formData.chairsPerTable) < 1) {
          setDialog({
            open: true,
            type: "error",
            message: "Please specify chairs per table (minimum 1).",
          });
          return;
        }
      }

      const totalImages = formData.images.length + (editMode ? imagePreviews.length : 0);
      if (totalImages < 1) {
        setDialog({
          open: true,
          type: "error",
          message: "Please upload at least 1 image.",
        });
        return;
      }

      if (totalImages > 10) {
        setDialog({
          open: true,
          type: "error",
          message: "You can upload a maximum of 10 images.",
        });
        return;
      }

      // Validate form data integrity
      if (formData.name.length > 100) {
        setDialog({
          open: true,
          type: "error",
          message: "Name must be at most 100 characters long.",
        });
        return;
      }

      if (formData.address.length > 200) {
        setDialog({
          open: true,
          type: "error",
          message: "Address must be at most 200 characters long.",
        });
        return;
      }

      if (formData.description && formData.description.length > 500) {
        setDialog({
          open: true,
          type: "error",
          message: "Description cannot exceed 500 characters.",
        });
        return;
      }
    } catch (validationError) {
      console.error("Validation error:", validationError);
      setDialog({
        open: true,
        type: "error",
        message: "An error occurred during validation. Please check your inputs and try again.",
      });
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      try {
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('address', formData.address.trim());
        formDataToSend.append('governorate', formData.governorate);
        // formDataToSend.append('phone', formData.phone.trim());
        formDataToSend.append('description', formData.description?.trim() || '');
        formDataToSend.append('latitude', formData.latitude.toString());
        formDataToSend.append('longitude', formData.longitude.toString());
        formDataToSend.append('type', businessType === "guesthouse" ? "guest_house" : "restaurant");

        if (businessType === "guesthouse") {
          formDataToSend.append('pricePerNight', formData.pricePerNight);
        } else {
          formDataToSend.append('pricePerTable', formData.pricePerTable);
        }

        if (businessType === "guesthouse") {
          formDataToSend.append('rooms', formData.rooms);
          // Send boolean values as strings for FormData compatibility
          formDataToSend.append('breakfast', formData.breakfast.toString());
          formDataToSend.append('wifi', formData.wifi.toString());
          formDataToSend.append('airConditioning', formData.airConditioning.toString());
        }

        if (businessType === "restaurant" && formData.cuisine.length > 0) {
          formData.cuisine.forEach(cuisine => {
            if (cuisine.trim()) {
              formDataToSend.append('cuisine', cuisine.trim());
            }
          });
        }

        if (businessType === "restaurant") {
          formDataToSend.append('chairsPerTable', formData.chairsPerTable);
        }

        // Append images as files with error checking
        formData.images.forEach((file, index) => {
          if (file && file.size > 0) {
            formDataToSend.append('images', file);
          } else {
            throw new Error(`Invalid image file at index ${index}`);
          }
        });
      } catch (formDataError) {
        console.error("Error creating form data:", formDataError);
        setDialog({
          open: true,
          type: "error",
          message: "Error preparing data for submission. Please check your inputs and try again.",
        });
        return;
      }

      // Dispatch appropriate action based on mode and type
      try {
        let newPlaceId = null;
        if (editMode && editId) {
          if (businessType === "restaurant") {
            await dispatch(updateRestaurant({ id: editId, data: formDataToSend })).unwrap();
          } else {
            await dispatch(updatePlace({ id: editId, data: formDataToSend })).unwrap();
          }
          setDialog({
            open: true,
            type: "success",
            message: "Place updated successfully!",
          });
          // Dispatch event for place update
          window.dispatchEvent(new CustomEvent('placeUpdated', {
            detail: { placeId: editId }
          }));
        } else {
          let result;
          if (businessType === "restaurant") {
            result = await dispatch(addRestaurant(formDataToSend)).unwrap();
          } else {
            result = await dispatch(addGuestHouse(formDataToSend)).unwrap();
          }
          newPlaceId = result._id;
          setDialog({
            open: true,
            type: "success",
            message: "Place added successfully!",
          });
          // Dispatch event for place creation
          window.dispatchEvent(new CustomEvent('placeCreated', {
            detail: { placeId: newPlaceId }
          }));
        }
      } catch (apiError: any) {
        console.error("API Error:", apiError);

        // Handle different types of API errors
        let errorMessage = "Failed to save place. Please try again.";

        if (apiError?.response) {
          const status = apiError.response.status;
          const data = apiError.response.data;

          switch (status) {
            case 400:
              errorMessage = data?.message || "Invalid data provided. Please check your inputs.";
              break;
            case 401:
              errorMessage = "You are not authorized to perform this action. Please log in again.";
              break;
            case 403:
              errorMessage = "You don't have permission to perform this action.";
              break;
            case 404:
              errorMessage = "The requested resource was not found.";
              break;
            case 413:
              errorMessage = "Files are too large. Please reduce file sizes and try again.";
              break;
            case 422:
              errorMessage = data?.message || "Validation failed. Please check your inputs.";
              break;
            case 500:
              errorMessage = data?.message || "Server error. Please try again later.";
              break;
            default:
              errorMessage = data?.message || apiError.message || errorMessage;
          }
        } else if (apiError?.request) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = apiError?.message || errorMessage;
        }

        setDialog({
          open: true,
          type: "error",
          message: errorMessage,
        });
      }
    } catch (unexpectedError) {
      console.error("Unexpected error in handleSubmit:", unexpectedError);
      setDialog({
        open: true,
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-br from-[#f8f4ec] via-white to-[#fef9f0] pt-20 sm:pt-24 pb-12 sm:pb-16 flex items-center justify-center px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="shadow-2xl border-2 border-[#b0892f]/20 overflow-hidden backdrop-blur-sm bg-white/95">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#8a6d28] via-[#b0892f] to-[#9a792a] p-6 sm:p-8 text-center relative overflow-hidden">
              <h2 className="text-3xl font-bold text-white mb-2">
                  {editMode ? `Edit ${businessType}` : `Add New ${businessType}`}
                </h2>
              <p className="text-[#f8f4ec] text-sm">
                Fill in the details to list your establishment
              </p>
            </div>

            <CardContent className="p-4 sm:p-6 md:p-10">
              <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-[#f8f4ec] rounded-2xl border-2 border-[#b0892f]/30 p-2">
                <Button
                  type="button"
                  onClick={() => setBusinessType("guesthouse")}
                  disabled={editMode}
                  className={`w-full sm:flex-1 py-4 rounded-xl font-bold ${
                    businessType === "guesthouse"
                      ? "bg-[#b0892f] text-white"
                      : "text-[#b0892f] bg-[#fff]"
                  } ${editMode ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  Guesthouse
                </Button>
                <Button
                  type="button"
                  onClick={() => setBusinessType("restaurant")}
                  disabled={editMode}
                  className={`w-full sm:flex-1 py-4 rounded-xl font-bold ${
                    businessType === "restaurant"
                      ? "bg-[#b0892f] text-white"
                      : "text-[#b0892f] bg-[#fff]"
                  } ${editMode ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  Restaurant
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                    />
                    <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0892f]" />
                  </div>

                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                  />

                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                  >
                    <option value="">Select Governorate</option>
                    <option value="aswan">Aswan</option>
                    <option value="luxor">Luxor</option>
                  </select>

                  <LocationSelector
                    onLocationSelect={(lat, lng) => {
                      setFormData({ ...formData, latitude: lat, longitude: lng });
                      setSelectedPosition([lat, lng]);
                    }}
                    initialPosition={selectedPosition}
                    onError={(message) => setLocationError({ open: true, message })}
                  />

                  {/* <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                  /> */}


                  {businessType === "guesthouse" && (
                    <>
                      <input
                        type="number"
                        name="rooms"
                        placeholder="Number of Rooms (minimum 1)"
                        value={formData.rooms}
                        onChange={handleChange}
                        min={1}
                        required
                        className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                      />

                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.breakfast}
                            onCheckedChange={(checked) => setFormData({ ...formData, breakfast: checked as boolean })}
                          />
                          <span className="text-sm font-medium">Breakfast Available</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.wifi}
                            onCheckedChange={(checked) => setFormData({ ...formData, wifi: checked as boolean })}
                          />
                          <span className="text-sm font-medium">WiFi Available</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.airConditioning}
                            onCheckedChange={(checked) => setFormData({ ...formData, airConditioning: checked as boolean })}
                          />
                          <span className="text-sm font-medium">Air Conditioning Available</span>
                        </label>
                      </div>

                      <input
                        type="number"
                        name="pricePerNight"
                        placeholder="Price per Night (USD)"
                        value={formData.pricePerNight}
                        onChange={handleChange}
                        min={0}
                        step="0.01"
                        required
                        className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                      />
                    </>
                  )}

                  {businessType === "restaurant" && (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.cuisine.map((cuisine, index) => (
                          <span
                            key={index}
                            className="bg-[#b0892f] text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {cuisine}
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  const updated = [...formData.cuisine];
                                  updated.splice(index, 1);
                                  setFormData({ ...formData, cuisine: updated });
                                } catch (error) {
                                  console.error("Error removing cuisine:", error);
                                  setDialog({
                                    open: true,
                                    type: "error",
                                    message: "Failed to remove cuisine type. Please try again.",
                                  });
                                }
                              }}
                              className="text-white hover:text-red-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add cuisine type (press Enter to add)"
                        onKeyDown={(e) => {
                          try {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = (e.target as HTMLInputElement).value.trim();
                              if (value) {
                                if (formData.cuisine.includes(value)) {
                                  setDialog({
                                    open: true,
                                    type: "error",
                                    message: "This cuisine type is already added.",
                                  });
                                  return;
                                }
                                if (formData.cuisine.length >= 10) {
                                  setDialog({
                                    open: true,
                                    type: "error",
                                    message: "You can add a maximum of 10 cuisine types.",
                                  });
                                  return;
                                }
                                setFormData({
                                  ...formData,
                                  cuisine: [...formData.cuisine, value]
                                });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          } catch (error) {
                            console.error("Error adding cuisine:", error);
                            setDialog({
                              open: true,
                              type: "error",
                              message: "Failed to add cuisine type. Please try again.",
                            });
                          }
                        }}
                        className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                      />

                      <input
                        type="number"
                        name="pricePerTable"
                        placeholder="Price per Table (USD)"
                        value={formData.pricePerTable}
                        onChange={handleChange}
                        min={0}
                        step="0.01"
                        required
                        className="w-full border-2 mt-5 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                      />

                      <input
                        type="number"
                        name="chairsPerTable"
                        placeholder="Chairs per Table (minimum 1)"
                        value={formData.chairsPerTable}
                        onChange={handleChange}
                        min={1}
                        required
                        className="w-full border-2 mt-5 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                      />
                    </div>
                  )}

                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border-2 border-[#b0892f]/30 rounded-xl p-3 focus:ring-2 focus:ring-[#b0892f]"
                  />

                  {/* Image Upload */}
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex items-center justify-center gap-2 bg-[#f8f4ec] text-[#b0892f] px-6 py-4 rounded-xl border-2 border-[#b0892f]/30"
                    >
                      <Upload className="w-5 h-5" />
                      Choose Images
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {imagePreviews.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img}
                              alt={`Preview ${index}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-5 bg-[#b0892f] text-white rounded-xl font-bold hover:bg-[#9a792a]"
                  >
                    {loading ? "Saving..." : editMode ? "Save Changes" : "Add Business"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      try {
                        navigate("/owner-dashboard");
                      } catch (error) {
                        console.error("Navigation error:", error);
                        setDialog({
                          open: true,
                          type: "error",
                          message: "Failed to navigate. Please try again.",
                        });
                      }
                    }}
                    className="px-10 py-5 border-2 border-[#b0892f]/40 text-[#b0892f] rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>

              {error && <p className="text-red-500 text-center mt-4">{error}</p>}

              {/* Success/Error Dialog */}
              <AlertDialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      {dialog.type === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {dialog.type === "success" ? "Success" : "Error"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>{dialog.message}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={() => {
                        try {
                          setDialog({ ...dialog, open: false });
                          if (dialog.type === "success") {
                            navigate("/owner-dashboard");
                          }
                        } catch (error) {
                          console.error("Dialog action error:", error);
                          setDialog({
                            open: true,
                            type: "error",
                            message: "An error occurred. Please refresh the page.",
                          });
                        }
                      }}
                    >
                      {dialog.type === "success" ? "Continue" : "Try Again"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Location Error Dialog */}
              <AlertDialog open={locationError.open} onOpenChange={(open) => setLocationError({ open, message: "" })}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      Location Error
                    </AlertDialogTitle>
                    <AlertDialogDescription>{locationError.message}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={() => setLocationError({ open: false, message: "" })}
                    >
                      OK
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default AddBusiness;