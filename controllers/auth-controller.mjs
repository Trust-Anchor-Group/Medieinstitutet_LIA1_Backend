import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ResponseModel from "../models/ResponseModel.mjs";
import { createAccount } from "../services/externalApiServices.mjs";

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
    try{
        const accountData = await createAccount(req.body);
        res.status(201).json(new ResponseModel(200, accountData));
    } catch (error){
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || error.message || 'An error occured while creating the account';
        res.status(statusCode).json(new ResponseModel(statusCode, { error: errorMessage }));
    }
});

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res, next) => {
    res.status(200).json(new ResponseModel(200, 'Login Successful'));
});