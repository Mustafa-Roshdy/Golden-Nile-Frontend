# ✅ EmailJS Integration Checklist

**Status**: Ready to Implement  
**Estimated Time**: 60 minutes  
**Difficulty**: Easy  

---

## 📋 Pre-Implementation Checklist

- [ ] You have npm installed
- [ ] You're in the project root directory
- [ ] You have VS Code or similar editor open
- [ ] You have a web browser ready
- [ ] You have access to your email

---

## 🔧 Installation & Setup (15 minutes)

### Step 1: Verify Package Installation
```bash
npm list emailjs-com
```
Expected: `emailjs-com@3.2.0`
- [ ] Package is installed

### Step 2: Create EmailJS Account
Visit: https://emailjs.com/
- [ ] Go to emailjs.com
- [ ] Click "Sign Up"
- [ ] Enter email and password
- [ ] Verify your email
- [ ] Account created

### Step 3: Set Up Email Service
In EmailJS Dashboard:
- [ ] Go to "Email Services"
- [ ] Click "Add Service"
- [ ] Choose your email provider (Gmail recommended)
- [ ] Complete authorization
- [ ] Copy Service ID (e.g., `service_xxxxx`)

### Step 4: Create Email Template
In EmailJS Dashboard:
- [ ] Go to "Email Templates"
- [ ] Click "Create New Template"
- [ ] Name it: "Booking Confirmation"
- [ ] Set Subject: `New Booking for {{place_name}} ({{place_type}})`
- [ ] Copy HTML from `EMAILJS_IMPLEMENTATION_COMPLETE.md`
- [ ] Paste into template editor
- [ ] Click "Save"
- [ ] Copy Template ID (e.g., `template_xxxxx`)

### Step 5: Get Public Key
In EmailJS Dashboard:
- [ ] Go to "Account"
- [ ] Click "API Keys"
- [ ] Copy Public Key
- [ ] Save it (you'll need it in a moment)

### Step 6: Create .env.local File
In your project root:
```bash
# Create file:
.env.local

# Add content:
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace xxxxx and your_public_key_here with actual values
- [ ] File created
- [ ] Service ID added
- [ ] Template ID added
- [ ] Public Key added

### Step 7: Add to .gitignore
```bash
# Open .gitignore and add:
.env.local
.env.*.local
```
- [ ] Added to .gitignore

---

## 💻 Code Integration (20 minutes)

### Step 8: Verify Code Files
All these files should already exist:
- [ ] `src/types/booking.ts` ✅
- [ ] `src/services/emailService.ts` ✅
- [ ] `src/components/BookingFormSample.tsx` ✅

### Step 9: Update BookingDetail.tsx

Open: `src/pages/BookingDetail.tsx`

**Add imports at top:**
```typescript
import { sendBookingEmail, validateBookingData } from "@/services/emailService";
import { BookingEmailData, GuestHouseBookingData, RestaurantBookingData } from "@/types/booking";
```
- [ ] Imports added

**Find function:** `handleConfirmBooking`

**Replace entire function with code from:**
`EMAILJS_IMPLEMENTATION_COMPLETE.md` (copy the complete function)
- [ ] Function replaced
- [ ] Code compiles without errors

### Step 10: Verify Compilation
```bash
npm run build
```
- [ ] No TypeScript errors
- [ ] No compilation errors
- [ ] Build succeeds

### Step 11: Test in Development
```bash
npm run dev
```
- [ ] Application starts
- [ ] No console errors
- [ ] Navbar loads
- [ ] Pages accessible

---

## 🧪 Testing (20 minutes)

### Test 1: Guest House Booking

1. [ ] Navigate to a guest house property
2. [ ] Fill in booking details:
   - [ ] Select check-in date (future date)
   - [ ] Select check-out date (after check-in)
   - [ ] Set number of guests
3. [ ] Click "Reserve"
4. [ ] Confirm booking
5. [ ] Wait for "Booking confirmed" message
6. [ ] Check email inbox for confirmation
   - [ ] Email received
   - [ ] All details correct
   - [ ] Dates formatted properly
   - [ ] All info visible

### Test 2: Restaurant Booking

1. [ ] Navigate to a restaurant property
2. [ ] Fill in booking details:
   - [ ] Select reservation date (future date)
   - [ ] Select reservation time
   - [ ] Set number of guests
3. [ ] Click "Reserve"
4. [ ] Confirm booking
5. [ ] Wait for "Booking confirmed" message
6. [ ] Check email inbox for confirmation
   - [ ] Email received
   - [ ] All details correct
   - [ ] Date and time formatted properly
   - [ ] All info visible

### Test 3: Error Handling

1. [ ] Try booking without email (should fail)
2. [ ] Try dates where arrival > leaving (should fail)
3. [ ] Try invalid email format (should fail)
4. [ ] Check error messages are shown

### Test 4: Validation

1. [ ] Try with missing required fields
   - [ ] Error shown for empty name
   - [ ] Error shown for invalid email
   - [ ] Error shown for empty phone
2. [ ] Verify all validation rules work

---

## 🔍 Verification Checklist

### Email Received?
- [ ] Check Inbox (not spam)
- [ ] Check other email accounts
- [ ] Wait 1-2 minutes and refresh
- [ ] Check spam/junk folder

### Email Formatting Correct?
- [ ] Place name visible
- [ ] Booking type visible
- [ ] Guest name visible
- [ ] Email address visible
- [ ] Phone visible
- [ ] Guest count visible
- [ ] Dates visible (guest house)
- [ ] Date & time visible (restaurant)
- [ ] Header colored (Nile Blue & Gold)
- [ ] Footer present

### Application Working?
- [ ] No console errors
- [ ] No TypeScript warnings
- [ ] All fields properly filled
- [ ] Booking saved to backend
- [ ] Email sent
- [ ] Success message shown

---

## 🚀 Production Deployment (5 minutes)

### Step 12: Set Production Environment

For each environment (Staging/Production):

**Platform: Vercel/Netlify/Other**
- [ ] Add environment variables:
  - [ ] `VITE_EMAILJS_SERVICE_ID`
  - [ ] `VITE_EMAILJS_TEMPLATE_ID`
  - [ ] `VITE_EMAILJS_PUBLIC_KEY`

**Platform: Other (Server/VPS)**
- [ ] SSH into server
- [ ] Create `.env.local` with production keys
- [ ] Restart application

### Step 13: Test in Production

- [ ] Access production URL
- [ ] Complete test booking
- [ ] Check email
- [ ] Verify all details
- [ ] Test multiple bookings

### Step 14: Monitor

- [ ] Check EmailJS dashboard for delivery stats
- [ ] Monitor for any errors in logs
- [ ] Get notified if emails fail

---

## 📞 Troubleshooting Checklist

### Issue: Email not sent

**Check these in order:**
- [ ] `.env.local` has correct values
- [ ] Service ID is valid format
- [ ] Template ID is valid format
- [ ] Public Key is filled in
- [ ] EmailJS email service is verified
- [ ] Browser console shows no errors
- [ ] Network tab shows request to emailjs
- [ ] Clear cache and refresh

### Issue: Template variables blank

**Check these:**
- [ ] Variable wrapped in `{{variable_name}}`
- [ ] Variable name matches exactly (case-sensitive)
- [ ] EmailJS template saved
- [ ] Refresh template editor
- [ ] Test from EmailJS website first

### Issue: Dates showing as "Invalid Date"

**Check these:**
- [ ] Dates in ISO format (YYYY-MM-DD)
- [ ] No timezone issues
- [ ] Date picker returns correct format
- [ ] Browser console shows correct date

### Issue: Application not compiling

**Check these:**
- [ ] Imports added correctly
- [ ] File paths correct
- [ ] No typos in function names
- [ ] All dependencies installed
- [ ] Run: `npm install`

### Issue: Multiple emails sent

**Check these:**
- [ ] Button not double-clicked
- [ ] Form not submitted twice
- [ ] Check browser console for multiple calls
- [ ] Disable submit button during sending

---

## 📋 Code Review Checklist

Review each file before finalizing:

### `src/types/booking.ts`
- [ ] All interfaces defined
- [ ] Union type created
- [ ] No syntax errors
- [ ] TypeScript strict mode passes

### `src/services/emailService.ts`
- [ ] Imports correct
- [ ] Config uses env variables
- [ ] All functions present
- [ ] Error handling implemented
- [ ] Date formatting included

### Updated `BookingDetail.tsx`
- [ ] Imports added
- [ ] Function updated
- [ ] No old code left
- [ ] Email data constructed correctly
- [ ] Error handling present
- [ ] Success message shown

---

## 📊 Final Checklist

**Development Environment**
- [ ] Package installed
- [ ] .env.local created
- [ ] Code files in place
- [ ] BookingDetail updated
- [ ] Application compiles
- [ ] Application runs

**EmailJS Setup**
- [ ] Account created
- [ ] Email service configured
- [ ] Template created with HTML
- [ ] All variables in template
- [ ] Service ID obtained
- [ ] Template ID obtained
- [ ] Public Key obtained

**Testing**
- [ ] Guest house booking tested
- [ ] Restaurant booking tested
- [ ] Email received
- [ ] Email formatting correct
- [ ] Validation working
- [ ] Error handling working

**Production**
- [ ] Environment variables set
- [ ] Production tested
- [ ] Monitoring configured
- [ ] Backup plan in place

---

## ✅ Done!

When you've checked all boxes, you're ready to go!

**Next**: Monitor your EmailJS dashboard for delivery stats

---

## 🆘 Need Help?

**Stuck on a step?**
1. Check the specific documentation file
2. Look at code examples in `EMAILJS_QUICK_START.md`
3. Check EmailJS docs: https://emailjs.com/docs/

**Still stuck?**
1. Check browser console for errors
2. Check network tab for API calls
3. Check EmailJS dashboard for service status
4. Try EmailJS test email first

---

## 📞 Quick Reference

**EmailJS Credentials Location:**
- Service ID: Dashboard → Email Services
- Template ID: Dashboard → Email Templates
- Public Key: Dashboard → Account → API Keys

**Environment File Location:**
- Create at: project root / `.env.local`

**Code Files Location:**
- Types: `src/types/booking.ts`
- Service: `src/services/emailService.ts`
- Component: `src/components/BookingFormSample.tsx`
- Update: `src/pages/BookingDetail.tsx`

**Documentation:**
- All guides in project root
- Start with: `EMAILJS_INDEX.md`

---

**Time to Complete**: ~60 minutes  
**Difficulty**: Easy  
**Status**: Ready to Start  

**Let's Go! 🚀**
