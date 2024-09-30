import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import { createAccount, verifyEmailService } from "../services/externalApiServices.mjs";

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
    const accountData = await createAccount(req.body);
    res.status(201).json({
        success: true,
        data: accountData
    });
});

/**
 * @desc Email verification
 * @route POST /api/v1/auth/verify-email
 * @access Public
 */
export const verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, code } = req.body;
    const verificationData = await verifyEmailService(email, code);
    res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: verificationData
    });
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