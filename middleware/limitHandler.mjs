import rateLimit from "express-rate-limit";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import ResponseModel from "../models/ResponseModel.mjs";


// Todo: look over them and set appropriate limits
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    handler: (req, res, next) => {
        res.status(429).json(new ResponseModel(429, 'Too many requests, please try again later'));
    }
});

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 5, // Limit each IP to 5 login requests
    handler: (req, res, next) => {
        res.status(429).json(new ResponseModel(429, 'Too many login attempts, please try again later'));
    }
});

export const registerLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 5, // Limit each IP to 5 register requests
    handler: (req, res, next) => {
        res.status(429).json(new ResponseModel(429, 'Too many registration requests, please try again later'));
    }
});