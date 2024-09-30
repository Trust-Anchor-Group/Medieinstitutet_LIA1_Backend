// src/services/externalApiServices.mjs
import axios from 'axios';
import crypto from 'crypto';
import config from '../config/config.mjs';

function generateNonce() {
  return crypto.randomBytes(32).toString('base64');
}

async function sign(secret, data) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('base64');
}

export async function createAccount(userData) {
  const { UserName, EMail, PhoneNr, Password } = userData;
  const { host, key: ApiKey, secret: Secret } = config.externalApi;
  const Seconds = 3600;
  const Nonce = generateNonce();

  const s = PhoneNr
    ? `${UserName}:${host}:${EMail}:${PhoneNr}:${Password}:${ApiKey}:${Nonce}`
    : `${UserName}:${host}:${EMail}:${Password}:${ApiKey}:${Nonce}`;

  const signature = await sign(Secret, s);

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

  const url = `https://${host}/Agent/Account/Create`;
  
  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
}

export async function verifyEmailService(email, code) {
  const { host } = config.externalApi;

  const payload = {
    eMail: email,
    code: parseInt(code, 10)
  };

  const url = `https://${host}/Agent/Account/VerifyEMail`;
  
  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
}