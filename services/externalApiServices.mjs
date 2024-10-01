// src/services/externalApiServices.mjs

import axios from 'axios';
import crypto from 'crypto';
import config from '../config/config.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

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
    
    try {
        const response = await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        throw new ErrorResponse(error.response?.data?.error || 'Failed to create account', error.response?.status || 500);
    }
}

export async function verifyEmailService(email, code, jwt) {
    const { host } = config.externalApi;

    const payload = {
        eMail: email,
        code: parseInt(code, 10)
    };

    const url = `https://${host}/Agent/Account/VerifyEMail`;
    
    try {
        const response = await axios.post(url, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${jwt}`
            }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            //console.error('Email verification error:', error.response?.data || error.message);
            throw new ErrorResponse(error.response.status, error.response.data.error || 'Failed to verify email');
        } else if (error.request) {
            // The request was made but no response was received
            throw new ErrorResponse(500, 'No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new ErrorResponse(500, 'Error setting up the request');
        }
    }
}