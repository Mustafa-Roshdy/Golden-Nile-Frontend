import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Home } from 'lucide-react';
import { Booking, bookingApi, mockPlaces, CreateBookingData } from '@/services/api';
import { toast } from 'sonner';

interface EditBookingModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
}

export const EditBookingModal = ({ booking, open, onOpenChange, onBookingUpdated }: EditBookingModalProps) => {
  const [formData, setFormData] = useState<Partial<CreateBookingData>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (booking) {
      setFormData({
        arrivalDate: booking.arrivalDate.split('T')[0],
        leavingDate: booking.leavingDate.split('T')[0],
        memberNumber: booking.memberNumber,
        roomNumber: booking.roomNumber,
        place: typeof booking.place === 'string' ? booking.place : booking.place._id,
      });
    }
  }, [booking]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.arrivalDate && formData.leavingDate) {
      if (new Date(formData.leavingDate) <= new Date(formData.arrivalDate)) {
        newErrors.leavingDate = 'Leaving date must be after arrival date';
      }
    }
    if (formData.memberNumber && formData.memberNumber < 1) {
      newErrors.memberNumber = 'At least 1 member is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking?._id || !validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      await bookingApi.updateBooking(booking._id, formData);
      toast.success('Booking updated successfully!');
      onOpenChange(false);
      onBookingUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Edit Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Arrival Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-arrivalDate" className="text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Arrival Date
              </Label>
              <Input
                id="edit-arrivalDate"
                type="date"
                value={formData.arrivalDate || ''}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="border-input bg-background"
              />
              {errors.arrivalDate && (
                <p className="text-sm text-destructive">{errors.arrivalDate}</p>
              )}
            </div>

            {/* Leaving Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-leavingDate" className="text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Leaving Date
              </Label>
              <Input
                id="edit-leavingDate"
                type="date"
                value={formData.leavingDate || ''}
                onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                className="border-input bg-background"
              />
              {errors.leavingDate && (
                <p className="text-sm text-destructive">{errors.leavingDate}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Number of Members */}
            <div className="space-y-2">
              <Label htmlFor="edit-memberNumber" className="text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Number of Members
              </Label>
              <Input
                id="edit-memberNumber"
                type="number"
                min="1"
                value={formData.memberNumber || 1}
                onChange={(e) => setFormData({ ...formData, memberNumber: parseInt(e.target.value) || 1 })}
                className="border-input bg-background"
              />
              {errors.memberNumber && (
                <p className="text-sm text-destructive">{errors.memberNumber}</p>
              )}
            </div>

            {/* Room Number */}
            <div className="space-y-2">
              <Label htmlFor="edit-roomNumber" className="text-foreground flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                Room Number (Optional)
              </Label>
              <Input
                id="edit-roomNumber"
                type="number"
                min="1"
                value={formData.roomNumber || ''}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                className="border-input bg-background"
                placeholder="Leave empty for auto-assign"
              />
            </div>
          </div>

          {/* Place Selection */}
          <div className="space-y-2">
            <Label htmlFor="edit-place" className="text-foreground">Place</Label>
            <Select
              value={formData.place}
              onValueChange={(value) => setFormData({ ...formData, place: value })}
            >
              <SelectTrigger className="border-input bg-background">
                <SelectValue placeholder="Choose a place" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {mockPlaces.map((place) => (
                  <SelectItem key={place._id} value={place._id}>
                    {place.name} - {place.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--gradient-primary)] hover:opacity-90 transition-opacity text-primary-foreground font-semibold"
            >
              {loading ? 'Updating...' : 'Update Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
