# Khalti Payment Integration Setup

This document explains how to set up and use the Khalti payment integration for donations.

## Authentication Requirement

**Important**: Only authenticated (logged-in) users can make donations. This ensures:
- Proper donation tracking and history
- User accountability and verification
- Secure payment processing
- Personalized donation experience

## Server Setup

### 1. Environment Variables

Add the following to your `server/.env` file:

```env
# Khalti Configuration
KHALTI_SECRET_KEY=your_khalti_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 2. Get Khalti Credentials

1. Sign up at [Khalti Merchant Dashboard](https://khalti.com/join/merchant/)
2. Complete merchant verification
3. Get your Secret Key from the dashboard
4. For testing, use the sandbox environment

### 3. Test Credentials (Sandbox)

For testing purposes, you can use Khalti's test credentials:
- Test Phone: 9800000000, 9800000001, 9800000002, etc.
- Test MPIN: 1111
- Test OTP: 987654

## Payment Flow

### 1. Authentication Check
- User must be logged in to access donation page
- Non-authenticated users are redirected to login page
- After login, users are redirected back to donation page

### 2. Initiate Payment
- Authenticated user fills donation form on `/donate` page
- Frontend calls `POST /api/khalti/initiate` with donation data and auth token
- Server validates user authentication and creates pending donation record
- Server calls Khalti API to initiate payment
- Server returns Khalti payment URL
- User is redirected to Khalti payment page

### 3. Payment Processing
- User completes payment on Khalti
- Khalti redirects user to `/khalti/verify?pidx=xxx&txnId=xxx&amount=xxx`

### 4. Payment Verification
- Frontend calls `POST /api/khalti/verify` with pidx and auth token
- Server verifies user authentication and donation ownership
- Server calls Khalti lookup API to verify payment status
- Server updates donation status based on verification result
- User sees success/failure message and is redirected to dashboard

## API Endpoints

### POST /api/khalti/initiate
Initiates a Khalti payment for donation. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "donorName": "John Doe",
  "email": "john@example.com",
  "amount": 1000,
  "purpose": "General donation",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "message": "Payment initiated successfully",
  "payment_url": "https://pay.khalti.com/...",
  "pidx": "unique_payment_id",
  "donation_id": "mongodb_donation_id"
}
```

### POST /api/khalti/verify
Verifies a Khalti payment. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pidx": "unique_payment_id_from_khalti"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "donation": {
    "id": "donation_id",
    "donorName": "John Doe",
    "amount": 1000,
    "status": "completed",
    "transactionId": "khalti_transaction_id",
    "createdAt": "2023-12-17T..."
  }
}
```

## Frontend Routes

- `/` - Landing page (public)
- `/login` - Login page (public)
- `/signup` - Signup page (public)
- `/donate` - Donation form (requires authentication)
- `/dashboard` - User dashboard with donation history (requires authentication)
- `/khalti/verify` - Payment verification page (requires authentication)

## Database Schema

The donation record includes:
- `donorName` - Donor's name
- `email` - Donor's email
- `amount` - Donation amount in NPR
- `paymentMethod` - Always "khalti"
- `purpose` - Donation purpose
- `description` - Optional description
- `status` - "pending", "completed", "failed", or "refunded"
- `userId` - Optional user ID if authenticated
- `transactionId` - Khalti transaction ID (set after verification)
- `pidx` - Khalti payment ID (set during initiation)

## Security Features

1. **Authentication Required** - All donation operations require user authentication
2. **User Ownership Validation** - Users can only access their own donations
3. **Server-side verification** - All payment verification happens on the server
4. **Amount validation** - Server verifies the payment amount matches the donation
5. **Status tracking** - Donations are tracked through their lifecycle
6. **Secure token handling** - JWT tokens used for authentication
7. **Error handling** - Comprehensive error handling for failed payments

## Testing

1. **Create an account**: Sign up at `/signup` or login at `/login`
2. **Start the servers**: 
   ```bash
   cd server && npm start
   cd user && npm run dev
   ```
3. **Navigate to `/donate`** (will redirect to login if not authenticated)
4. **Fill in donation details**
5. **Use Khalti test credentials** for payment
6. **Verify the payment flow** works correctly
7. **Check dashboard** at `/dashboard` to see donation history

## Production Deployment

1. Update `KHALTI_SECRET_KEY` with production credentials
2. Update `CLIENT_URL` with your production domain
3. Change Khalti API URLs from sandbox to production:
   - `https://khalti.com/api/v2/epayment/initiate/`
   - `https://khalti.com/api/v2/epayment/lookup/`

## Troubleshooting

### Common Issues

1. **Invalid Secret Key**: Verify your Khalti secret key is correct
2. **CORS Issues**: Ensure your domain is whitelisted in Khalti dashboard
3. **Amount Mismatch**: Khalti uses paisa (amount * 100), ensure conversion is correct
4. **Redirect Issues**: Verify `CLIENT_URL` is set correctly in environment variables

### Logs

Check server logs for detailed error messages from Khalti API calls.