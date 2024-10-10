// src/services/externalApiServices.mjs

import crypto from 'crypto';
import config from '../config/config.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

function generateNonce() {
    return crypto.randomBytes(32).toString('base64');
}

async function sign(key, data) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(data);
    return hmac.digest('base64');
}

export const createAccount = async (userData) => {
    const { username, email, phoneNr, password } = userData;
    const { host, key: apiKey, secret: Secret } = config.externalApi;
    const seconds = 3600;
    const nonce = generateNonce();

    const s = phoneNr
        ? `${username}:${host}:${email}:${phoneNr}:${password}:${apiKey}:${nonce}`
        : `${username}:${host}:${email}:${password}:${apiKey}:${nonce}`;

    const signature = await sign(Secret, s);

    const payload = {
        userName: username,
        eMail: email,
        phoneNr,
        password,
        apiKey,
        nonce,
        signature,
        seconds
    };

    const url = `https://${host}/Agent/Account/Create`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorBody;

            if (contentType && contentType.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }

            throw new ErrorResponse(response.status, errorBody.message || errorBody, 'external');
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;
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
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${jwt}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {

            const contentType = response.headers.get('Content-Type');
            let errorBody;
            if (contentType && contentType.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }
            throw new ErrorResponse(response.status, errorBody.message || errorBody, 'external');
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;
    }
}

export const loginService = async (userData) => {
    const { host } = config.externalApi;
    const { username, password } = userData;
    const url = `https://${host}/Agent/Account/Login`;
    const nonce = generateNonce();
    const s = `${username}:${host}:${nonce}`;
    const key = Buffer.from(password, 'utf-8');
    const data = Buffer.from(s, 'utf-8');
    const h = await sign(key, data);

    const payload = {
        userName: username,
        nonce,
        signature: h,
        seconds: '3600'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorBody;
            if (contentType && contentType.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }
            throw new ErrorResponse(response.status, errorBody.message || errorBody, 'external');
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;
    }
};


export const authenticateJwt = async (jwt) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Account/AuthenticateJwt`;
    const payload = { token: jwt };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorBody;
            if (contentType && contentType.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }
            throw new ErrorResponse(response.status, errorBody.message || errorBody, 'external');
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;

    }
}

export const userInfo = async (jwt) => {

    const url = `https://${host}/Agent/Account/Info`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': jwt
            }
        });

        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorBody;
            if (contentType && contentType.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }
            throw new ErrorResponse(response.status, errorBody.message || errorBody, 'external');
        }

        const responseData = await response.json();
        return responseData;

    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;

    }

};