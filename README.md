# WCDF Nepal - Final Year Project

Women and Child Development Forum Nepal (WCDF-Nepal) - A comprehensive web application for managing donations, bookings, and user interactions.

## Project Structure

```
FYP/
├── Backend/                    # Backend (Node + Express)
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   └── index.js         # Express entry point
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── user/                       # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Images, logos
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main pages
│   │   ├── services/        # API calls
│   │   ├── context/         # Global state
│   │   ├── routes/         # App routing
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── admin/                      # (Optional – future admin panel)
├── SETUP.md
├── README.md
└── .gitignore
```

## Features

- ✅ User Authentication (Login/Signup)
- ✅ Responsive Landing Page
- ✅ Home Page with user dashboard
- ✅ Donation Management System
- ✅ Booking System
- ✅ Protected Routes
- ✅ JWT-based Authentication
- ✅ MongoDB Integration

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
MONGODB_URI=mongodb://localhost:27017/WCDF-Nepal
NODE_ENV=development
```

4. Start the server:
```bash
npm run server
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to user directory:
```bash
cd user
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Donations
- `POST /api/donation` - Create a donation (Optional auth)

### Bookings
- `POST /api/booking` - Create a booking
- `GET /api/booking` - Get user bookings (Protected)

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Vite
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Development

- Backend: `cd Backend && npm run server`
- Frontend: `cd user && npm run dev`

## Project Status

To date, the project has successfully established the core frontend and backend architecture using the MERN stack. A responsive landing page, home page, and user authentication interfaces (login and signup) have been designed and implemented on the frontend using React and Vite. On the backend, a secure Express server has been configured and connected to MongoDB, with user authentication handled through JWT-based login and registration. A donation subsystem has been developed, including a dedicated donation model, controller, and API routes, supporting validated donation entries with status tracking and optional anonymous donations. API endpoints have been tested using Postman, and frontend–backend integration has been verified. Overall, the foundational structure of the NGO web platform is complete and functional, providing a solid base for advanced features such as payment gateway integration, donor dashboards, and blockchain-based transparency mechanisms in later phases.

## License

ISC

## Author

Final Year Project - WCDF Nepal
