import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createAccount, verifyEmailService } from "../services/externalApiServices.mjs";

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
    try {
        const accountData = await createAccount(req.body);
        res.status(201).json(new ResponseModel(201, 'Account registred', accountData));
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
    // console.log('Header', req.headers);
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        throw new ErrorResponse(401, 'Authorization header is missing');
    }

    const [bearer, jwt] = authHeader.split(' ');
    //console.log('token:', bearer, jwt);

    if (bearer !== 'Bearer' || !jwt) {
        throw new ErrorResponse(401, 'Invalid authorization header format', 'internal');
    }

    try {
        const verificationData = await verifyEmailService(email, code, jwt);
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
    res.status(200).json({
        success: true,
        message: 'Login Successful'
    });
});