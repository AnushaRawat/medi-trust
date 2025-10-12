import dotenv from "dotenv";
dotenv.config();
import app from './app';
import connectDB from './config/db';

// Ensure the PORT is a valid number
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Connect to the database and start the server
connectDB().then(() => {
  // Bind the server to '0.0.0.0' and start it on the given PORT
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://192.168.x.x:${PORT}`);  // Replace with your actual local IP address
  });
});