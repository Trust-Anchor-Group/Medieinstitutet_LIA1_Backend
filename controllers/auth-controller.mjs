import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createAccount, verifyEmailService, loginService, userInfo, refresh, getIds, getIdReqAttributes, fetchAlgorithms, createId, getKeyData, createKey } from "../services/externalApiServices.mjs";
import CookieHandler from "../utilities/CookieHandler.mjs";
import generateHash from "../utilities/hashUtils.mjs";
import config from "../config/config.mjs";
import userEvents from '../events/UserEvents.mjs';


/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
    try {
        const response = await createAccount(req.body);

        const cookie = new CookieHandler(res);
        const { jwt } = response;
        cookie.setCookie('registration', { jwt });

        res.status(201).json(new ResponseModel(201, 'Account registred', response));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Email verification
 * @route POST /api/v1/auth/verify-email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;

    let cookie = req.cookies.registration;
    let cookieData;

    if (cookie) {
        try {
            cookieData = JSON.parse(cookie);
        } catch (error) {
            throw new ErrorResponse(401, 'Invalid cookie data', 'internal');
        }
    } else {
        throw new ErrorResponse(401, 'Activation period has expired. Please request a new activation code.');
    }

    try {
        const verificationData = await verifyEmailService(email, code, cookieData.jwt);
        cookie = new CookieHandler(res);
        cookie.deleteCookie('registration');
        res.status(200).json(new ResponseModel(200, 'Email verified successfully', verificationData));
    } catch (error) {
        next(error);
    }

});

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res, next) => {

    try {
        // Authenticate user
        const response = await loginService(req.body);

        // Set auth cookie
        const cookie = new CookieHandler(res);
        cookie.setCookie('auth', {
            jwt: response.jwt,
            expires: response.expires
        });

        userEvents.loginUser({
            request: req.body,
            response
        });

        res.status(200).json(new ResponseModel(200, 'Login successful', { expires: response.expires }));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Logout user
 * @route GET /api/v1/auth/logout
 * @access Public
 */
export const logout = asyncHandler(async (req, res, next) => {
    const cookie = new CookieHandler(res);
    cookie.deleteCookie('auth');
    res.status(200).json(new ResponseModel(200, 'Logout successful', {}));
});

/**
 * @desc Get user info
 * @route GET /api/v1/auth/account-info
 * @access Private
 */
export const accountInfo = asyncHandler(async (req, res, next) => {

    const cookie = req.cookies.auth;
    let cookieData = JSON.parse(cookie);

    try {
        const userData = await userInfo(cookieData.jwt);
        const userIDs = await getIds(cookieData.jwt);
        const payload = { ...userData, id: userIDs.Identities[userIDs.Identities.length - 1].id }
        res.status(200).json(new ResponseModel(200, 'User info', payload));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Check if users session is authenticated
 * @route GET /api/v1/auth/auth-check
 * @access Private
 */
export const checkSession = asyncHandler(async (req, res, next) => {
    const cookie = req.cookies.auth;
    let cookieData = JSON.parse(cookie);
    res.status(200).json(new ResponseModel(200, 'User is authenticated', {
        authenticated: true,
        expires: cookieData.expires
    }));
});

/**
 * @desc Refresh the access token
 * @route GET /api/v1/auth/refresh
 * @access Private
 */
export const refreshToken = asyncHandler(async (req, res, next) => {

    const seconds = 3600;
    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);

    try {
        const response = await refresh(cookieData.jwt, seconds);
        const cookie = new CookieHandler(res);
        cookie.setCookie('auth', {
            jwt: response.jwt,
            expires: response.expires
        });
        res.status(200).json(new ResponseModel(200, 'Access token refreshed', response));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Get users IDs
 * @route GET /api/v1/auth/ids
 * @access Private
 */
export const ids = asyncHandler(async (req, res, next) => {

    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);

    try {
        const response = await getIds(cookieData.jwt);
        res.status(200).json(new ResponseModel(200, 'Ids fetched', response));
    } catch (error) {
        next(error);
    }

});

/**
 * @desc Get input fields attributes for ID creation
 * @route GET /api/v1/auth/id-req-attr
 * @access Private
 */
export const getReqIdAttr = asyncHandler(async (req, res, next) => {

    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);

    try {
        const response = await getIdReqAttributes(cookieData.jwt);
        res.status(200).json(new ResponseModel(200, 'Fetched required attributes', response));
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Get algorithms
 * @route GET /api/v1/auth/algorithms
 * @access Private
 */
export const getAlgorithms = asyncHandler(async (req, res, next) => {

    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);

    try {
        const response = await fetchAlgorithms(cookieData.jwt);
        res.status(200).json(new ResponseModel(200, 'Fetched algorithms', response))
    } catch (error) {
        next(error);
    }

});

/**
 * @desc Register a new ID
 * @route GET /api/v1/auth/id-register
 * @access Private
 */
export const registerId = asyncHandler(async (req, res, next) => {
    const { username, email, password, ...rest } = req.body;
    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);


    // Generate the users key password and key username
    const userKeyId = generateHash(config.keyIdSalt, email, username);
    const userKeyPassword = generateHash(config.keyPasswordSalt, email, username);

    try {
        let response = await getKeyData(userKeyId, cookieData.jwt);
        const { localName, namespace } = response.Algorithm;

        const payload = {
            referer: req.headers.referer,
            username,
            jwt: cookieData.jwt,
            localname: localName,
            namespace,
            userKeyId,
            userKeyPassword,
            password,
            properties: {
                ...rest
            }
        }

        response = await createId(payload);
        res.status(200).json(new ResponseModel(200, 'New ID created', response));

    } catch (error) {
        next(error);
    }

});

/**
 * @desc Check if key exists
 * @access Private
 */
const keyCheck = asyncHandler(async (req, res, next) => {
    const { username, email } = req.body;
    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);

    // Generate the users key id
    const userKeyId = generateHash(config.keyIdSalt, email, username);

    try {
        const response = await getKeyData(userKeyId, cookieData.jwt);
        if (response.ok) {
            res.status(200).json(new ResponseModel(200, 'Key found', response));
        }
    } catch (error) {
        next(error);
    }
});

/**
 * @desc Register a new key and username
 * @access Private
 */
const generateKey = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    const cookieAuth = req.cookies.auth;
    const cookieData = JSON.parse(cookieAuth);

    // Generate the users key password and key username
    const userKeyId = generateHash(config.keyIdSalt, email, username);
    const userKeyPassword = generateHash(config.keyPasswordSalt, email, username);

    // Get the strongest algorithm
    response = await fetchAlgorithms(cookieData.jwt);
    const strongestAlgorithm = response.Algorithms
        .filter(algorithm => algorithm.safe)
        .sort((a, b) => b.securityStrength - a.securityStrength || b.score - a.score)[0] || null;

    const { localName, namespace } = strongestAlgorithm;

    const payload = {
        jwt: cookieData.jwt,
        localName,
        namespace,
        userKeyId,
        userKeyPassword,
        username,
        password
    };


    try {
        const response = await createKey(payload);
        res.status(200).json(new ResponseModel(200, 'New key created', response));
    } catch (error) {
        next(error);
    }

});