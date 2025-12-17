const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');


// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
dbConnect();

// Routes
const authRoutes = require('./routes/AuthRoutes');
app.use('/api/auth', authRoutes);

const donationRoutes = require('./routes/DonationRoutes');
app.use('/api/donation', donationRoutes);


// Khalti routes
const khaltiRoutes = require("./routes/khaltiRoutes");
app.use("/api/khalti", khaltiRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('WCDF NGO Backend is running!');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
