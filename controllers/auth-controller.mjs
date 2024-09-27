import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
    res.status(200).json(new ResponseModel(200, 'Registration Successful'));
});

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res, next) => {
    res.status(200).json(new ResponseModel(200, 'Login Successful'));
});