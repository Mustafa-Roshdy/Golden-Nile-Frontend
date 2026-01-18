import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Home, MapPin, Edit, Trash2 } from 'lucide-react';
import { Booking, Place } from '@/services/api';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

export const BookingCard = ({ booking, onEdit, onDelete }: BookingCardProps) => {
  const place = booking.place as Place;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
<Card className="p-6 bg-white text-gray-900 shadow-md border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent rounded-full blur-2xl"></div>
      <div className="space-y-4 relative z-10">
        {/* Place Info */}
        <div className="pb-4 border-b border-border/50">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
            {place.name || 'Unknown Place'}
          </h3>
          {place.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              {place.address}
            </p>
          )}
          {place.type && (
            <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
              {place.type}
            </span>
          )}
        </div>

        {/* Booking Details */}
        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Check-in</p>
              <p className="font-bold text-foreground">{formatDate(booking.arrivalDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Check-out</p>
              <p className="font-bold text-foreground">{formatDate(booking.leavingDate)}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Guests</p>
              <p className="font-bold text-foreground">{booking.memberNumber} {booking.memberNumber === 1 ? 'Guest' : 'Guests'}</p>
            </div>
          </div>
          
          {booking.roomNumber && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 rounded-lg bg-primary/10">
                <Home className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Room Number</p>
                <p className="font-bold text-foreground">#{booking.roomNumber}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(booking)}
  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 border-none transition-all duration-200 font-semibold"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(booking._id!)}
  className="flex-1 bg-red-600 text-white hover:bg-red-700 border-none transition-all duration-200 font-semibold"
          >
            <Trash2 className="w-4 h-4 mr-2"/>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
