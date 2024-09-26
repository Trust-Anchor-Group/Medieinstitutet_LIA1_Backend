// src/routes/apiRoutes.mjs
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const router = express.Router();

// Helper function to generate nonce
function generateNonce() {
  return crypto.randomBytes(32).toString('base64');
}

// Helper function to sign data
async function sign(secret, data) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('base64');
}

router.post('/create-account', async (req, res) => {
  try {
    const { UserName, EMail, PhoneNr } = req.body;
    const host = process.env.EXTERNAL_API_HOST;
    const ApiKey = process.env.EXTERNAL_API_KEY;
    const Secret = process.env.EXTERNAL_API_SECRET;
    const Password = process.env.EXTERNAL_NEURON_PASSWORD;
    const Seconds = 3600; // Default to 1 hour
    const Nonce = generateNonce();

    // Construct the string to be signed
    const s = PhoneNr
      ? `${UserName}:${host}:${EMail}:${PhoneNr}:${Password}:${ApiKey}:${Nonce}`
      : `${UserName}:${host}:${EMail}:${Password}:${ApiKey}:${Nonce}`;

    // Sign the string
    const signature = await sign(Secret, s);

    // Prepare the request payload
    const payload = {
      userName: UserName,
      eMail: EMail,
      phoneNr: PhoneNr,
      password: Password,
      apiKey: ApiKey,
      nonce: Nonce,
      signature: signature,
      seconds: Seconds
    };

    // Construct the correct URL
    const url = `https://${host}/Agent/Account/Create`;
    console.log('Attempting to call external API at:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Make the API call
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ! Remove logging once satisifed with the implementation
    console.log('External API Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating account:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    res.status(error.response?.status || 500).json({
      error: 'An error occurred while creating the account',
      details: error.response?.data || error.message,
    });
  }
});

export default router;