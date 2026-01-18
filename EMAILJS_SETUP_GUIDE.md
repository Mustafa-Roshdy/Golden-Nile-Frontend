# EmailJS Integration Guide - Golden Nile Booking System

Complete setup instructions for integrating EmailJS to send booking confirmation emails for both guest houses and restaurants.

---

## 📋 Table of Contents
1. [Installation](#installation)
2. [EmailJS Setup](#emailjs-setup)
3. [Environment Configuration](#environment-configuration)
4. [Template Setup](#template-setup)
5. [Integration with BookingDetail](#integration-with-bookingdetail)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Installation

### Step 1: Install EmailJS

```bash
npm install emailjs-com
```

Or using yarn:
```bash
yarn add emailjs-com
```

---

## 🎯 EmailJS Setup

### Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
After logging in to EmailJS dashboard:

1. **Service ID**: 
   - Go to "Email Services" → "Add Service"
   - Select your email provider (Gmail, Outlook, etc.)
   - Complete the setup
   - Copy your Service ID (e.g., `service_xxxxx`)

2. **Template ID**:
   - Go to "Email Templates" → "Create New Template"
   - Name it "Booking Confirmation"
   - Copy the Template ID (e.g., `template_xxxxx`)

3. **Public Key**:
   - Go to "Account" → "API Keys"
   - Copy your Public Key (e.g., `abc123def456`)

---

## 🔑 Environment Configuration

### Step 1: Create `.env.local` file (if not exists)

In the root of your project, create `.env.local`:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_golden_nile
VITE_EMAILJS_TEMPLATE_ID=template_booking
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 2: Replace with Your Credentials

```env
# Example with real values
VITE_EMAILJS_SERVICE_ID=service_a1b2c3d4e5f6
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=j5k8l2m9n3o1p7q
```

**⚠️ Important**: Never commit `.env.local` to git. Add it to `.gitignore`:

```
# .gitignore
.env.local
.env.*.local
```

---

## 📧 Template Setup

### EmailJS Template Configuration

In your EmailJS dashboard:

1. Go to **Email Templates**
2. Click **Create New Template**
3. Name: "Booking Confirmation"
4. Fill in the template with the content below

### Template Content

**Subject:**
```
New Booking for {{place_name}} ({{place_type}})
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1A72BB 0%, #FFCC00 100%); color: white; padding: 20px; border-radius: 8px; }
        .content { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #1A72BB; }
        .divider { border-top: 2px solid #FFCC00; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ New Booking Received!</h1>
            <p>Thank you for choosing Golden Nile</p>
        </div>

        <div class="content">
            <div class="section">
                <h2 style="color: #1A72BB;">📌 Booking Details</h2>
                
                <p><span class="label">Place Name:</span> {{place_name}}</p>
                <p><span class="label">Type:</span> {{place_type}}</p>
                
                <div class="divider"></div>

                <h3 style="color: #1A72BB;">👤 Guest Information</h3>
                <p><span class="label">Name:</span> {{user_name}}</p>
                <p><span class="label">Email:</span> {{user_email}}</p>
                <p><span class="label">Phone:</span> {{phone}}</p>
                
                <div class="divider"></div>

                <h3 style="color: #1A72BB;">🛎️ Reservation Details</h3>
                
                {{#if arrival_date}}
                <p><span class="label">Check-in Date:</span> {{arrival_date}}</p>
                {{/if}}
                
                {{#if leave_date}}
                <p><span class="label">Check-out Date:</span> {{leave_date}}</p>
                {{/if}}
                
                {{#if day}}
                <p><span class="label">Reservation Day:</span> {{day}}</p>
                {{/if}}
                
                {{#if time}}
                <p><span class="label">Reservation Time:</span> {{time}}</p>
                {{/if}}
                
                <p><span class="label">Number of Guests:</span> {{guests}}</p>
            </div>
        </div>

        <div class="footer">
            <p>© 2025 Golden Nile Tourism. All rights reserved.</p>
            <p>This is an automated booking confirmation. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
```

### EmailJS Template Variables

**Required Variables** (copy-paste these exact names):
- `place_name` - Name of the guest house or restaurant
- `place_type` - Type of booking ("guesthouse" or "restaurant")
- `user_name` - Guest's name
- `user_email` - Guest's email address
- `phone` - Guest's phone number
- `guests` - Number of guests
- `arrival_date` - (Guest House) Check-in date
- `leave_date` - (Guest House) Check-out date
- `day` - (Restaurant) Reservation day
- `time` - (Restaurant) Reservation time

**Note**: Empty fields are automatically hidden by EmailJS, so conditional fields work automatically.

---

## 🔗 Integration with BookingDetail

### Updated handleConfirmBooking Function

In `src/pages/BookingDetail.tsx`, modify the `handleConfirmBooking` function:

```typescript
import { sendBookingEmail, validateBookingData, isGuestHouseBooking } from "@/services/emailService";
import { BookingEmailData, GuestHouseBookingData, RestaurantBookingData } from "@/types/booking";
import { authHelpers } from "@/services/api";

const handleConfirmBooking = async () => {
  if (!property || !isLoggedIn) return;

  try {
    setBookingLoading(true);

    let bookingData: any = {
      place: property.id,
    };

    if (property.placeType === "guest_house") {
      bookingData.arrivalDate = checkIn?.toISOString();
      bookingData.leavingDate = checkOut?.toISOString();
      bookingData.memberNumber = guests;
      bookingData.roomNumber = 1;
    } else {
      bookingData.arrivalDate = reservationDate?.toISOString();
      bookingData.leavingDate = reservationDate?.toISOString();
      bookingData.memberNumber = tables;
    }

    // Create booking on backend
    const response = await bookingApi.createBooking(bookingData);
    
    // 🔥 NEW: Send booking email
    const userId = authHelpers.getCurrentUserId();
    if (userId) {
      const userData = await getUserData(userId); // Fetch user data
      
      const emailData: BookingEmailData = property.placeType === "guest_house"
        ? {
            placeType: "guesthouse",
            placeName: property.title,
            userName: userData.firstName,
            userEmail: userData.email,
            phone: userData.phone,
            guests,
            arrivalDate: checkIn?.toISOString() || "",
            leaveDate: checkOut?.toISOString() || "",
          }
        : {
            placeType: "restaurant",
            placeName: property.title,
            userName: userData.firstName,
            userEmail: userData.email,
            phone: userData.phone,
            guests: tables,
            day: reservationDate?.toISOString() || "",
            time: reservationTime,
          };

      const emailResult = await sendBookingEmail(emailData);
      console.log("Booking email sent:", emailResult);
    }

    // Reset form
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests(1);
    setTables(1);
    setReservationDate(undefined);
    setReservationTime("");

    alert("Booking confirmed successfully!");
  } catch (err) {
    console.error("Failed to create booking", err);
    alert("Failed to create booking. Please try again.");
  } finally {
    setBookingLoading(false);
  }
};
```

---

## 📚 Usage Examples

### Example 1: Guest House Booking

```typescript
import { sendBookingEmail } from "@/services/emailService";
import { GuestHouseBookingData } from "@/types/booking";

const handleGuestHouseBooking = async () => {
  const bookingData: GuestHouseBookingData = {
    placeType: "guesthouse",
    placeName: "Luxury Nile Villa",
    userName: "Ahmed Hassan",
    userEmail: "ahmed@example.com",
    phone: "+20 100 123 4567",
    guests: 4,
    arrivalDate: "2025-12-28",
    leaveDate: "2025-12-31",
  };

  const result = await sendBookingEmail(bookingData);
  
  if (result.success) {
    console.log("Email sent successfully!");
  } else {
    console.error("Failed to send email:", result.error);
  }
};
```

### Example 2: Restaurant Booking

```typescript
import { sendBookingEmail } from "@/services/emailService";
import { RestaurantBookingData } from "@/types/booking";

const handleRestaurantBooking = async () => {
  const bookingData: RestaurantBookingData = {
    placeType: "restaurant",
    placeName: "Pharaoh's Feast Restaurant",
    userName: "Fatima Mohamed",
    userEmail: "fatima@example.com",
    phone: "+20 100 987 6543",
    guests: 6,
    day: "2025-12-28",
    time: "19:30",
  };

  const result = await sendBookingEmail(bookingData);
  
  if (result.success) {
    console.log("Reservation email sent!");
  } else {
    console.error("Failed to send email:", result.error);
  }
};
```

### Example 3: With Validation

```typescript
import { sendBookingEmail, validateBookingData } from "@/services/emailService";

const handleBookingWithValidation = async (bookingData) => {
  // Validate first
  const validation = validateBookingData(bookingData);
  
  if (!validation.isValid) {
    console.error("Validation errors:", validation.errors);
    return;
  }

  // Send if valid
  const result = await sendBookingEmail(bookingData);
  return result;
};
```

---

## 🐛 Troubleshooting

### Issue 1: "Email service not configured"

**Solution**: Ensure your `.env.local` file has:
```env
VITE_EMAILJS_PUBLIC_KEY=your_actual_key_here
```

### Issue 2: "Cannot find name 'emailjs'"

**Solution**: Install the package:
```bash
npm install emailjs-com
npm install --save-dev @types/emailjs-com
```

### Issue 3: CORS Errors

**Solution**: EmailJS handles CORS automatically. If you still get errors:
1. Check your Service ID is correct
2. Verify your email service is properly configured in EmailJS dashboard
3. Clear browser cache and try again

### Issue 4: Email Not Received

**Solution**:
1. Check your Email Services configuration in EmailJS
2. Check spam/junk folders
3. Verify the recipient email is in the template variables
4. Test sending a test email from EmailJS dashboard first

### Issue 5: Template Variables Not Showing

**Solution**:
1. Ensure variable names in template match exactly (case-sensitive)
2. Variables must be surrounded by `{{variable_name}}`
3. For conditional content, use: `{{#if variable}}content{{/if}}`
4. Save the template after making changes

---

## 📝 File Structure

```
src/
├── components/
│   └── BookingFormSample.tsx (Sample component)
├── services/
│   └── emailService.ts (Main email service)
├── types/
│   └── booking.ts (TypeScript interfaces)
└── pages/
    └── BookingDetail.tsx (Updated with email integration)
```

---

## ✅ Checklist

- [ ] Install EmailJS package
- [ ] Create EmailJS account
- [ ] Get Service ID, Template ID, Public Key
- [ ] Create `.env.local` with credentials
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create EmailJS template with provided HTML
- [ ] Update `BookingDetail.tsx` with email integration
- [ ] Test guest house booking
- [ ] Test restaurant booking
- [ ] Check email inbox for confirmations
- [ ] Test error handling and validation

---

## 🎓 API Reference

### `sendBookingEmail(bookingData: BookingEmailData)`

Sends a booking confirmation email.

**Parameters:**
- `bookingData` - BookingEmailData (GuestHouseBookingData | RestaurantBookingData)

**Returns:**
```typescript
Promise<{ 
  success: boolean; 
  messageId?: string; 
  error?: string 
}>
```

### `validateBookingData(booking: BookingEmailData)`

Validates booking data before sending.

**Returns:**
```typescript
{ 
  isValid: boolean; 
  errors: string[] 
}
```

### `isGuestHouseBooking(booking: BookingEmailData)`

Type guard to check if booking is guest house type.

---

## 🚀 Next Steps

1. Configure your EmailJS account
2. Add credentials to `.env.local`
3. Create the email template
4. Update `BookingDetail.tsx`
5. Test with sample bookings
6. Deploy to production

---

**Need Help?** Check https://www.emailjs.com/docs/ for more details.
