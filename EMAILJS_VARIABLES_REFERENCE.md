# EmailJS Template Variables Reference

Quick reference guide for all EmailJS template variables used in the Golden Nile booking system.

---

## 📋 Complete Variables List

### Common Variables (Both Types)

| Variable | Type | Example | Required | Description |
|----------|------|---------|----------|-------------|
| `{{place_name}}` | String | "Luxury Nile Villa" | ✅ Yes | Name of the place |
| `{{place_type}}` | String | "guesthouse" or "restaurant" | ✅ Yes | Type of booking |
| `{{user_name}}` | String | "Ahmed Hassan" | ✅ Yes | Name of the guest |
| `{{user_email}}` | String | "ahmed@example.com" | ✅ Yes | Guest's email |
| `{{phone}}` | String | "+20 100 123 4567" | ✅ Yes | Guest's phone |
| `{{guests}}` | Number | 4 | ✅ Yes | Number of guests |

### Guest House Variables

| Variable | Type | Example | Required | Description |
|----------|------|---------|----------|-------------|
| `{{arrival_date}}` | Date | "December 28, 2025" | ✅ Yes | Check-in date (formatted) |
| `{{leave_date}}` | Date | "December 31, 2025" | ✅ Yes | Check-out date (formatted) |

### Restaurant Variables

| Variable | Type | Example | Required | Description |
|----------|------|---------|----------|-------------|
| `{{day}}` | Date | "December 28, 2025" | ✅ Yes | Reservation date (formatted) |
| `{{time}}` | String | "19:30" | ✅ Yes | Reservation time (24-hour format) |

---

## 🎯 Variable Usage in Templates

### Simple Interpolation
```html
<!-- Outputs the variable value -->
<p>Hello {{user_name}}, your booking is confirmed!</p>
```

### Conditional Content
```html
<!-- Shows only if the variable exists -->
{{#if arrival_date}}
  <p>Check-in: {{arrival_date}}</p>
{{/if}}

{{#if day}}
  <p>Reservation Date: {{day}}</p>
{{/if}}
```

### Common Patterns

**Greeting Message:**
```html
<h2>Hi {{user_name}},</h2>
<p>Thank you for booking {{place_name}}!</p>
```

**Contact Information:**
```html
<p>Contact: {{user_name}}</p>
<p>Email: {{user_email}}</p>
<p>Phone: {{phone}}</p>
```

**Guest House Details:**
```html
{{#if arrival_date}}
<div>
  <p><strong>Check-in:</strong> {{arrival_date}}</p>
  <p><strong>Check-out:</strong> {{leave_date}}</p>
  <p><strong>Guests:</strong> {{guests}}</p>
</div>
{{/if}}
```

**Restaurant Details:**
```html
{{#if day}}
<div>
  <p><strong>Date:</strong> {{day}}</p>
  <p><strong>Time:</strong> {{time}}</p>
  <p><strong>Party Size:</strong> {{guests}} {{#if guests == 1}}guest{{else}}guests{{/if}}</p>
</div>
{{/if}}
```

---

## 🔄 Variable Flow in Code

### Guest House Flow:
```
Frontend (BookingDetail.tsx)
  ↓
checkIn, checkOut, guests
  ↓
emailService.ts (getTemplateVariables)
  ↓
Formats: new Date(booking.arrivalDate).toLocaleDateString()
  ↓
EmailJS Template
  {{arrival_date}}, {{leave_date}}, {{guests}}
  ↓
Email Sent to {{user_email}}
```

### Restaurant Flow:
```
Frontend (BookingDetail.tsx)
  ↓
reservationDate, reservationTime, tables
  ↓
emailService.ts (getTemplateVariables)
  ↓
Formats: new Date(booking.day).toLocaleDateString()
  ↓
EmailJS Template
  {{day}}, {{time}}, {{guests}}
  ↓
Email Sent to {{user_email}}
```

---

## 📧 Template Example

### Subject Line:
```
New Booking for {{place_name}} ({{place_type}})
```

### Email Body:
```html
<html>
  <body>
    <h1>✨ New Booking Received!</h1>
    
    <h2>Booking Information</h2>
    <p><strong>Place:</strong> {{place_name}}</p>
    <p><strong>Type:</strong> {{place_type}}</p>
    
    <h2>Guest Details</h2>
    <p><strong>Name:</strong> {{user_name}}</p>
    <p><strong>Email:</strong> {{user_email}}</p>
    <p><strong>Phone:</strong> {{phone}}</p>
    <p><strong>Guests:</strong> {{guests}}</p>
    
    <!-- Guest House Specific -->
    {{#if arrival_date}}
    <h2>Stay Details</h2>
    <p><strong>Check-in:</strong> {{arrival_date}}</p>
    <p><strong>Check-out:</strong> {{leave_date}}</p>
    {{/if}}
    
    <!-- Restaurant Specific -->
    {{#if day}}
    <h2>Reservation Details</h2>
    <p><strong>Date:</strong> {{day}}</p>
    <p><strong>Time:</strong> {{time}}</p>
    {{/if}}
  </body>
</html>
```

---

## 🛠️ Creating EmailJS Template

### Step-by-Step:

1. **Log in** to EmailJS dashboard
2. **Go to** Email Templates
3. **Click** "Create New Template"
4. **Set Template Name** to "Booking Confirmation"
5. **Subject** field:
   ```
   New Booking for {{place_name}} ({{place_type}})
   ```
6. **Email Content** (HTML):
   - Paste the HTML template from the guide
   - Use variables from this reference
7. **Save** and note the Template ID

---

## ✅ Validation Rules

### Email Validation:
```typescript
// userEmail must match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Examples: ✅ john@example.com, ❌ john@, ❌ john
```

### Guest House Validation:
```typescript
✅ arrivalDate < leaveDate
✅ guests > 0
✅ arrivalDate required
✅ leaveDate required
```

### Restaurant Validation:
```typescript
✅ day required (date)
✅ time required (HH:MM format)
✅ guests > 0
```

---

## 🔐 Variable Safety

### Variables are:
- ✅ Automatically escaped for security
- ✅ Safe from XSS attacks
- ✅ Trimmed of whitespace
- ✅ Validated before sending

### Never:
- ❌ Pass unsanitized HTML in variables
- ❌ Include script tags
- ❌ Use single quotes in values (use `\'` if needed)

---

## 📱 Mobile Email Rendering

All variables will render properly on:
- ✅ Desktop email clients (Outlook, Gmail)
- ✅ Mobile devices (iOS Mail, Gmail app)
- ✅ Web email clients

### Best Practices:
- Keep variable content short
- Use clear labels before variables
- Test on multiple email clients
- Ensure dates are localized

---

## 🎨 Template Formatting Tips

### For Better Readability:
```html
<!-- Use tables for structured data -->
<table>
  <tr>
    <td><strong>Guest Name:</strong></td>
    <td>{{user_name}}</td>
  </tr>
  <tr>
    <td><strong>Email:</strong></td>
    <td>{{user_email}}</td>
  </tr>
</table>
```

### Color Coding:
```html
<!-- Important details in color -->
<p style="color: #1A72BB; font-weight: bold;">
  Check-in: {{arrival_date}}
</p>
```

---

## 📞 Support

For issues with template variables:
1. Check variable names match exactly (case-sensitive)
2. Ensure wrapped in `{{variable_name}}`
3. Verify data is being passed from frontend
4. Test with sample data in EmailJS editor
5. Check email spam folder

---

## 🚀 Template Versions

### v1.0 (Current)
- ✅ Guest House bookings
- ✅ Restaurant bookings
- ✅ User information
- ✅ Formatted dates
- ✅ Conditional content

### Future Enhancements
- Multi-language support
- Receipt generation
- Payment information
- Booking confirmation code
- Host contact information

---

**Last Updated**: December 24, 2025
