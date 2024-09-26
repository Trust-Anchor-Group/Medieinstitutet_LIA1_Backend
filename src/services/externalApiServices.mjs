// src/services/externalApiService.mjs
import axios from 'axios';
import crypto from 'crypto';
import config from '../config/config.mjs';

// Generates a nonce for API Calls
function generateNonce() {
  return crypto.randomBytes(32).toString('base64');
}

// Signs the data with HMAC SHA256 (Double check if this was an OK! algorithm to use)
async function sign(secret, data) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('base64');
}

// Function to create an account using the external API
export async function createAccount(userData) {
  const { UserName, EMail, PhoneNr } = userData;
  const { host, key: ApiKey, secret: Secret, neuronPassword: Password } = config.externalApi;
  const Seconds = 3600;
  const Nonce = generateNonce();

  // Construct data string for signature based on presence of PhoneNr
  const s = PhoneNr
    ? `${UserName}:${host}:${EMail}:${PhoneNr}:${Password}:${ApiKey}:${Nonce}`
    : `${UserName}:${host}:${EMail}:${Password}:${ApiKey}:${Nonce}`;

  const signature = await sign(Secret, s);

  // Prepare payload for API call
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

  // Make POST request to create account
  const url = `https://${host}/Agent/Account/Create`;
  
  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data; // Return the API response data
}