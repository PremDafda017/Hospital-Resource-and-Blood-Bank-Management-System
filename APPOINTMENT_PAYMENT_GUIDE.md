# Appointment Booking & Payment Integration Guide

## Overview

This implementation adds a comprehensive Apollo247-style appointment booking system with Razorpay payment integration to the Hospital Blood Bank Management System.

## New Features Implemented

### 1. Multi-Step Appointment Booking Wizard
**Location:** `src/components/appointment/AppointmentWizard.jsx`

**Features:**
- Apollo247-style 8-step booking flow:
  1. Choose Problem (symptom selection)
  2. Select Department (specialty selection)
  3. Select Hospital (from database)
  4. Select Doctor (filtered by specialty/hospital)
  5. Select Date (next 14 days)
  6. Select Time (time slots)
  7. Payment (Razorpay integration)
  8. Confirmation (appointment details)

**Route:** `/book-appointment-wizard`

### 2. Razorpay Payment Gateway
**Location:** `src/components/payment/RazorpayPayment.jsx`

**Features:**
- Secure payment processing
- Dynamic payment amount calculation
- Payment success/failure callbacks
- Error handling and validation
- Loading states and UI feedback

**Environment Variables Required:**
```env
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Enhanced Patient Appointment Dashboard
**Location:** `src/components/patient/PatientAppointmentDashboard.jsx`

**Features:**
- Filter appointments by status (upcoming, completed, cancelled)
- Search functionality
- View appointment details modal
- Download prescription PDF
- Download invoice PDF
- Status-based action buttons

### 4. Blood Request Payment Integration
**Location:** `src/components/payment/BloodRequestPayment.jsx`

**Features:**
- Home delivery option (₹150 charge)
- Self-pickup option (free)
- Delivery address input
- Payment integration for delivery charges
- Order summary and confirmation

### 5. PDF Generation System
**Location:** `src/components/pdf/PDFGenerator.jsx`

**Features:**
- Professional invoice generation
- Prescription PDF generation
- Blood request receipt generation
- Patient and doctor information
- Payment details and timestamps

**Dependencies:**
- `jspdf` for PDF generation

### 6. Backend API Endpoints
**Location:** `server/index.js`

**New Endpoints:**
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature
- `PUT /api/blood-requests/:requestId/payment` - Update blood request with payment
- `GET /api/appointments/:appointmentId/invoice` - Generate invoice PDF
- `GET /api/appointments/:appointmentId/prescription` - Generate prescription PDF

## Installation & Setup

### 1. Install Dependencies
```bash
npm install jspdf
```

### 2. Environment Configuration
Create `.env` file in the root directory:
```env
# React App Configuration
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Razorpay Payment Gateway
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hospital-bloodbank-system

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from the Razorpay Dashboard
3. Add keys to your `.env` file
4. For testing, use test mode (no real money transactions)

## Usage Guide

### For Patients

#### Booking an Appointment with Payment
1. Navigate to "My Appointments" page
2. Click "Book with Payment" button
3. Follow the 8-step booking wizard:
   - Select your problem/symptom
   - Choose medical department
   - Select hospital
   - Choose doctor
   - Pick appointment date
   - Select time slot
   - Complete payment via Razorpay
   - Receive confirmation

#### Managing Appointments
1. View all appointments in the dashboard
2. Filter by status (upcoming, completed, cancelled)
3. Search by doctor name or hospital
4. Click "View Details" for full information
5. Download prescriptions and invoices for completed appointments

#### Blood Request with Delivery
1. Create a blood request
2. Click the payment icon (credit card) on pending requests
3. Choose between self-pickup (free) or home delivery (₹150)
4. Enter delivery address if home delivery selected
5. Complete payment
6. Download receipt

### For Administrators

#### Payment Management
- All payments are recorded in the system
- Payment status tracked in appointment/blood request records
- PDF invoices and receipts available for download

#### Razorpay Configuration
- Update `REACT_APP_RAZORPAY_KEY_ID` in `.env`
- Configure webhook endpoints in Razorpay dashboard for production
- Monitor payment transactions in Razorpay dashboard

## Component Integration

### Updated Files
1. **src/App.js** - Added new route for appointment wizard
2. **src/pages/Patient/PatientAppointments.jsx** - Integrated new dashboard
3. **src/pages/Patient/PatientBloodRequests.jsx** - Added payment functionality
4. **package.json** - Added jspdf dependency

### New Files Created
1. **src/components/appointment/AppointmentWizard.jsx** - Main booking wizard
2. **src/components/payment/RazorpayPayment.jsx** - Payment component
3. **src/components/payment/BloodRequestPayment.jsx** - Blood request payment
4. **src/components/patient/PatientAppointmentDashboard.jsx** - Enhanced dashboard
5. **src/components/pdf/PDFGenerator.jsx** - PDF generation utilities
6. **.env.example** - Environment configuration template

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use test mode** for development and testing
3. **Verify payments on backend** before confirming services
4. **Implement proper authentication** for all payment endpoints
5. **Use HTTPS** in production for all payment transactions
6. **Validate all user inputs** before processing payments

## Testing Checklist

### Appointment Booking Flow
- [ ] Navigation to booking wizard works
- [ ] All 8 steps render correctly
- [ ] Form validation works
- [ ] Doctor filtering by specialty works
- [ ] Hospital selection works
- [ ] Date and time selection works
- [ ] Payment modal opens
- [ ] Payment success redirects to confirmation
- [ ] Appointment saved to database

### Payment Integration
- [ ] Razorpay script loads correctly
- [ ] Payment modal opens with correct amount
- [ ] Payment success callback works
- [ ] Payment failure callback works
- [ ] Payment details saved to database
- [ ] Order creation works

### PDF Generation
- [ ] Invoice PDF generates correctly
- [ ] Prescription PDF generates correctly
- [ ] Blood request receipt generates correctly
- [ ] PDF files download successfully
- [ ] All patient information appears correctly

### Blood Request Payment
- [ ] Payment modal opens for pending requests
- [ ] Home delivery option calculates charges
- [ ] Self-pickup option is free
- [ ] Delivery address validation works
- [ ] Payment updates request status
- [ ] Receipt downloads successfully

## Troubleshooting

### Razorpay Issues
- **Problem:** Payment modal doesn't open
- **Solution:** Check that `REACT_APP_RAZORPAY_KEY_ID` is set correctly
- **Solution:** Ensure Razorpay script loads (check browser console)

### PDF Generation Issues
- **Problem:** PDF doesn't generate
- **Solution:** Ensure jspdf is installed (`npm install jspdf`)
- **Solution:** Check browser console for JavaScript errors

### Backend Issues
- **Problem:** Payment verification fails
- **Solution:** Check MongoDB connection
- **Solution:** Verify API endpoints are accessible
- **Solution:** Check server logs for errors

## Future Enhancements

1. **Lab Test Booking & Payment**
   - Similar to appointment booking flow
   - Integration with diagnostic centers
   - Report generation and download

2. **Wallet System**
   - Add money to wallet
   - Pay from wallet balance
   - Transaction history

3. **Insurance Integration**
   - Insurance company partnerships
   - Cashless claims processing
   - Insurance coverage display

4. **Appointment Reminders**
   - SMS reminders
   - Email notifications
   - Push notifications

5. **Prescription Management**
   - Digital prescriptions
   - Medicine ordering integration
   - Pharmacy partnerships

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check server logs for backend issues
4. Verify environment configuration
5. Ensure all dependencies are installed

## License

This payment integration is part of the Hospital Blood Bank Management System. Ensure compliance with:
- Razorpay terms of service
- Healthcare data regulations (HIPAA/GDPR)
- Payment card industry standards (PCI DSS)