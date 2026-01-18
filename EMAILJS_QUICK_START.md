# EmailJS Quick Start - Copy & Paste Examples

Ready-to-use code snippets for common scenarios.

---

## 🚀 Installation

```bash
npm install emailjs-com
```

---

## 🌍 Environment Setup

**`.env.local`:**
```env
VITE_EMAILJS_SERVICE_ID=service_your_id
VITE_EMAILJS_TEMPLATE_ID=template_your_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 💡 Example 1: Send Guest House Booking Email

```typescript
import { sendBookingEmail } from "@/services/emailService";
import { GuestHouseBookingData } from "@/types/booking";

async function sendGuestHouseConfirmation() {
  const booking: GuestHouseBookingData = {
    placeType: "guesthouse",
    placeName: "The Pharaoh Suite",
    userName: "Ahmed Mohamed",
    userEmail: "ahmed@example.com",
    phone: "+20 100 123 4567",
    guests: 3,
    arrivalDate: "2025-12-28",
    leaveDate: "2025-12-31",
  };

  const result = await sendBookingEmail(booking);
  
  if (result.success) {
    console.log("✓ Email sent! Message ID:", result.messageId);
    alert("Confirmation email sent successfully!");
  } else {
    console.error("✗ Failed:", result.error);
    alert("Failed to send email: " + result.error);
  }
}
```

---

## 💡 Example 2: Send Restaurant Booking Email

```typescript
import { sendBookingEmail } from "@/services/emailService";
import { RestaurantBookingData } from "@/types/booking";

async function sendRestaurantConfirmation() {
  const booking: RestaurantBookingData = {
    placeType: "restaurant",
    placeName: "Nile River Fine Dining",
    userName: "Fatima Hassan",
    userEmail: "fatima@example.com",
    phone: "+20 100 987 6543",
    guests: 6,
    day: "2025-12-28",
    time: "19:30",
  };

  const result = await sendBookingEmail(booking);
  
  if (result.success) {
    console.log("✓ Reservation email sent!");
    alert("Your reservation is confirmed!");
  } else {
    console.error("✗ Error:", result.error);
  }
}
```

---

## 💡 Example 3: With Validation

```typescript
import { sendBookingEmail, validateBookingData } from "@/services/emailService";
import { BookingEmailData } from "@/types/booking";

async function sendWithValidation(booking: BookingEmailData) {
  // Validate first
  const validation = validateBookingData(booking);
  
  if (!validation.isValid) {
    // Show validation errors
    console.error("❌ Validation failed:");
    validation.errors.forEach(error => console.error(" - " + error));
    
    // Show to user
    alert("Please fix these errors:\n" + validation.errors.join("\n"));
    return false;
  }

  // All valid, send email
  const result = await sendBookingEmail(booking);
  return result.success;
}
```

---

## 💡 Example 4: In React Component (Hook)

```typescript
import { useState } from "react";
import { sendBookingEmail, validateBookingData } from "@/services/emailService";
import { BookingEmailData } from "@/types/booking";

export function useBookingEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (booking: BookingEmailData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate
      const validation = validateBookingData(booking);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }

      // Send
      const result = await sendBookingEmail(booking);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendEmail, loading, error };
}

// Usage:
function MyComponent() {
  const { sendEmail, loading, error } = useBookingEmail();

  const handleBooking = async () => {
    const booking = { /* booking data */ };
    const success = await sendEmail(booking);
    if (success) alert("✓ Email sent!");
  };

  return (
    <div>
      <button onClick={handleBooking} disabled={loading}>
        {loading ? "Sending..." : "Confirm Booking"}
      </button>
      {error && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
}
```

---

## 💡 Example 5: In React Form

```typescript
import { useState } from "react";
import { sendBookingEmail } from "@/services/emailService";
import { GuestHouseBookingData } from "@/types/booking";

export function BookingForm() {
  const [formData, setFormData] = useState<GuestHouseBookingData>({
    placeType: "guesthouse",
    placeName: "",
    userName: "",
    userEmail: "",
    phone: "",
    guests: 1,
    arrivalDate: "",
    leaveDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await sendBookingEmail(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: '✓ Booking email sent successfully!' });
        // Reset form
        setFormData({
          placeType: "guesthouse",
          placeName: "",
          userName: "",
          userEmail: "",
          phone: "",
          guests: 1,
          arrivalDate: "",
          leaveDate: "",
        });
      } else {
        setMessage({ type: 'error', text: `✗ Error: ${result.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `✗ ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="userName"
        value={formData.userName}
        onChange={handleChange}
        placeholder="Your name"
        required
      />
      <input
        name="userEmail"
        type="email"
        value={formData.userEmail}
        onChange={handleChange}
        placeholder="Your email"
        required
      />
      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Your phone"
        required
      />
      <input
        name="placeName"
        value={formData.placeName}
        onChange={handleChange}
        placeholder="Place name"
        required
      />
      <input
        name="guests"
        type="number"
        value={formData.guests}
        onChange={handleChange}
        min="1"
        required
      />
      <input
        name="arrivalDate"
        type="date"
        value={formData.arrivalDate}
        onChange={handleChange}
        required
      />
      <input
        name="leaveDate"
        type="date"
        value={formData.leaveDate}
        onChange={handleChange}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Booking Email'}
      </button>
      
      {message && (
        <div style={{
          color: message.type === 'success' ? 'green' : 'red',
          marginTop: '10px'
        }}>
          {message.text}
        </div>
      )}
    </form>
  );
}
```

---

## 💡 Example 6: Error Handling

```typescript
import { sendBookingEmail } from "@/services/emailService";

async function sendWithErrorHandling(booking) {
  try {
    const result = await sendBookingEmail(booking);
    
    if (result.success) {
      // Email sent
      console.log("✓ Success");
      return { success: true };
    } else {
      // Email service error
      console.error("❌ Service error:", result.error);
      return {
        success: false,
        error: "Email service unavailable. Booking created but confirmation not sent."
      };
    }
  } catch (err) {
    // Network or unexpected error
    console.error("❌ Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred"
    };
  }
}

// Usage:
const result = await sendWithErrorHandling(booking);
if (result.success) {
  alert("✓ Confirmation email sent!");
} else {
  alert("⚠ " + result.error);
}
```

---

## 💡 Example 7: Type Guards

```typescript
import { isGuestHouseBooking, isRestaurantBooking } from "@/services/emailService";
import { BookingEmailData } from "@/types/booking";

function handleBooking(booking: BookingEmailData) {
  if (isGuestHouseBooking(booking)) {
    console.log("Guest House Booking");
    console.log(`From ${booking.arrivalDate} to ${booking.leaveDate}`);
    console.log(`Guests: ${booking.guests}`);
  } else if (isRestaurantBooking(booking)) {
    console.log("Restaurant Booking");
    console.log(`Date: ${booking.day} at ${booking.time}`);
    console.log(`Party size: ${booking.guests}`);
  }
}
```

---

## 💡 Example 8: Batch Processing

```typescript
import { sendBookingEmail } from "@/services/emailService";
import { BookingEmailData } from "@/types/booking";

async function sendMultipleEmails(bookings: BookingEmailData[]) {
  const results = await Promise.all(
    bookings.map(booking => sendBookingEmail(booking))
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✓ ${successful} sent, ✗ ${failed} failed`);

  return {
    successful,
    failed,
    results
  };
}

// Usage:
const bookings = [
  { placeType: "guesthouse", /* ... */ },
  { placeType: "restaurant", /* ... */ },
];

const { successful, failed } = await sendMultipleEmails(bookings);
alert(`Sent: ${successful}, Failed: ${failed}`);
```

---

## 💡 Example 9: With Loading Toast

```typescript
import { useState } from "react";
import { sendBookingEmail } from "@/services/emailService";
import { useToast } from "@/components/ui/use-toast"; // shadcn/ui

export function BookingButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (booking) => {
    setLoading(true);
    
    // Show loading toast
    toast({
      description: "Sending confirmation email...",
    });

    try {
      const result = await sendBookingEmail(booking);
      
      if (result.success) {
        toast({
          title: "✓ Success",
          description: "Confirmation email sent successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "✗ Error",
          description: result.error || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "✗ Error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleSendEmail(booking)} disabled={loading}>
      {loading ? "Sending..." : "Confirm Booking"}
    </button>
  );
}
```

---

## 💡 Example 10: Retry Logic

```typescript
import { sendBookingEmail } from "@/services/emailService";

async function sendWithRetry(
  booking,
  maxRetries = 3,
  delayMs = 1000
) {
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await sendBookingEmail(booking);
      if (result.success) {
        console.log(`✓ Sent on attempt ${i + 1}`);
        return result;
      }
      lastError = result.error;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
    }

    // Wait before retrying (except on last attempt)
    if (i < maxRetries - 1) {
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`
  };
}

// Usage:
const result = await sendWithRetry(booking);
if (!result.success) {
  console.error(result.error);
}
```

---

## 📋 Common Parameters

### Dates Format:
```typescript
// Input (ISO String):
"2025-12-28"

// Output (Formatted):
"December 28, 2025"
```

### Time Format:
```typescript
// Input (24-hour):
"19:30"

// Output (displayed as-is):
"19:30"
```

---

## 🔍 Testing in Browser Console

```javascript
// Test validation
const emailService = await import('@/services/emailService');
const booking = {
  placeType: "guesthouse",
  placeName: "Test",
  userName: "Test",
  userEmail: "test@test.com",
  phone: "123",
  guests: 1,
  arrivalDate: "2025-12-28",
  leaveDate: "2025-12-31"
};

// Validate
const validation = emailService.validateBookingData(booking);
console.log(validation);

// Send
const result = await emailService.sendBookingEmail(booking);
console.log(result);
```

---

## 🚀 Deployment Checklist

- [ ] `.env.local` added to `.gitignore`
- [ ] Environment variables set on production server
- [ ] EmailJS template created with all variables
- [ ] Tested with real bookings
- [ ] Error handling implemented
- [ ] User feedback messages configured
- [ ] Email templates designed and tested

---

**Ready to integrate? Copy the examples above and customize for your needs!**
