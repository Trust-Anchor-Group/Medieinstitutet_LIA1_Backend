import ErrorResponse from '../models/ErrorResponseModel.mjs';
import { authenticateJwt } from '../services/externalApiServices.mjs';

export const protect = async (req, res, next) => {

    const cookie = req.cookies.auth;
    let cookieData;

    if (cookie) {
        try {
            cookieData = JSON.parse(cookie);
        } catch (error) {
            throw new ErrorResponse(401, 'Invalid cookie data', 'internal');
        }
    }

    try {
        await authenticateJwt(cookieData.jwt);
    } catch (error) {
        next(error);
    }

    next();
};