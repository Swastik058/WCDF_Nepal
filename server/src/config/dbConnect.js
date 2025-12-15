const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/WCDF-Nepal';
        await mongoose.connect(mongoURI);
        console.log("Database connection successful");
    } catch (error) {
        console.log('Database error:', error.message);
        process.exit(1);
    }
}

module.exports = dbConnect;