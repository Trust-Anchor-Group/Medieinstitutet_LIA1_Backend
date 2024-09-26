// src/server.mjs
import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.mjs';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Set the port for the server, use the PORT env variable if available, otherwise default to 3000
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define root route
app.get('/', (req, res) => {
  res.send('Server is up and running - CALL WORKS!');
});

// Use the API routes
app.use('/api', apiRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});