# Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
MONGODB_URI=mongodb://localhost:27017/WCDF-Nepal
NODE_ENV=development
```

Start server:
```bash
npm run server
```

### 2. Frontend Setup

```bash
cd user
npm install
```

Create `user/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start client:
```bash
npm run dev
```

### 3. MongoDB

Make sure MongoDB is running:
```bash
mongod
```

Or use MongoDB Atlas connection string in `.env`

## Project Structure

- `Backend/` - Node.js backend
- `user/` - React frontend
- `admin/` - Future admin panel (optional)

## Troubleshooting

1. **Port already in use**: Change PORT in `.env`
2. **MongoDB connection error**: Check MongoDB is running
3. **CORS errors**: Check server CORS configuration
4. **Module not found**: Run `npm install` in respective directory

## File Structure Details

### Backend
- `src/config/` - Database configuration
- `src/controllers/` - AuthController, DonationController, BookingController
- `src/middleware/` - authMiddleware, optionalAuth
- `src/models/` - User, Donation, Booking
- `src/routes/` - AuthRoutes, DonationRoutes, BookingRoutes

### User (Frontend)
- `src/components/` - Navbar, Footer, ProtectedRoute
- `src/pages/` - Landing, Login, Signup, Home, Donate
- `src/services/` - authService, donationService
- `src/context/` - AuthContext
- `src/routes/` - AppRoutes
