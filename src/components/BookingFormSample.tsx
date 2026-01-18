/**
 * Sample Booking Form Component (TypeScript)
 * Demonstrates how to use the EmailJS booking service
 * 
 * Usage:
 * <BookingFormSample placeType="guesthouse" placeName="Luxury Villa" />
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  sendBookingEmail,
  validateBookingData,
} from "@/services/emailService";
import { BookingEmailData, GuestHouseBookingData, RestaurantBookingData } from "@/types/booking";

interface BookingFormSampleProps {
  placeType: "guesthouse" | "restaurant";
  placeName: string;
  onSuccess?: () => void;
}

export const BookingFormSample: React.FC<BookingFormSampleProps> = ({
  placeType,
  placeName,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Common fields
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);

  // Guest House fields
  const [arrivalDate, setArrivalDate] = useState("");
  const [leaveDate, setLeaveDate] = useState("");

  // Restaurant fields
  const [reservationDay, setReservationDay] = useState("");
  const [reservationTime, setReservationTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      let bookingData: BookingEmailData;

      if (placeType === "guesthouse") {
        bookingData = {
          placeType: "guesthouse",
          placeName,
          userName,
          userEmail,
          phone,
          guests,
          arrivalDate,
          leaveDate,
        } as GuestHouseBookingData;
      } else {
        bookingData = {
          placeType: "restaurant",
          placeName,
          userName,
          userEmail,
          phone,
          guests,
          day: reservationDay,
          time: reservationTime,
        } as RestaurantBookingData;
      }

      // Validate booking data
      const validation = validateBookingData(bookingData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      // Send email
      const result = await sendBookingEmail(bookingData);

      if (result.success) {
        setSuccess(true);
        // Reset form
        setUserName("");
        setUserEmail("");
        setPhone("");
        setGuests(1);
        setArrivalDate("");
        setLeaveDate("");
        setReservationDay("");
        setReservationTime("");

        // Call callback
        onSuccess?.();

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(result.error || "Failed to send booking email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {placeType === "guesthouse" ? "Guest House" : "Restaurant"} Booking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div>
            <Label htmlFor="placeName">Place Name</Label>
            <Input
              id="placeName"
              value={placeName}
              disabled
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="userName">Your Name *</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="userEmail">Email *</Label>
            <Input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="john@example.com"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="guests">Number of Guests *</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              className="mt-1"
              required
            />
          </div>

          {/* Guest House Specific Fields */}
          {placeType === "guesthouse" && (
            <>
              <div>
                <Label htmlFor="arrivalDate">Arrival Date *</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="leaveDate">Leave Date *</Label>
                <Input
                  id="leaveDate"
                  type="date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </>
          )}

          {/* Restaurant Specific Fields */}
          {placeType === "restaurant" && (
            <>
              <div>
                <Label htmlFor="reservationDay">Reservation Day *</Label>
                <Input
                  id="reservationDay"
                  type="date"
                  value={reservationDay}
                  onChange={(e) => setReservationDay(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="reservationTime">Reservation Time *</Label>
                <Input
                  id="reservationTime"
                  type="time"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                ✓ Booking email sent successfully!
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Booking Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingFormSample;
