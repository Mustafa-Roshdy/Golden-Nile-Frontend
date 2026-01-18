import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Calendar, Users, Home, MapPin } from 'lucide-react';
import { bookingApi, CreateBookingData } from '@/services/api';
import { toast } from 'sonner';

const mockPlaces = [
  { _id: 'luxor', name: 'Luxor Temple', address: 'Luxor, Egypt', type: 'Historical' },
  { _id: 'aswan', name: 'Aswan Nile View', address: 'Aswan, Egypt', type: 'Cruise' },
];
import { useAuth } from '@/context/AuthContext';

interface BookingFormProps {
  onBookingCreated: () => void;
}

export const BookingForm = ({ onBookingCreated }: BookingFormProps) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [formData, setFormData] = useState<CreateBookingData>({
    arrivalDate: '',
    leavingDate: '',
    memberNumber: 1,
    roomNumber: undefined,
    place: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.arrivalDate) {
      newErrors.arrivalDate = 'Arrival date is required';
    }
    if (!formData.leavingDate) {
      newErrors.leavingDate = 'Leaving date is required';
    }
    if (formData.arrivalDate && formData.leavingDate) {
      if (new Date(formData.leavingDate) <= new Date(formData.arrivalDate)) {
        newErrors.leavingDate = 'Leaving date must be after arrival date';
      }
    }
    if (!formData.memberNumber || formData.memberNumber < 1) {
      newErrors.memberNumber = 'At least 1 member is required';
    }
    if (!formData.place) {
      newErrors.place = 'Please select a place';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      await bookingApi.createBooking(formData);
      toast.success('Booking created successfully!');
      setFormData({
        arrivalDate: '',
        leavingDate: '',
        memberNumber: 1,
        roomNumber: undefined,
        place: '',
      });
      setErrors({});
      onBookingCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
<Card className="p-8 md:p-10 bg-white text-gray-900 shadow-lg border border-gray-200 rounded-2xl transition-all duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-transparent rounded-full blur-3xl -z-0"></div>
      <div className="relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
            Book Your Egyptian Adventure
          </h2>
          <p className="text-muted-foreground text-lg">Discover the wonders of Luxor and Aswan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Arrival Date */}
            <div className="space-y-2">
              <Label htmlFor="arrivalDate" className="text-foreground flex items-center gap-2 font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                Arrival Date
              </Label>
              <Input
                id="arrivalDate"
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="border-input bg-background hover:border-primary/50 transition-colors h-12"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.arrivalDate && (
                <p className="text-sm text-destructive font-medium">{errors.arrivalDate}</p>
              )}
            </div>

            {/* Leaving Date */}
            <div className="space-y-2">
              <Label htmlFor="leavingDate" className="text-foreground flex items-center gap-2 font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                Leaving Date
              </Label>
              <Input
                id="leavingDate"
                type="date"
                value={formData.leavingDate}
                onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                className="border-input bg-background hover:border-primary/50 transition-colors h-12"
                min={formData.arrivalDate || new Date().toISOString().split('T')[0]}
              />
              {errors.leavingDate && (
                <p className="text-sm text-destructive font-medium">{errors.leavingDate}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Number of Members */}
            <div className="space-y-2">
              <Label htmlFor="memberNumber" className="text-foreground flex items-center gap-2 font-semibold">
                <Users className="w-4 h-4 text-primary" />
                Number of Guests
              </Label>
              <Input
                id="memberNumber"
                type="number"
                min="1"
                value={formData.memberNumber}
                onChange={(e) => setFormData({ ...formData, memberNumber: parseInt(e.target.value) || 1 })}
                className="border-input bg-background hover:border-primary/50 transition-colors h-12"
              />
              {errors.memberNumber && (
                <p className="text-sm text-destructive font-medium">{errors.memberNumber}</p>
              )}
            </div>

            {/* Room Number (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="roomNumber" className="text-foreground flex items-center gap-2 font-semibold">
                <Home className="w-4 h-4 text-primary" />
                Room Number <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
              </Label>
              <Input
                id="roomNumber"
                type="number"
                min="1"
                value={formData.roomNumber || ''}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                className="border-input bg-background hover:border-primary/50 transition-colors h-12"
                placeholder="Auto-assign if empty"
              />
            </div>
          </div>

          {/* Place Selection */}
          <div className="space-y-2">
            <Label htmlFor="place" className="text-foreground font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Select Destination
            </Label>
            <Select
              value={formData.place}
              onValueChange={(value) => setFormData({ ...formData, place: value })}
            >
              <SelectTrigger className="border-input bg-background hover:border-primary/50 transition-colors h-12">
                <SelectValue placeholder="Choose your destination in Egypt" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {mockPlaces.map((place) => (
                  <SelectItem key={place._id} value={place._id} className="cursor-pointer">
                    <div className="flex flex-col py-1">
                      <span className="font-semibold">{place.name}</span>
                      <span className="text-xs text-muted-foreground">{place.address} • {place.type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.place && (
              <p className="text-sm text-destructive font-medium">{errors.place}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
  className="w-full bg-blue-600 text-white font-semibold py-6 text-lg rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 mt-8"
          >
            {loading ? 'Creating Your Reservation...' : 'Confirm Booking'}
          </Button>
        </form>
      </div>
    </Card>
  );
};
