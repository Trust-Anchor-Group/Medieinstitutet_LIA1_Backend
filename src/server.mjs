// src/server.mjs
// Import required modules
import express from 'express'; // Express framework for building the web server
import dotenv from 'dotenv'; // For loading environment variables
import axios from 'axios'; // For making HTTP requests to external APIs

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
  res.send('Hello World!'); // Send a simple response for the root path
});

// Example route for calling a third-party API
app.get('/api/data', async (req, res) => {
  try {
    // Attempt to fetch data from an external API
    const response = await axios.get('https://api.example.com/data');
    
    // Parse the JSON response
    const data = await response.json();
    
    // Send the parsed data back to the client
    res.json(data);
  } catch (error) {
    // Log any errors that occur during the API call
    console.error('Error fetching data:', error);
    
    // Send a 500 Internal Server Error status with an error message
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log a message when the server starts successfully
});