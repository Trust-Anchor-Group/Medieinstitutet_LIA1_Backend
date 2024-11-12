const loginStatus = new Set();
import { userInfo, getKeyData, fetchAlgorithms, createKey } from '../services/externalApiServices.mjs';
import config from '../config/config.mjs';
import generateHash from './hashUtils.mjs';

const keyChecker = async (data) => {
    const { username, password } = data.request;
    const { jwt } = data.response;

    if (!loginStatus.has(username)) {
        await checkKey(username, password, jwt);
        loginStatus.add(username);
    }
}

const checkKey = async (username, password, jwt) => {

    try {
        const { eMail: email } = await userInfo(jwt);
        const keyCredentials = generateKeyCredentials(email, username);
        await handleKeyCreation(keyCredentials, jwt, username, password);
    } catch (error) {
        console.error('Key operation failed:', error);
    }

}

const generateKeyCredentials = (email, username) => {
    return {
        userKeyId: generateHash(config.keyIdSalt, email, username),
        userKeyPassword: generateHash(config.keyPasswordSalt, email, username)
    }
}

const handleKeyCreation = async (credentials, jwt, username, password) => {
    const { userKeyId, userKeyPassword } = credentials;

    try {
        await getKeyData(userKeyId, jwt);
        return; // Key exists, nothing to do
    } catch {
        // Key doesn't exist, create new one
        const algorithm = await getStrongestAlgorithm(jwt);
        await createKey({
            jwt,
            ...algorithm,
            userKeyId,
            userKeyPassword,
            username,
            password
        });
    }
}

const getStrongestAlgorithm = async (jwt) => {
    const response = await fetchAlgorithms(jwt);

    const { Algorithms } = response;
    if (!Array.isArray(Algorithms) || Algorithms.length === 0) {
        throw new Error('No algorithms available');
    }

    const algorithm = Algorithms
        .filter(algorithm => algorithm.safe)
        .sort((a, b) => b.securityStrength - a.securityStrength || b.score - a.score)[0];

    if (!algorithm) {
        throw new Error('No safe algorithm found');
    }

    return {
        localName: algorithm.localName,
        namespace: algorithm.namespace
    };
};

export default keyChecker;