// src/routes/apiRoutes.mjs
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route for calling a third-party API
router.get('/data', async (req, res) => {
  try {
    // Attempt to fetch data from an external API
    const response = await axios.get('https://api.example.com/data'); // ! TAG API URL TEST
    
    // The data is already parsed in the response.data property
    const data = response.data;
    
    // Send the parsed data back to the client
    res.json(data);
  } catch (error) {
    // Log any errors that occur during the API call
    console.error('Error fetching data:', error);
    
    // Send a 500 Internal Server Error status with an error message
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

export default router;