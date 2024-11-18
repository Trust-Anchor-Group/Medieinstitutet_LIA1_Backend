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
                'Authorization': `Bearer ${jwt}`
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
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Account/Info`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({})
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

export const refresh = async (jwt, seconds) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Account/Refresh`;
    const payload = { seconds };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
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

        return await response.json();

    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;

    }
};

export const getIds = async (jwt, offset = null, maxCount = null) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Legal/GetIdentities`;
    const payload = { offset, maxCount };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
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

        return await response.json();
    } catch (error) {
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;
    }
};

/**
 * @desc Create a new smart contract based on a template
 * @param {Object} contractData - Contract creation data
 * @param {string} contractData.templateId - ID of approved template
 * @param {string} contractData.visibility - Contract visibility (CreatorAndParts|DomainAndParts|Public|PublicSearchable)
 * @param {Array} contractData.Parts - Array of contract participants
 * @param {Object} contractData.Parameters - Contract parameters
 * @param {string} jwt - Authentication token
 * @returns {Promise<Object>} Contract object generated by the server
 */
export const createContract = async (contractData, jwt) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Legal/CreateContract`;
    
    try {
        // Create a new object to avoid modifying the input directly
        const formattedData = {
            ...contractData,
            // Transform Parts array to use legalId instead of id
            Parts: contractData.Parts?.map(part => ({
                role: part.role,
                legalId: part.id  // Convert 'id' to 'legalId'
            })) || []
        };

        console.log("External API Service: Sending request to:", url);
        console.log("External API Service: Request payload:", JSON.stringify(formattedData, null, 2));
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(formattedData)  // Send formatted data
        });

        // Rest of the function remains the same...
        if (!response.ok) {
            const contentType = response.headers.get('Content-Type');
            let errorBody;
            
            if (contentType && contentType.includes('application/json')) {
                errorBody = await response.json();
            } else {
                errorBody = await response.text();
            }
            
            console.error('Contract creation failed:', {
                status: response.status,
                error: errorBody,
                sentData: formattedData
            });
            
            console.log("External API Service: Error response:", errorBody);
            throw new ErrorResponse(response.status, errorBody.message || errorBody, 'external');
        }

        const responseData = await response.json();
        console.log("External API Service: Successful response:", responseData);
        return responseData;

    } catch (error) {
        console.log("External API Service: Caught error:", error);
        console.error('Contract creation error:', error);
        
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;
    }
};

/**
 * @desc Get contract details from the external API
 * @param {string} contractId - Identity of the Smart Contract to get
 * @param {string} [format] - Optional format for human-readable texts
 * @param {string} jwt - Authentication token
 * @returns {Promise<Object>} Contract object
 */
export const getContract = async (contractId, format, jwt) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Legal/GetContract`;
    
    const payload = {
        contractId,
        ...(format && { format }) // Only include format if provided
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
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

        return await response.json();
    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;

    }

}

export const getIdReqAttributes = async (jwt) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Legal/GetApplicationAttributes`;
    const payload = {}

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(contractData)
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
        console.log("External API Service: Caught error:", error);
        console.error('Contract creation error:', error);
        
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }
        throw error;
    }
}

export const fetchAlgorithms = async (jwt) => {

    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Crypto/GetAlgorithms`;
    const payload = {}

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
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
            throw new ErrorResponse(response.status, errorBody.message || 'An unexpected error occurred', 'external')
        }

        return await response.json();

    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;

    }

}

export const createId = async (data) => {
    const { host } = config.externalApi;
    const { jwt, referer, username, userKeyId, userKeyPassword, localname, namespace, properties, password } = data;
    const url = `https://${host}/Agent/Legal/ApplyId`;
    const nonce = generateNonce();

    // Calculating the Key Signature
    const s1 = `${username}:${host}:${localname}:${namespace}:${userKeyId}`;
    const Key1 = Buffer.from(userKeyPassword, 'utf-8');
    const Data1 = Buffer.from(s1, 'utf-8');
    const H1 = await sign(Key1, Data1);
    const keySignature = H1.toString('base64');

    // Calculating the Request Signature
    let s2 = `${s1}:${keySignature}:${nonce}`;
    for (const [name, value] of Object.entries(properties)) {
        s2 += `:${name}:${value}`;
    }

    const Key2 = Buffer.from(password, 'utf-8');
    const Data2 = Buffer.from(s2, 'utf-8');
    const H2 = await sign(Key2, Data2);
    const requestSignature = H2.toString('base64');

    const payload = {
        keyId: userKeyId,
        nonce,
        keySignature,
        requestSignature,
        Properties: Object.entries(properties).map(([name, value]) => ({
            name,
            value
        }))
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
                'Referer': referer
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
            console.log('errorbody', errorBody);
            throw new ErrorResponse(response.status, errorBody.message || 'An unexpected error occurred', 'external')
        }

        return await response.json();
    } catch (error) {

        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;
    }

}

export const getKeyData = async (keyId, jwt) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Crypto/GetPublicKey`;
    const payload = { keyId }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
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
            throw new ErrorResponse(response.status, errorBody.message || 'An unexpected error occurred', 'external')
        }

        return await response.json();
    } catch (error) {
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;
    }
}

export const createKey = async (data) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Crypto/CreateKey`;
    const { jwt, username, password, userKeyId, userKeyPassword, localName, namespace } = data;
    const nonce = generateNonce();

    const s1 = `${username}:${host}:${localName}:${namespace}:${userKeyId}`;
    const Key1 = Buffer.from(userKeyPassword, 'utf-8');
    const Data1 = Buffer.from(s1, 'utf-8');
    const H1 = await sign(Key1, Data1);
    const keySignature = H1.toString('base64');

    const s2 = `${s1}:${keySignature}:${nonce}`;
    const Key2 = Buffer.from(password, 'utf-8');
    const Data2 = Buffer.from(s2, 'utf-8');
    const H2 = await sign(Key2, Data2);
    const requestSignature = H2.toString('base64');

    const payload = {
        localName,
        namespace,
        id: userKeyId,
        nonce,
        keySignature,
        requestSignature,
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
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
            throw new ErrorResponse(response.status, errorBody.message || 'An unexpected error occurred', 'external')
        }

        return await response.json();
    } catch (error) {
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;
    }
}

export const getIdentity = async (id, jwt) => {
    const { host } = config.externalApi;
    const url = `https://${host}/Agent/Legal/GetIdentity`;
    const payload = {
        legalId: id
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`,
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

            console.log('errorbody', errorBody);
            throw new ErrorResponse(response.status, errorBody.message || 'An unexpected error occurred', 'external')
        }

        return await response.json();
    } catch (error) {
        if (!(error instanceof ErrorResponse)) {
            throw new ErrorResponse(500, error.message || 'An unexpected error occurred', 'external');
        }

        throw error;
    }

}
